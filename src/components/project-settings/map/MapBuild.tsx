import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import HouseTooltip from "../../tooltips/HouseTooltip";
import { EditorSettings, HouseDto } from "../../../dto";
import { Canvas, ViewBoxScale } from "./Canvas";
import { Point, PolygonType, Segment } from "../../../dto/PolygonType";
import Alert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";
import {
  calculateLineNumber,
  calculateLineParametersFromPoints,
  calculateProjectionPoint,
  calculateDistanceFromPointToGuideLine,
  findClosestSegment,
  findIndexOfClosestPointToSelect,
  findLinePolygonIntersection,
  isLineClose,
  pointsAreClose,
  findLineIntersection,
  findGuideLineIntersection,
  calculateDistanceBetweenPoints,
  GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
  findMagneticPolygonIntersection,
} from "./utils/MapBuildUtils";
import { GuideLineType } from "../../../dto/GuideLineType";
import { GuideLineTooltip } from "../../tooltips/GuideLineTooltip";
import {
  AUTO_HIDDEN_ALERT_DURATION,
  INITIAL_VIEW_BOX_X_VALUE,
} from "../../../constants/constants";
import { DeletePointTooltip } from "../../tooltips/DeletePointTooltip";
import { AddPointTooltip } from "../../tooltips/AddPointToolTip";
import { DEFAULT_EDITOR_SETTINGS } from "../../../dto/Project";
import { HouseContext } from "../../../context/HouseContext";
import cloneDeep from "clone-deep";
import { useUndoRedo } from "../../../hooks/mapBuildHooks";
import { ToolboxContext } from "../../../context/ToolboxContext";
import { MovePolygonTooltip } from "../../tooltips/MovePolygonToolTip";

