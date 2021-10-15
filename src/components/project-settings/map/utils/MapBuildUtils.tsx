import { Point, PolygonType, Segment } from "../../../../dto/PolygonType";
import { GuideLineType } from "../../../../dto/GuideLineType";
import { ViewBoxScale } from "../Canvas";

const eps = Math.pow(2, -9);
export const GUIDE_LINE_HIDDEN_POLYGON_WIDTH = 5;

export const pointsAreClose = (
  p1: Point | null,
  p2: Point | null,
  currentScale: number
): boolean => {
  if (!p1 || !p2) {
    return false;
  }
  return (
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y) <=
    90 / currentScale
  );
};

export function findLinePolygonIntersection(
  p1: Point,
  p2: Point,
  polygonEdges: SVGPointList
): any {
  let result;
  for (let i = 0; i < polygonEdges.numberOfItems - 1; i++) {
    let intersection: any = findLineIntersection(
      { startPoint: p1, endPoint: p2 },
      {
        startPoint: polygonEdges.getItem(i),
        endPoint: polygonEdges.getItem(i + 1),
      }
    );
    if (intersection.onLine1 && intersection.onLine2) {
      if (
        !result ||
        (intersection.x - p2.x) * (intersection.x - p2.x) +
          (intersection.y - p2.y) * (intersection.y - p2.y) <
          (result.x - p2.x) * (result.x - p2.x) +
            (result.y - p2.y) * (result.y - p2.y)
      ) {
        result = intersection;
      }
    }
  }

  if (!result) {
    let intersection = findLineIntersection(
      { startPoint: p1, endPoint: p2 },
      {
        startPoint: polygonEdges.getItem(0),
        endPoint: polygonEdges.getItem(polygonEdges.length - 1),
      }
    );
    if (intersection.onLine1 && intersection.onLine2) {
      result = intersection;
    }
  }
  return result;
}

export function calculateProjectionPoint(
  pointOfSegment1: Point,
  pointOfSegment2: Point,
  mousePoint: Point
) {
  let r: Point = { x: 0, y: 0 };
  if (
    pointOfSegment1.y == pointOfSegment2.y &&
    pointOfSegment1.x == pointOfSegment2.x
  )
    pointOfSegment1.y -= 0.00001;

  let U =
    (mousePoint.y - pointOfSegment1.y) *
      (pointOfSegment2.y - pointOfSegment1.y) +
    (mousePoint.x - pointOfSegment1.x) *
      (pointOfSegment2.x - pointOfSegment1.x);

  const Udenom =
    Math.pow(pointOfSegment2.y - pointOfSegment1.y, 2) +
    Math.pow(pointOfSegment2.x - pointOfSegment1.x, 2);

  U /= Udenom;

  r.y = pointOfSegment1.y + U * (pointOfSegment2.y - pointOfSegment1.y);
  r.x = pointOfSegment1.x + U * (pointOfSegment2.x - pointOfSegment1.x);

  let minx, maxx, miny, maxy;

  minx = Math.min(pointOfSegment1.y, pointOfSegment2.y);
  maxx = Math.max(pointOfSegment1.y, pointOfSegment2.y);

  miny = Math.min(pointOfSegment1.x, pointOfSegment2.x);
  maxy = Math.max(pointOfSegment1.x, pointOfSegment2.x);

  const isValid = r.y >= minx && r.y <= maxx && r.x >= miny && r.x <= maxy;

  return isValid ? r : null;
}

export function findIndexOfClosestPointToSelect(
  points: Point[],
  coordinates: { x: number; y: number },
  currentScale: number
): number {
  const pointsArr = [...points];

  const { x, y } = coordinates;
  for (let i = 0; i < pointsArr.length; i++) {
    if (pointsAreClose(pointsArr[i], { x, y }, currentScale)) {
      return i;
    }
  }
  return -1;
}