export function MapBuild(props: {
  aerialView: string;
  savedPolygons: any[];
  savePolygons: (polygons: any[]) => void;
  saveGuideLine: (line: GuideLineType) => void;
  selectedPlot: string | null;
  setSelectedPlot: (id: string | null) => void;
  isAlertPolygonShown: boolean;
  showPolygonAlert: Dispatch<SetStateAction<boolean>>;
  handleAlertPolygonClose: () => void;
  savedGuideLines: GuideLineType[] | null;
  deleteGuideLine: (line: GuideLineType) => void;
  houses: HouseDto[] | null;
  setIsUndoHistoryPresent: Dispatch<SetStateAction<boolean>>;
  setIsRedoHistoryPresent: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    aerialView,
    savedPolygons,
    saveGuideLine,
    savePolygons,
    selectedPlot,
    setSelectedPlot,
    isAlertPolygonShown,
    showPolygonAlert,
    handleAlertPolygonClose,
    savedGuideLines,
    deleteGuideLine,
    houses,
    setIsRedoHistoryPresent,
    setIsUndoHistoryPresent,
  } = props;

  const [guideLines, setGuideLines] = useState<GuideLineType[]>([]);
  const [newGuideLinePoint, setNewGuideLinePoint] = useState<Point[]>([]);
  const [newGuideLinePoints, setNewGuideLinePoints] = useState<Point[]>([]);
  const [isDrawingPath, setDrawingPath] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [componentSavedPolygons, setComponentSavedPolygons] = useState<
    PolygonType[]
  >([]);
  const [editedPolygon, setEditedPolygon] = useState<PolygonType>(
    {} as PolygonType
  );
  const [right, setRight] = useState<Point[]>([]);
  //const [editHistory, setEditHistory] = useState<any[]>([]);
  const [showCanvasMousePosition, setShowCanvasMousePosition] = useState<
    boolean
  >(false);
  const [
    canvasMousePosition,
    setCurrentCanvasMousePosition,
  ] = useState<Point | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<PolygonType | null>(null);
  const [
    hoveredGuideLine,
    setHoveredGuideLine,
  ] = useState<GuideLineType | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<SVGCircleElement | null>(
    null
  );
  const [hoveredSegment, setHoveredSegment] = useState<Segment | null>(null);
  const [toolTipHouse, setToolTipHouse] = useState<HouseDto | null>(null);
  const [viewBoxScale, setViewBoxScale] = useState<ViewBoxScale>({
    point1: { x: 0, y: 0 },
    point2: { x: INITIAL_VIEW_BOX_X_VALUE, y: 0 },
  });
  const [enterPressed, setEnterPressed] = useState<boolean>(false);

  const {
    house,
    setHouse,
    newPlot,
    setNewPlot,
    polygonId,
    setPolygonId,
  } = useContext(HouseContext);
  const {
    isUndoButtonClicked,
    setIsUndoButtonClicked,
    isRedoButtonClicked,
    setIsRedoButtonClicked,
    isDrawGuideLineButtonClicked,
    setIsDrawGuideLineButtonClicked,
    isDrawingButtonClicked,
    isEditButtonClicked,
    setIsEditButtonClicked,
    isSavePolygonButtonClicked,
    setIsSavePolygonButtonClicked,
    isAddInnerLineButtonClicked,
    isMovingPolygon,
    setIsMovingPolygon,
    isMovingGuideLine,
    setIsMovingGuideLine,
    isMovingGuideLinePoint,
    setIsMovingGuideLinePoint,
    currentScale,
  } = useContext(ToolboxContext);

  const popupPosition = useRef({ top: -99, left: -99 });
  const maxPlotId = useRef(1);

  const [beforeMovePolygonCenter, setBeforeMovePolygonCenter] = useState<
    Point
  >();
  const [movingGuideLine, setMovingGuideLine] = useState<GuideLineType>();
  const [beforeMoveGuideLineCenter, setBeforeMoveGuideLineCenter] = useState<
    Point
  >();
  const [isMovingGuideLinePoint1, setIsMovingGuideLinePoint1] = useState<
    boolean
  >(false);
  const [isMovingGuideLinePoint2, setIsMovingGuideLinePoint2] = useState<
    boolean
  >(false);
  const [selectedGuideLineId, setSelectedGuideLineId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    window.document.addEventListener("keyup", handleKeyUp);
    window.document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.removeEventListener("keyup", handleKeyUp);
      window.document.removeEventListener("keydown", handleKeyDown);
    };
  });

  const {
    pushUndoHistory,
    clearHistory,
    handleUndo,
    handleRedo,
  } = useUndoRedo({ setIsRedoHistoryPresent, setIsUndoHistoryPresent });

  useEffect(() => {
    if (isUndoButtonClicked) {
      handleUndo(
        isDrawingPath,
        newPlot,
        setNewPlot,
        setDrawingPath,
        componentSavedPolygons,
        setComponentSavedPolygons
      );
      setIsUndoButtonClicked(false);
    }
    savePolygon();
  }, [isUndoButtonClicked]);

  useEffect(() => {
    if (isRedoButtonClicked) {
      handleRedo(
        isDrawingPath,
        newPlot,
        setNewPlot,
        setDrawingPath,
        componentSavedPolygons,
        setComponentSavedPolygons
      );
      setIsRedoButtonClicked(false);
    }
    savePolygon();
  }, [isRedoButtonClicked]);

  useEffect(() => {
    setDrawingPath(false);
    clearHistory();
    setNewPlot(null);
    setRight([]);
  }, [house]);

  useEffect(() => {
    if (!houses) {
      return;
    }

    const houseForToolTip: HouseDto = houses.filter(
      (h) => h.number === hoveredPlot?.houseNumber
    )[0];
    if (houseForToolTip) {
      setToolTipHouse(houseForToolTip);
    }
  }, [hoveredPlot]);

  useEffect(() => {
    if (savedGuideLines) {
      setGuideLines([...savedGuideLines]);
    }
  }, [savedGuideLines]);

  useEffect(() => {
    const img = new Image();
    img.src = aerialView;
    img.onload = () => {
      const y = (viewBoxScale.point2.x / img.width) * img.height;
      setViewBoxScale({
        point1: { x: 0, y: 0 },
        point2: { x: INITIAL_VIEW_BOX_X_VALUE, y: y },
      });
    };
  }, [aerialView]);

  useEffect(() => {
    setComponentSavedPolygons([...savedPolygons]);

    let maxId = 0;
    savedPolygons.forEach(function (p) {
      if (p.id && p.id.startsWith("polygon")) {
        let numberId = Number(p.id.substring(7));
        if (numberId > maxId) {
          maxId = numberId;
        }
      }
    });
    maxPlotId.current = maxId + 1;
  }, [savedPolygons]);

  useEffect(() => {
    if (selectedPlot) {
      if (selectedPlot.startsWith("polygon")) {
        setPolygonId(selectedPlot);
      }
      setHoveredPlot(
        savedPolygons.find((polygon) => polygon.id === selectedPlot)
      );
      const target = document.getElementById(selectedPlot);
      if (target) {
        setPopUpPosition(target);
      }
    } else {
      setSelectedPlotId(null);
      setHoveredPlot(null);
      setPolygonId(null);
    }
  }, [selectedPlot]);

  useEffect(() => {
    if (isDrawingButtonClicked) {
      setDrawingPath(true);
      setIsDrawGuideLineButtonClicked(false);
      setIsEditButtonClicked(false);
      setPolygonId(null);
      setNewPlot(null);
    }
  }, [isDrawingButtonClicked]);

  useEffect(() => {
    if (!isDrawingPath) {
      setCurrentCanvasMousePosition(null);
    }
  }, [isDrawingPath]);

  //TODO REFACTOR
  useEffect(() => {
    if (isSavePolygonButtonClicked) {
      clearHistory();
      savePolygon();
    } else if (enterPressed) {
      if (newPlot) {
        if (isDrawingButtonClicked) {
          clearHistory();
        }
        if (!isDrawingPath) {
          savePolygon();
        } else {
          savePolygons(
            pointNewPosition({
              x: 0,
              y: 0,
              alternativePointsArr: canvasMousePosition
                ? [
                    //todo bug here
                    ...newPlot!.points,
                    canvasMousePosition!,
                    ...right,
                  ]
                : newPlot.points,
            })
          );
        }
      } else if (editedPolygon.points) {
        savePolygon();
        //savePolygons(
        //  pointNewPosition({
        //    x: 0,
        //    y: 0,
        //  })
        //);
      } else {
        savePolygon();
      }
      setDrawingPath(false);
      setNewPlot(null);
      setRight([]);
      setEnterPressed(false);
    }
    setIsSavePolygonButtonClicked(false);
    setEnterPressed(false);
  }, [isSavePolygonButtonClicked, enterPressed]);

  useEffect(() => {
    if (isEditButtonClicked) {
      setIsDrawGuideLineButtonClicked(false);
      setSelectedGuideLineId(undefined);
    }
  }, [isEditButtonClicked]);

  useEffect(() => {
    if (isDrawGuideLineButtonClicked) {
      setIsEditButtonClicked(false);
    }
  }, [isDrawGuideLineButtonClicked]);

  function createNewPolygon(): PolygonType {
    return {
      id: `polygon${maxPlotId.current++}`,
      points: [] as Point[],
      houseNumber: house!.number, // house ? house.number : -1,  //
      editorSettings: DEFAULT_EDITOR_SETTINGS,
    };
  }

  function createPolygonGuideLines(): GuideLineType[] {
    let extraLines: GuideLineType[] = [];
    componentSavedPolygons.forEach((polygon, i) => {
      for (let j = 0; j < polygon.points.length; j++) {
        let k = (j + 1) % polygon.points.length;
        let polygonLinePoints = [
          { x: polygon.points[j].x, y: polygon.points[j].y },
          { x: polygon.points[k].x, y: polygon.points[k].y },
        ];

        let polygonLine: GuideLineType = {
          id: `guide-line-polygon-${polygon.id}-${j}`,
          linePoints: {
            point1: polygonLinePoints[0],
            point2: polygonLinePoints[1],
          },
          style: {
            color: "#ffffff",
            width: 0,
          },
        };
        // let hiddenPolygonPoints = calculateGuideLineHiddenPolygon(
        //   polygonLine,
        //   viewBoxScale
        // );
        // polygonLine.polygonPoints = {
        //   point1: hiddenPolygonPoints[0],
        //   point2: hiddenPolygonPoints[1],
        //   point3: hiddenPolygonPoints[2],
        //   point4: hiddenPolygonPoints[3],
        // };
        extraLines.push(polygonLine);
      }
    });
    return extraLines;
  }

  function createOrthoGuideLines(fromPoint: Point): GuideLineType[] {
    const { x, y } = { ...fromPoint };
    let extraLines: GuideLineType[] = [];
    const verticalLinePoints = [
      { x: x, y: viewBoxScale.point1.y },
      { x: x, y: viewBoxScale.point2.y },
    ];
    const horizontalLinePoints = [
      { x: viewBoxScale.point1.x, y },
      { x: viewBoxScale.point2.x, y },
    ];
    let verticalLineParameters = calculateLineParametersFromPoints(
      verticalLinePoints[0],
      verticalLinePoints[1]
    );
    let horizontalLineParameters = calculateLineParametersFromPoints(
      horizontalLinePoints[0],
      horizontalLinePoints[1]
    );
    const verticalLine: GuideLineType = {
      id: `guide-line-vertical-${fromPoint.x}`,
      linePoints: {
        point1: verticalLinePoints[0],
        point2: verticalLinePoints[1],
      },
      lineParameters: verticalLineParameters,
      style: {
        color: "#00ff00",
        width: 1,
      },
    };

    const horizontalLine: GuideLineType = {
      id: `guide-line-horizontal-${fromPoint.y}`,
      linePoints: {
        point1: horizontalLinePoints[0],
        point2: horizontalLinePoints[1],
      },
      lineParameters: horizontalLineParameters,
      style: {
        color: "#00ff00",
        width: 1,
      },
    };

    verticalLine.polygonPoints = {
      point1: {
        x: verticalLinePoints[0].x - GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        y: verticalLinePoints[0].y,
      },
      point2: {
        x: verticalLinePoints[0].x + GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        y: verticalLinePoints[0].y,
      },
      point3: {
        x: verticalLinePoints[1].x + GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        y: verticalLinePoints[1].y,
      },
      point4: {
        x: verticalLinePoints[1].x - GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        y: verticalLinePoints[1].y,
      },
    };
    horizontalLine.polygonPoints = {
      point1: {
        y: horizontalLinePoints[0].y - GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        x: horizontalLinePoints[0].x,
      },
      point2: {
        y: horizontalLinePoints[0].y + GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        x: horizontalLinePoints[0].x,
      },
      point3: {
        y: horizontalLinePoints[1].y + GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        x: horizontalLinePoints[1].x,
      },
      point4: {
        y: horizontalLinePoints[1].y - GUIDE_LINE_HIDDEN_POLYGON_WIDTH,
        x: horizontalLinePoints[1].x,
      },
    };
    extraLines.push(horizontalLine);
    extraLines.push(verticalLine);
    return extraLines; // [verticalLine, horizontalLine];
  }

  function removeOrthoGuideLines() {
    setGuideLines(
      guideLines.filter(
        (l) =>
          !l.id?.startsWith("guide-line-horizontal") &&
          !l.id?.startsWith("guide-line-vertical") &&
          !l.id?.startsWith("guide-line-polygon")
      )
    );
  }

  function createGuideLine(x: number, y: number) {
    // const pointsCoords = calculateCanvasIntersectionPoints(
    //   {
    //     linePoints: {
    //       point1: { ...newGuideLinePoint[0] },
    //       point2: { x: x, y: y },
    //     },
    //   },
    //   viewBoxScale
    // );
    const pointsCoords = [newGuideLinePoint[0], { x: x, y: y }];
    let lineParameters = calculateLineParametersFromPoints(
      pointsCoords[0],
      pointsCoords[1]
    );
    const transientLine: GuideLineType = {
      id: calculateLineNumber(guideLines ? guideLines : []),
      linePoints: {
        point1: pointsCoords[0],
        point2: pointsCoords[1],
      },
      lineParameters,
    };
    setNewGuideLinePoint([]);

    // const hiddenPolygonPoints = calculateGuideLineHiddenPolygon(
    //   transientLine,
    //   viewBoxScale
    // );
    // transientLine.polygonPoints = {
    //   point1: hiddenPolygonPoints[0],
    //   point2: hiddenPolygonPoints[1],
    //   point3: hiddenPolygonPoints[2],
    //   point4: hiddenPolygonPoints[3],
    // };
    return transientLine;
  }

  function handleKeyUp(e: any) {
    const keyCode = e.which;
    switch (keyCode) {
      case 16: {
        //shift
        if (newPlot && isDrawingPath) {
          removeOrthoGuideLines();
        }
        break;
      }
    }
  }

  function handleKeyDown(e: any) {
    const keyCode = e.which;
    switch (keyCode) {
      case 27: {
        //esc
        if (newPlot) {
          e.preventDefault();
          if (isEditButtonClicked) {
            setComponentSavedPolygons([
              ...componentSavedPolygons,
              editedPolygon,
            ]);
          } else {
            clearHistory();
            setSelectedPlotId(null);
          }
          setNewPlot(null);
          //setDrawingPath(false);
        }
        break;
      }
      case 16: {
        //shift
        if (newPlot && isDrawingPath && newPlot.points.length > 0) {
          let orthoGuideLines = createOrthoGuideLines(
            newPlot.points[newPlot.points.length - 1]
          );
          let polygonGuideLines = createPolygonGuideLines();
          if (newPlot.points.length > 1) {
            orthoGuideLines = orthoGuideLines.concat(
              createOrthoGuideLines(newPlot.points[0])
            );
          }
          setGuideLines([
            ...guideLines,
            ...polygonGuideLines,
            ...orthoGuideLines,
          ]);
        }
        break;
      }
    }
  }

  function handleTargetXYClicked(
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) {
    if (isDrawGuideLineButtonClicked) {
      if (newGuideLinePoint.length === 0) {
        const guideLinePoint: Point[] = [{ x: x, y: y }];
        setNewGuideLinePoint(guideLinePoint);
      } else {
        let transientLine;
        if (shift && canvasMousePosition) {
          transientLine = createGuideLine(
            canvasMousePosition.x,
            canvasMousePosition.y
          );
        } else {
          transientLine = createGuideLine(x, y);
        }
        setGuideLines([...guideLines, transientLine]);
        setNewGuideLinePoints([]);
        saveGuideLine(transientLine);
        setSelectedGuideLineId(transientLine.id);
      }
    } else if (newPlot && isDrawingPath) {
      if (target.tagName === "polygon" || target.tagName === "circle") {
        if (target.id === "x-polygon") {
          addPointToNewPlotPath(x, y);
        } else if (target.tagName === "circle") {
          addPointToNewPlotPath(
            target.cx.baseVal.value,
            target.cy.baseVal.value
          );
        } else if (canvasMousePosition) {
          addPointToNewPlotPath(canvasMousePosition.x, canvasMousePosition.y);
        }
      } else {
        addPointToNewPlotPath(x, y);
      }
    } else {
      if (target.tagName === "circle" && !newPlot) {
        addPointToNewPlotPath(target.cx.baseVal.value, target.cy.baseVal.value);
        //todo: unselecting a plot is broken: } else if (selectedPlotId && !newPlot) {
        //setSelectedPlotId(null);
      } else if (house && !newPlot) {
        if (target.id.includes("guide-line")) {
          if (canvasMousePosition)
            addPointToNewPlotPath(canvasMousePosition.x, canvasMousePosition.y);
        } else {
          addPointToNewPlotPath(x, y);
        }
      }
    }
  }

  function addPointToNewPlotPath(x: number, y: number) {
    if (!newPlot) {
      if (!house) return;
      let newPolygon = createNewPolygon();
      newPolygon.points.push({ x, y });
      setDrawingPath(true);
      clearHistory();
      setNewPlot(newPolygon);
    } else {
      let newPolygon = { ...newPlot };
      if (pointsAreClose(newPolygon.points[0], { x, y }, currentScale)) {
        setDrawingPath(false);
        savePolygon();
        setIsEditButtonClicked(true);
        setSelectedPlotId(newPlot.id);
        setCurrentCanvasMousePosition(null);
        removeOrthoGuideLines();
      } else {
        newPolygon.points = newPolygon.points.concat([{ x, y }]);
      }
      pushUndoHistory({ polygon: newPlot, isDrawingPath });
      setNewPlot(newPolygon);
    }
  }

  function setPopUpPosition(target: Element) {
    let boundingRect = target.getBoundingClientRect();
    popupPosition.current = {
      left: (boundingRect.left + boundingRect.right) / 2,
      top: boundingRect.top + window.pageYOffset + -250,
    };
  }

  function handlePolygonIntersection(
    x: number,
    y: number,
    target: SVGPolygonElement
  ) {
    let polygon: { points: Point[] };

    if (newPlot && newPlot.points.length > 0) {
      polygon = newPlot;
    } else {
      const points = right; //todo possible bug here
      polygon = { ...newPlot, points };
    }

    let intersection = findLinePolygonIntersection(
      {
        x,
        y,
      },
      polygon.points[polygon.points.length - 1],
      target.points
    );
    if (
      intersection &&
      pointsAreClose(
        intersection,
        polygon.points[polygon.points.length - 1],
        currentScale
      )
    ) {
      intersection = findLinePolygonIntersection(
        { x, y },
        polygon.points[0],
        target.points
      );
    }
    setCurrentCanvasMousePosition(intersection || { x, y });
  }

  function handleGuideLineIntersection(
    x: number,
    y: number,
    target: SVGPolygonElement,
    ctrl: boolean
  ) {
    let currentLine = guideLines[0];
    let closestLines = new Array<{ l: GuideLineType; d: number }>();
    let distance;
    let mousePosition = null;
    guideLines.forEach((line) => {
      distance = calculateDistanceFromPointToGuideLine({ x, y }, line);
      if (distance < 3) {
        closestLines.push({ l: line, d: distance });
      }
      if (line.id === target.id) currentLine = line;
    });
    closestLines.sort((ld1, ld2) => ld1.d - ld2.d);
    //remove duplicates (overlapping lines)
    closestLines = closestLines.filter((line, pos, arr) => {
      return !pos || Math.abs(line.d - arr[pos - 1].d) > 0.001;
    });
    if (closestLines.length < 2) {
      mousePosition = calculateProjectionPoint(
        currentLine.linePoints.point1!,
        currentLine.linePoints.point2!,
        { x: x, y: y }
      );
    } else {
      //if (!ctrl) {
      const intersection = findGuideLineIntersection(
        closestLines[0].l,
        closestLines[1].l
      );
      if (
        intersection.x &&
        intersection.y &&
        intersection.onLine1 &&
        calculateDistanceBetweenPoints(
          { x, y },
          { x: intersection.x!, y: intersection.y! }
        ) < 3
      ) {
        mousePosition = { x: intersection.x, y: intersection.y };
      } else {
        mousePosition = calculateProjectionPoint(
          closestLines[0].l.linePoints.point1!,
          closestLines[0].l.linePoints.point2!,
          { x: x, y: y }
        );
      }
    }
    setCurrentCanvasMousePosition(mousePosition || { x, y });
  }

  function isPointOutOfCanvas(
    canvasMousePosition: { x: number; y: number },
    shift: { x: number; y: number },
    viewBoxScale: ViewBoxScale
  ) {
    return (
      canvasMousePosition.x + shift.x > viewBoxScale.point2.x ||
      canvasMousePosition.x + shift.x < viewBoxScale.point1.x ||
      canvasMousePosition.y + shift.y > viewBoxScale.point2.y ||
      canvasMousePosition.y + shift.y < viewBoxScale.point1.y
    );
  }

  const handleKeyboardMove = (shift: { x: number; y: number }) => {
    setViewBoxScale((viewBoxScale) => {
      setCurrentCanvasMousePosition((canvasMousePosition) => {
        if (canvasMousePosition == null) return null;
        if (isPointOutOfCanvas(canvasMousePosition, shift, viewBoxScale))
          return {
            x: canvasMousePosition.x,
            y: canvasMousePosition.y,
          };

        return {
          x: canvasMousePosition.x + shift.x,
          y: canvasMousePosition.y + shift.y,
        };
      });

      return viewBoxScale;
    });
  };

  function handleMouseMove(value: {
    target: any;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
  }) {
    const { target, x, y, clientY, clientX, ctrl, alt, shift } = value;
    if (isMovingPolygon) {
      if (house && house.polygons.length > 0 && beforeMovePolygonCenter) {
        const differenceX = x - beforeMovePolygonCenter.x;
        const differenceY = y - beforeMovePolygonCenter.y;
        const newPoints = editedPolygon.points.map(
          (point) =>
            ({
              x: point.x + differenceX,
              y: point.y + differenceY,
            } as Point)
        );
        let polygons = [...componentSavedPolygons];
        let editedIndex = polygons.findIndex(
          (polygon) => polygon.id === editedPolygon.id
        );
        let movedPolygon = { ...polygons[editedIndex] };
        movedPolygon.points = newPoints;
        polygons[editedIndex] = movedPolygon;
        setComponentSavedPolygons(polygons);
      }
    }
    if (isMovingGuideLine) {
      if (
        movingGuideLine &&
        movingGuideLine.lineParameters &&
        beforeMoveGuideLineCenter
      ) {
        let differenceX = x - beforeMoveGuideLineCenter.x;
        let differenceY = y - beforeMoveGuideLineCenter.y;
        let lines = [...guideLines];
        let editedIndex = guideLines.findIndex(
          (line) => line.id === movingGuideLine.id
        );
        let movedLine = { ...lines[editedIndex] };
        if (
          movedLine.lineParameters &&
          movedLine.linePoints.point1 &&
          movedLine.linePoints.point2
        ) {
          movedLine.linePoints = {
            point1: {
              x: movedLine.linePoints.point1.x + differenceX,
              y: movedLine.linePoints.point1.y + differenceY,
            },
            point2: {
              x: movedLine.linePoints.point2.x + differenceX,
              y: movedLine.linePoints.point2.y + differenceY,
            },
          };

          if (movedLine.linePoints.point1 && movedLine.linePoints.point2) {
            movedLine.lineParameters = calculateLineParametersFromPoints(
              movedLine.linePoints.point1,
              movedLine.linePoints.point2
            );
          }

          // const hiddenPolygonPoints = calculateGuideLineHiddenPolygon(
          //   movedLine,
          //   viewBoxScale
          // );
          // movedLine.polygonPoints = {
          //   point1: hiddenPolygonPoints[0],
          //   point2: hiddenPolygonPoints[1],
          //   point3: hiddenPolygonPoints[2],
          //   point4: hiddenPolygonPoints[3],
          // };

          setBeforeMoveGuideLineCenter({
            x: beforeMoveGuideLineCenter.x + differenceX,
            y: beforeMoveGuideLineCenter.y + differenceY,
          });
        }
        lines[editedIndex] = movedLine;
        setGuideLines(lines);
      }
    }
    if (isMovingGuideLinePoint && movingGuideLine) {
      let newCanvasMousePosition = { x, y };
      let movedGuideLinePoint = isMovingGuideLinePoint1
        ? movingGuideLine.linePoints.point1
        : movingGuideLine.linePoints.point2;
      if (
        shift &&
        movedGuideLinePoint &&
        movingGuideLine.linePoints.point1 &&
        movingGuideLine.linePoints.point2
      ) {
        const staticPoint = isMovingGuideLinePoint1
          ? movingGuideLine.linePoints.point2
          : movingGuideLine.linePoints.point1;
        if (
          Math.abs(newCanvasMousePosition.x - staticPoint.x) <
          Math.abs(newCanvasMousePosition.y - staticPoint.y)
        ) {
          newCanvasMousePosition = {
            x: staticPoint.x,
            y: y,
          };
        } else {
          newCanvasMousePosition = {
            x: x,
            y: staticPoint.y,
          };
        }
      }

      let lines = [...guideLines];
      let editedIndex = guideLines.findIndex(
        (line) => line.id === movingGuideLine.id
      );
      let movedLine = { ...lines[editedIndex] };
      if (isMovingGuideLinePoint1) {
        movedLine.linePoints.point1 = {
          x: newCanvasMousePosition.x,
          y: newCanvasMousePosition.y,
        };
      } else if (isMovingGuideLinePoint2) {
        movedLine.linePoints.point2 = {
          x: newCanvasMousePosition.x,
          y: newCanvasMousePosition.y,
        };
      }

      if (movedLine.linePoints.point1 && movedLine.linePoints.point2) {
        movedLine.lineParameters = calculateLineParametersFromPoints(
          movedLine.linePoints.point1,
          movedLine.linePoints.point2
        );
      }

      // const hiddenPolygonPoints = calculateGuideLineHiddenPolygon(
      //   movedLine,
      //   viewBoxScale
      // );
      // movedLine.polygonPoints = {
      //   point1: hiddenPolygonPoints[0],
      //   point2: hiddenPolygonPoints[1],
      //   point3: hiddenPolygonPoints[2],
      //   point4: hiddenPolygonPoints[3],
      // };

      lines[editedIndex] = movedLine;
      setGuideLines(lines);
    }
    if (isDrawGuideLineButtonClicked) {
      let newCanvasMousePosition = { x, y };
      if (
        newGuideLinePoint.length > 0 &&
        newCanvasMousePosition?.x &&
        newCanvasMousePosition?.y
      ) {
        if (shift) {
          if (
            Math.abs(newCanvasMousePosition.x - newGuideLinePoint[0].x) >
            Math.abs(newCanvasMousePosition.y - newGuideLinePoint[0].y)
          ) {
            newCanvasMousePosition = {
              x: newCanvasMousePosition.x,
              y: newGuideLinePoint[0].y,
            };
          } else {
            newCanvasMousePosition = {
              x: newGuideLinePoint[0].x,
              y: newCanvasMousePosition.y,
            };
          }
        }
        const points = [
          newGuideLinePoint[0],
          {
            x: newCanvasMousePosition?.x,
            y: newCanvasMousePosition?.y,
          },
        ];
        setNewGuideLinePoints([...points]);
      }
      setCurrentCanvasMousePosition(newCanvasMousePosition);
    } else if (newPlot && isDrawingPath) {
      setShowCanvasMousePosition(false);
      if (target.tagName === "circle") {
        setCurrentCanvasMousePosition({
          x: target.cx.baseVal.value,
          y: target.cy.baseVal.value,
        });
      } else if (target.id.startsWith("magnetic-polygon")) {
        const polygon = savedPolygons.find(
          (polygon) => polygon.id === target.id.split(";")[1]
        );
        const intersection = findMagneticPolygonIntersection({ x, y }, polygon);
        setCurrentCanvasMousePosition(intersection);
        setShowCanvasMousePosition(true);
      } else if (
        target.tagName === "polygon" &&
        target.id !== "x-polygon" &&
        !target.id.includes("guide-line")
      ) {
        handlePolygonIntersection(x, y, target as SVGPolygonElement);
        setShowCanvasMousePosition(true);
      } else if (
        target.tagName === "polygon" &&
        target.id.includes("guide-line")
      ) {
        if (hoveredGuideLine) setHoveredGuideLine(null);
        handleGuideLineIntersection(x, y, target as SVGPolygonElement, ctrl);
        setShowCanvasMousePosition(true);
      } else {
        setCurrentCanvasMousePosition({ x, y });
      }
    } else if (target.id.includes("guide-line") && !isEditButtonClicked) {
      handleGuideLineIntersection(x, y, target as SVGPolygonElement, ctrl);
      setHoveredPlot(null);
      isDrawingButtonClicked && setShowCanvasMousePosition(true);
      popupPosition.current = {
        left: clientX,
        top: clientY,
      };
      setHoveredSegment(null);
      let line;
      if (guideLines) {
        line = guideLines?.find((line) => line.id === target.id);
      }
      setHoveredGuideLine(line ? line : null);
    } else if (target.tagName === "polygon") {
      setHoveredGuideLine(null);
      setHoveredPoint(null);
      setShowCanvasMousePosition(false);
      if (
        (!hoveredPlot || target.id !== hoveredPlot.id) &&
        !isEditButtonClicked
      ) {
        setPopUpPosition(target);
        setHoveredPlot(
          savedPolygons.find((polygon) => polygon.id === target.id)
        );
      } else {
        const polygon = componentSavedPolygons.find(
          (polygon) => polygon.id === target.id
        );
        if (polygon && isEditButtonClicked) {
          const closestSegment = findClosestSegment(
            polygon,
            { x, y },
            currentScale
          );
          if (closestSegment) {
            popupPosition.current = {
              left: clientX,
              top: clientY,
            };
            setHoveredPoint(null);
            setHoveredSegment(closestSegment);
          } else {
            setHoveredSegment(null);
          }
        }
      }
    } else if (target.tagName === "circle" && isEditButtonClicked) {
      setHoveredGuideLine(null);
      setPopUpPosition(target as SVGCircleElement);
      setHoveredPlot(null);
      setHoveredSegment(null);
      setHoveredPoint(target as SVGCircleElement);
      setShowCanvasMousePosition(false);
    } else {
      setShowCanvasMousePosition(false);
      if (hoveredPlot) setHoveredPlot(null);
      if (hoveredGuideLine) setHoveredGuideLine(null);
      if (hoveredPoint) setHoveredPoint(null);
      if (hoveredSegment) setHoveredSegment(null);
    }
  }

  function handleMouseOutCanvas() {
    setCurrentCanvasMousePosition(null);
  }

  function selectPoint(polygon: PolygonType, i: number) {
    let noEditedPolygons: PolygonType[] = [...componentSavedPolygons];
    noEditedPolygons.splice(noEditedPolygons.indexOf(polygon), 1);
    setComponentSavedPolygons(noEditedPolygons);
    setEditedPolygon(polygon);
    const left = polygon.points.slice(0, i);
    const right = polygon.points.slice(i + 1);
    //setRight(right);
    polygon.points = right.concat(left);
    setNewPlot(polygon);
    setDrawingPath(true);
  }

  function handleCreatePolygon(polygonUpdatedPoints: {
    houseNumber: number;
    id: string;
    editorSettings: EditorSettings;
    points: Point[];
  }) {
    if (!polygonUpdatedPoints.houseNumber) {
      polygonUpdatedPoints.houseNumber = house!.number;
      polygonUpdatedPoints.id = `polygon${maxPlotId.current++}`;
      if (!polygonUpdatedPoints.editorSettings) {
        polygonUpdatedPoints.editorSettings = DEFAULT_EDITOR_SETTINGS;
      }
    }
  }

  //TODO REFACTOR
  function pointNewPosition(value: {
    x: number;
    y: number;
    alternativePointsArr?: Point[];
  }) {
    const { x, y, alternativePointsArr } = value;
    let clickPointCoords;

    if (canvasMousePosition) {
      clickPointCoords = canvasMousePosition;
    } else {
      clickPointCoords = { x: x, y: y };
    }

    let points: Point[];

    alternativePointsArr
      ? (points = [...alternativePointsArr])
      : (points = [...editedPolygon.points, clickPointCoords, ...right]);

    const uniquePoints = points.filter((thing, index) => {
      const _thing = JSON.stringify(thing);
      return (
        index ===
        points.findIndex((obj) => {
          return JSON.stringify(obj) === _thing;
        })
      );
    });

    const polygonUpdatedPoints = { ...editedPolygon };
    polygonUpdatedPoints.points = [...uniquePoints];
    handleCreatePolygon(polygonUpdatedPoints);

    setComponentSavedPolygons([
      ...componentSavedPolygons,
      polygonUpdatedPoints,
    ]);

    setNewPlot(null);
    setDrawingPath(false);
    removeOrthoGuideLines();
    return [...componentSavedPolygons, polygonUpdatedPoints];
  }

  function insertPointIntoSegment(
    polygon: PolygonType,
    closestSegment: Segment,
    point: Point
  ) {
    const findPoint = polygon.points.find(
      (points) =>
        points.y === closestSegment.sides[0].y &&
        points.x === closestSegment.sides[0].x
    );

    if (findPoint) {
      const index = polygon.points.indexOf(findPoint);
      if (!closestSegment.isLastSegment) {
        polygon.points.splice(index + 1, 0, point);
        selectPoint(polygon, index + 1);
      } else {
        polygon.points.splice(polygon.points.length, 0, point);
        selectPoint(polygon, polygon.points.length - 1);
      }
    }
  }

  const handlePolygonDrawing = (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => {
    let polygon;
    if (house && house.polygons.length > 0) {
      polygon = componentSavedPolygons.find(
        (polygon) => polygon.id === polygonId
      );
    }

    if (isDrawGuideLineButtonClicked) {
      handleTargetXYClicked(target, x, y, ctrl, alt, shift);
    } else if (isDrawingButtonClicked) {
      handleTargetXYClicked(target, x, y, ctrl, alt, shift);
    } else if (
      (isEditButtonClicked && isDrawingPath) ||
      (enterPressed && isDrawingPath)
    ) {
      savePolygons(pointNewPosition({ x, y }));
    } else if (isEditButtonClicked && componentSavedPolygons) {
      if (hoveredPlot) setHoveredPlot(null);
      if (hoveredGuideLine) setHoveredGuideLine(null);
      if (hoveredPoint) setHoveredPoint(null);
      if (hoveredSegment) setHoveredSegment(null);
      if (polygon) {
        const indexOfClosetPointToSelect = findIndexOfClosestPointToSelect(
          polygon.points,
          { x, y },
          currentScale
        );
        if (indexOfClosetPointToSelect != -1) {
          saveToUndoHistory(polygon);
          selectPoint(polygon, indexOfClosetPointToSelect);
          setCurrentCanvasMousePosition({ x, y });
          return;
        }

        const closestSegment = findClosestSegment(
          polygon,
          { x, y },
          currentScale
        );
        if (closestSegment) {
          saveToUndoHistory(polygon);
          insertPointIntoSegment(polygon, closestSegment, { x, y });
          return;
        }
      }
    } else if (target.tagName === "polygon") {
      if (!newPlot) {
        setSelectedPlot(target.id);
      }
    }

    if (
      !isMovingPolygon &&
      !isMovingGuideLine &&
      !isMovingGuideLinePoint &&
      hoveredGuideLine
    ) {
      setSelectedGuideLineId(hoveredGuideLine.id);
    }
    //   handleTargetXYClicked(target, x, y);
  };

  const handleMouseDown = (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => {
    let polygon;
    if (house && house.polygons.length > 0) {
      polygon = componentSavedPolygons.find(
        (polygon) => polygon.id === polygonId
      );
    }

    if (isEditButtonClicked) {
      setIsDrawGuideLineButtonClicked(false);
      if (componentSavedPolygons) {
        if (target.id === "center") {
          if (!isMovingPolygon) {
            setIsMovingPolygon(true);
            setNewPlot(null);
            setBeforeMovePolygonCenter({
              x: target.cx.baseVal.value,
              y: target.cy.baseVal.value,
            });
            if (polygon) {
              setEditedPolygon(polygon);
            }
            setIsEditButtonClicked(true);
          }
          return;
        }
      }
    }

    const targetIdSplitted = target.id.split(";");
    if (targetIdSplitted[0] === "move") {
      if (!isMovingGuideLine) {
        setIsMovingGuideLine(true);
        setIsDrawGuideLineButtonClicked(false);
        setMovingGuideLine(
          guideLines.find((line) => line.id === targetIdSplitted[1])
        );
        setBeforeMoveGuideLineCenter({
          x: target.cx.baseVal.value,
          y: target.cy.baseVal.value,
        });
        return;
      }
    } else if (targetIdSplitted[0] === "point1") {
      setMovingGuideLine(
        guideLines.find((line) => line.id === targetIdSplitted[1])
      );
      setIsDrawGuideLineButtonClicked(false);
      setIsMovingGuideLinePoint1(true);
      setIsMovingGuideLinePoint(true);
    } else if (targetIdSplitted[0] === "point2") {
      setMovingGuideLine(
        guideLines.find((line) => line.id === targetIdSplitted[1])
      );
      setIsDrawGuideLineButtonClicked(false);
      setIsMovingGuideLinePoint2(true);
      setIsMovingGuideLinePoint(true);
    } else if (
      !isMovingPolygon &&
      !isMovingGuideLine &&
      !isMovingGuideLinePoint &&
      !hoveredGuideLine
    ) {
      setSelectedGuideLineId(undefined);
    }
  };

  const handleMouseUp = (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => {
    if (isEditButtonClicked && componentSavedPolygons && isMovingPolygon) {
      setIsMovingPolygon(false);
      savePolygons(componentSavedPolygons);
    }

    if (isMovingGuideLine) {
      if (movingGuideLine) {
        const newLine = guideLines.find(
          (line) => line.id === movingGuideLine.id
        );
        if (newLine) {
          deleteGuideLine(movingGuideLine);
          saveGuideLine(newLine);
        }
      }
      setIsMovingGuideLine(false);
    }

    if (isMovingGuideLinePoint) {
      if (movingGuideLine) {
        const newLine = guideLines.find(
          (line) => line.id === movingGuideLine.id
        );
        if (newLine) {
          deleteGuideLine(movingGuideLine);
          saveGuideLine(newLine);
        }
      }
      setIsMovingGuideLinePoint(false);
      setIsMovingGuideLinePoint1(false);
      setIsMovingGuideLinePoint2(false);
    }
  };

  function savePolygon() {
    let newSavedPolygons = [];
    if (newPlot) {
      if (newPlot.points.length < 3) {
        showPolygonAlert(true);
      } else {
        newSavedPolygons.push(newPlot);
        setSelectedPlotId(newPlot.id);
      }
      setDrawingPath(false);
      clearHistory();
      setNewPlot(null);
      setRight([]);
      setPolygonId(newPlot.id);
    }
    newSavedPolygons = [...componentSavedPolygons, ...newSavedPolygons];
    savePolygons(newSavedPolygons);
  }

  function saveToUndoHistory(polygon: PolygonType) {
    pushUndoHistory({
      isDrawingPath: isDrawingPath,
      polygon: cloneDeep(polygon),
    });
  }

  function handleRightClick(x: number, y: number) {
    if (isEditButtonClicked) {
      let polygon = componentSavedPolygons.find(
        (polygon) => polygon.id === house!.polygons[0].id
      );

      if (polygon && polygon.points.length > 3) {
        for (let i = 0; i < polygon.points.length; i++) {
          if (pointsAreClose(polygon.points[i], { x, y }, currentScale)) {
            saveToUndoHistory(polygon);
            polygon.points.splice(i, 1);
            savePolygon();
            return;
          }
        }
      } else {
        showPolygonAlert(true);
      }
    } else if (guideLines) {
      for (const line of guideLines) {
        if (isLineClose(line, { x: x, y: y }, currentScale)) {
          const updatedGuideLines = [...guideLines];
          updatedGuideLines.splice(guideLines.indexOf(line), 1);
          setGuideLines([...updatedGuideLines]);
          deleteGuideLine(line);
        }
      }
    }
  }

  return (
    <div style={{ flex: 1, position: "relative", paddingTop: "10px" }}>
      {aerialView ? (
        <>
          {/*{hoveredSegment &&*/}
          {/*  hoveredSegment.polygon.id === house?.polygon?.id && (*/}
          {/*    <AddPointTooltip position={popupPosition.current} />*/}
          {/*  )}*/}
          {hoveredPoint &&
            hoveredPoint.getAttribute("data-polygonId") ===
              (house && house?.polygons.length > 0
                ? house?.polygons[0].id
                : undefined) &&
            (hoveredPoint.id === "center" ? (
              <MovePolygonTooltip position={popupPosition.current} />
            ) : (
              <DeletePointTooltip position={popupPosition.current} />
            ))}
          {hoveredGuideLine && (
            <GuideLineTooltip position={popupPosition.current} />
          )}
          {hoveredPlot && (
            <HouseTooltip
              position={popupPosition.current}
              tooltipFor={toolTipHouse}
              isEditButtonClicked={isEditButtonClicked}
            />
          )}
          <Snackbar
            open={isAlertPolygonShown}
            autoHideDuration={AUTO_HIDDEN_ALERT_DURATION}
            onClose={handleAlertPolygonClose}
          >
            <Alert
              variant="filled"
              severity="error"
              onClose={handleAlertPolygonClose}
            >
              Polygon should contain at least 3 points!
            </Alert>
          </Snackbar>
          <Canvas
            style={{ cursor: "crosshair" }}
            newGuideLine={[...newGuideLinePoints]}
            guideLines={[...guideLines]}
            polygonToEditId={
              isEditButtonClicked && house!.polygons.length > 0
                ? polygonId
                : null
            }
            aerialView={aerialView}
            newPath={
              newPlot &&
              isDrawingPath &&
              (canvasMousePosition
                ? [...newPlot.points, canvasMousePosition, ...right]
                : newPlot.points)
            }
            polygons={
              newPlot && !isDrawingPath
                ? [...componentSavedPolygons, newPlot]
                : componentSavedPolygons
            }
            canvasMousePosition={
              showCanvasMousePosition ? canvasMousePosition : null
            }
            onClickTargetXY={(
              target: any,
              x: number,
              y: number,
              ctrl: boolean,
              alt: boolean,
              shift: boolean
            ) => handlePolygonDrawing(target, x, y, ctrl, alt, shift)}
            onMouseDownTargetXY={(
              target: any,
              x: number,
              y: number,
              ctrl: boolean,
              alt: boolean,
              shift: boolean
            ) => handleMouseDown(target, x, y, ctrl, alt, shift)}
            onMouseUpTargetXY={(
              target: any,
              x: number,
              y: number,
              ctrl: boolean,
              alt: boolean,
              shift: boolean
            ) => handleMouseUp(target, x, y, ctrl, alt, shift)}
            isDrawingPath={isDrawingPath}
            onMouseMove={(
              target: any,
              x: number,
              y: number,
              clientX: number,
              clientY: number,
              ctrl: boolean,
              alt: boolean,
              shift: boolean
            ) =>
              handleMouseMove({
                target,
                x,
                y,
                clientX,
                clientY,
                ctrl,
                alt,
                shift,
              })
            }
            onMouseLeave={handleMouseOutCanvas}
            onRightClick={(x: number, y: number) => handleRightClick(x, y)}
            viewBoxScale={viewBoxScale}
            handleKeyboardMove={handleKeyboardMove}
            savePolygon={() => {
              setEnterPressed(true);
            }}
            selectedGuideLineId={selectedGuideLineId}
            isHoveredPolygonCenter={hoveredPoint?.id === "center"}
            hoveredSegment={hoveredSegment}
            hoveredPlot={hoveredPlot}
          />
        </>
      ) : (
        "Loading ..."
      )}
    </div>
  );
}