export function findClosestSegment(
  polygon: PolygonType,
  point: Point,
  currentScale: number
): Segment | null {
  for (let i = 0; i < polygon.points.length - 1; i++) {
    if (
      pointsAreClose(
        calculateProjectionPoint(
          polygon.points[i],
          polygon.points[i + 1],
          point
        ),
        point,
        currentScale
      )
    ) {
      return {
        sides: [polygon.points[i], polygon.points[i + 1]],
        isLastSegment: false,
        polygon,
      };
    }
  }

  if (
    pointsAreClose(
      calculateProjectionPoint(
        polygon.points[0],
        polygon.points[polygon.points.length - 1],
        point
      ),
      point,
      currentScale
    )
  ) {
    return {
      sides: [polygon.points[0], polygon.points[polygon.points.length - 1]],
      isLastSegment: true,
      polygon,
    };
  }
  return null;
}

type Line = {
  startPoint: Point;
  endPoint: Point;
};

type Intersection = {
  x: number | null;
  y: number | null;
  onLine1: boolean;
  onLine2: boolean;
};

export function findLineIntersection(line1: Line, line2: Line) {
  // if the lines intersect, the result contains the x and y of the intersection
  // (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
  let denominator,
    a,
    b,
    numerator1,
    numerator2,
    result: Intersection = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false,
    };
  denominator =
    (line2.endPoint.y - line2.startPoint.y) *
      (line1.endPoint.x - line1.startPoint.x) -
    (line2.endPoint.x - line2.startPoint.x) *
      (line1.endPoint.y - line1.startPoint.y);
  if (denominator < eps && denominator > -eps) {
    return result;
  }
  a = line1.startPoint.y - line2.startPoint.y;
  b = line1.startPoint.x - line2.startPoint.x;
  numerator1 =
    (line2.endPoint.x - line2.startPoint.x) * a -
    (line2.endPoint.y - line2.startPoint.y) * b;
  numerator2 =
    (line1.endPoint.x - line1.startPoint.x) * a -
    (line1.endPoint.y - line1.startPoint.y) * b;
  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  result.x = line1.startPoint.x + a * (line1.endPoint.x - line1.startPoint.x);
  result.y = line1.startPoint.y + a * (line1.endPoint.y - line1.startPoint.y);

  if (a >= 0 - eps && a <= 1 + eps) {
    result.onLine1 = true;
  }

  if (b >= 0 - eps && b <= 1 + eps) {
    result.onLine2 = true;
  }

  return result;
}

export function getViewBoxEdges(viewBoxScale: ViewBoxScale) {
  return {
    topEdge: {
      point1: { x: viewBoxScale.point1.x, y: viewBoxScale.point1.y },
      point2: { x: viewBoxScale.point2.x, y: viewBoxScale.point1.y },
    },
    bottomEdge: {
      point1: { x: viewBoxScale.point1.x, y: viewBoxScale.point2.y },
      point2: { x: viewBoxScale.point2.x, y: viewBoxScale.point2.y },
    },
    leftEdge: {
      point1: { x: viewBoxScale.point1.x, y: viewBoxScale.point1.y },
      point2: { x: viewBoxScale.point1.x, y: viewBoxScale.point2.y },
    },
    rightEdge: {
      point1: { x: viewBoxScale.point2.x, y: viewBoxScale.point1.y },
      point2: { x: viewBoxScale.point2.x, y: viewBoxScale.point2.y },
    },
  };
}

function isIntersectionPointOnViewBoxEdge(
  intersection: Intersection,
  viewBoxScale: ViewBoxScale
) {
  return (
    intersection.x! >= viewBoxScale.point1.x &&
    intersection.x! <= viewBoxScale.point2.x &&
    intersection.y! >= viewBoxScale.point1.y &&
    intersection.y! <= viewBoxScale.point2.y
  );
}

export const calculateCanvasIntersectionPoints = (
  guideLine: GuideLineType,
  viewBoxScale: ViewBoxScale
): Point[] => {
  const line = { ...guideLine };
  const result = [] as Point[];

  if (!line.linePoints.point1) {
    line.linePoints.point1 = { x: 0, y: 0 };
  }

  if (!line.linePoints.point2) {
    line.linePoints.point2 = line.linePoints.point1;
  }

  const viewBoxEdges = getViewBoxEdges(viewBoxScale);

  for (const value of Object.values(viewBoxEdges)) {
    const intersection = findLineIntersection(
      { startPoint: value.point1, endPoint: value.point2 },
      { startPoint: line.linePoints.point1, endPoint: line.linePoints.point2 }
    );

    if (intersection && intersection.x !== null && intersection.y !== null) {
      if (isIntersectionPointOnViewBoxEdge(intersection, viewBoxScale)) {
        result.push({ x: intersection.x!, y: intersection.y! });
      }
    }
  }
  return result;
};

export function isLineClose(
  line: GuideLineType,
  clickPoint: Point,
  currentScale: number
): boolean {
  return !!(
    line.linePoints.point1 &&
    line.linePoints.point2 &&
    pointsAreClose(
      calculateProjectionPoint(
        line.linePoints.point1,
        line.linePoints.point2,
        clickPoint
      ),
      clickPoint,
      currentScale
    )
  );
}

// export function calculateGuideLineHiddenPolygon(
//   line: GuideLineType,
//   viewBoxScale: ViewBoxScale
// ) {
//   const k =
//     (line.linePoints.point1!.y - line.linePoints.point2!.y) /
//     (line.linePoints.point1!.x - line.linePoints.point2!.x);
//   let absDx: number, dx: number, dy: number;
//
//   if (Math.abs(k) <= 0.01) {
//     dy = GUIDE_LINE_HIDDEN_POLYGON_WIDTH;
//     dx = 0;
//     absDx = dx;
//   } else if (Math.abs(k) > 10000) {
//     dx = GUIDE_LINE_HIDDEN_POLYGON_WIDTH;
//     absDx = dx;
//     dy = 0;
//   } else {
//     const alpha = Math.PI / 2 - Math.atan(k);
//     dx = GUIDE_LINE_HIDDEN_POLYGON_WIDTH / Math.cos(alpha);
//     absDx = dx >= 0 ? dx : Math.abs(dx);
//     dy = k * absDx;
//   }
//
//   const calculateLeftLineCoordinates = () => {
//     const points: Point[] = [
//       { ...line.linePoints.point1! },
//       { ...line.linePoints.point2! },
//     ];
//
//     for (const point of points) {
//       if (
//         point.x > viewBoxScale.point1.x + 1 &&
//         point.x < viewBoxScale.point2.x - 1
//       ) {
//         if (Math.abs(k) > 0.01) {
//           point.x = point.x - absDx;
//         } else {
//           point.y = point.y - dy;
//         }
//       } else {
//         point.y = point.y - dy;
//       }
//     }
//
//     return points;
//   };
//
//   const leftLineCoordinates = calculateLeftLineCoordinates();
//
//   const calculateRightLineCoordinates = () => {
//     const points: Point[] = [
//       { ...line.linePoints.point1! },
//       { ...line.linePoints.point2! },
//     ];
//
//     for (const point of points) {
//       if (
//         point.x > viewBoxScale.point1.x + 1 &&
//         point.x < viewBoxScale.point2.x - 1
//       ) {
//         if (Math.abs(k) > 0.01) {
//           point.x = point.x + absDx;
//         } else {
//           point.y = point.y + dy;
//         }
//       } else {
//         point.y = point.y + dy;
//       }
//     }
//
//     return points;
//   };
//
//   const rightLineCoordinates = calculateRightLineCoordinates();
//   const polygonCoords: Point[] = [
//     ...leftLineCoordinates,
//     rightLineCoordinates[1],
//     rightLineCoordinates[0],
//   ];
//
//   if (
//     (polygonCoords[0].x === polygonCoords[3].x &&
//       polygonCoords[1].x === polygonCoords[2].x) ||
//     (polygonCoords[0].y === polygonCoords[3].y &&
//       polygonCoords[1].y === polygonCoords[2].y)
//   ) {
//     return polygonCoords;
//   } else {
//     return [
//       polygonCoords[3],
//       polygonCoords[1],
//       polygonCoords[2],
//       polygonCoords[0],
//     ];
//   }
// }

export function calculateGuideLineHiddenScalingPolygon(
  line: GuideLineType,
  viewBoxScale: ViewBoxScale,
  currentScale: number
) {
  const k =
    (line.linePoints.point1!.y - line.linePoints.point2!.y) /
    (line.linePoints.point1!.x - line.linePoints.point2!.x);
  let absDx: number, dx: number, dy: number;

  if (Math.abs(k) <= 0.01) {
    dy = GUIDE_LINE_HIDDEN_POLYGON_WIDTH / currentScale;
    dx = 0;
    absDx = dx;
  } else if (Math.abs(k) > 10000) {
    dx = GUIDE_LINE_HIDDEN_POLYGON_WIDTH / currentScale;
    absDx = dx;
    dy = 0;
  } else {
    const alpha = Math.PI / 2 - Math.atan(k);
    dx = GUIDE_LINE_HIDDEN_POLYGON_WIDTH / Math.cos(alpha) / currentScale;
    absDx = dx >= 0 ? dx : Math.abs(dx);
    dy = k * absDx;
  }

  const calculateLeftLineCoordinates = () => {
    const points: Point[] = [
      { ...line.linePoints.point1! },
      { ...line.linePoints.point2! },
    ];

    for (const point of points) {
      if (
        point.x > viewBoxScale.point1.x + 1 &&
        point.x < viewBoxScale.point2.x - 1
      ) {
        if (Math.abs(k) > 0.01) {
          point.x = point.x - absDx;
        } else {
          point.y = point.y - dy;
        }
      } else {
        point.y = point.y - dy;
      }
    }

    return points;
  };

  const leftLineCoordinates = calculateLeftLineCoordinates();

  const calculateRightLineCoordinates = () => {
    const points: Point[] = [
      { ...line.linePoints.point1! },
      { ...line.linePoints.point2! },
    ];

    for (const point of points) {
      if (
        point.x > viewBoxScale.point1.x + 1 &&
        point.x < viewBoxScale.point2.x - 1
      ) {
        if (Math.abs(k) > 0.01) {
          point.x = point.x + absDx;
        } else {
          point.y = point.y + dy;
        }
      } else {
        point.y = point.y + dy;
      }
    }

    return points;
  };

  const rightLineCoordinates = calculateRightLineCoordinates();
  const polygonCoords: Point[] = [
    ...leftLineCoordinates,
    rightLineCoordinates[1],
    rightLineCoordinates[0],
  ];

  if (
    (polygonCoords[0].x === polygonCoords[3].x &&
      polygonCoords[1].x === polygonCoords[2].x) ||
    (polygonCoords[0].y === polygonCoords[3].y &&
      polygonCoords[1].y === polygonCoords[2].y)
  ) {
    return polygonCoords;
  } else {
    return [
      polygonCoords[3],
      polygonCoords[1],
      polygonCoords[2],
      polygonCoords[0],
    ];
  }
}

export function calculateLineNumber(guideLines: GuideLineType[]) {
  let max = 0;
  for (const line of guideLines) {
    const strings = line.id!.split("-");
    if (strings[2] && parseInt(strings[2]) > max) {
      max = parseInt(strings[2]);
    }
  }

  return `guide-line-${++max}`;
}

export function calculateDistanceBetweenPoints(
  point1: Point,
  point2: Point
): number {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
}

export function calculateLineParametersFromPoints(
  point1: Point,
  point2: Point
) {
  // (y1-y2)x + (x2-x1)y + (x1y2 - x2y1) = 0
  // ax + by + c = 0
  const a = point1.y - point2.y;
  const b = point2.x - point1.x;
  const c = point1.x * point2.y - point2.x * point1.y;
  return { a, b, c };
}

export function calculateDistanceFromPointToGuideLine(
  point: Point,
  line: GuideLineType
): number {
  if (line.lineParameters) {
    return (
      Math.abs(
        line.lineParameters.a * point.x +
          line.lineParameters.b * point.y +
          line.lineParameters.c
      ) /
      Math.sqrt(
        Math.pow(line.lineParameters.a, 2) + Math.pow(line.lineParameters.b, 2)
      )
    );
  } else {
    const projection = calculateProjectionPoint(
      line.linePoints.point1!,
      line.linePoints.point2!,
      point
    );
    return projection
      ? calculateDistanceBetweenPoints(projection, point)
      : Infinity;
  }
}

export function findGuideLineIntersection(
  line1: GuideLineType,
  line2: GuideLineType
): Intersection {
  return findLineIntersection(
    {
      startPoint: line1.linePoints.point1!,
      endPoint: line1.linePoints.point2!,
    },
    { startPoint: line2.linePoints.point1!, endPoint: line2.linePoints.point2! }
  );
}

export function convertScreenToSVGCoordinates(
  screenX: number,
  screenY: number,
  svg: SVGGraphicsElement,
  svgPoint: SVGPoint,
  scale: number,
  translateX: number,
  translateY: number
): DOMPoint | undefined | null {
  // if (!svgPoint) return null; //fallback
  let cursorpt;
  const screenCTM = svg.getScreenCTM();
  const CTM = svg.getCTM();

  if (screenCTM && CTM) {
    svgPoint.x = screenX;
    svgPoint.y = screenY;
    cursorpt = svgPoint.matrixTransform(screenCTM.inverse());
    if (scale !== 1 && Math.abs(CTM.a - screenCTM.a) < 0.001) {
      //not valid behavior, screenCTM scale factor is wrong
      cursorpt.x = cursorpt.x / scale;
      cursorpt.y = cursorpt.y / scale;
    }
  } else if (screenCTM) {
    svgPoint.x = screenX + translateX;
    svgPoint.y = screenY + translateY;
    cursorpt = svgPoint.matrixTransform(screenCTM.inverse());
    cursorpt.x = cursorpt.x / scale;
    cursorpt.y = cursorpt.y / scale;
  }
  return cursorpt;
}

export function findPolygonCenter(polygon: PolygonType): Point {
  const sumPoint: Point = polygon.points.reduce(
    (point1, point2) =>
      ({
        x: point1.x + point2.x,
        y: point1.y + point2.y,
      } as Point)
  );
  return {
    x: sumPoint.x / polygon.points.length,
    y: sumPoint.y / polygon.points.length,
  };
}

export function findMagneticPolygonIntersection(
  mousePoint: Point,
  polygon: PolygonType
): Point {
  const polygonPoints = [...polygon.points];
  if (polygonPoints.length === 0) {
    return mousePoint;
  }
  polygonPoints.push(polygonPoints[0]);
  const center: Point = findPolygonCenter(polygon);
  let intersectionPoint = null;
  let minDistanceBetweenMouseAndInterSection = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < polygonPoints.length - 1; i++) {
    const newIntersectionPoint = findLineIntersection(
      {
        startPoint: mousePoint,
        endPoint: center,
      },
      { startPoint: polygonPoints[i], endPoint: polygonPoints[i + 1] }
    );
    if (
      newIntersectionPoint &&
      newIntersectionPoint.x !== null &&
      newIntersectionPoint.y !== null &&
      newIntersectionPoint.onLine1 &&
      newIntersectionPoint.onLine2 &&
      calculateDistanceBetweenPoints(
        mousePoint,
        newIntersectionPoint as Point
      ) < minDistanceBetweenMouseAndInterSection
    ) {
      intersectionPoint = newIntersectionPoint;
    }
  }

  return intersectionPoint ? (intersectionPoint as Point) : mousePoint;
}
