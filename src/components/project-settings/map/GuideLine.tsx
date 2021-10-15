import React, { useContext } from "react";
import styled from "styled-components";
import { GuideLineType } from "../../../dto/GuideLineType";
import { AppMode, AppModeContext } from "../../../context/AppModeContext";
import {
  calculateCanvasIntersectionPoints,
  calculateGuideLineHiddenScalingPolygon,
} from "./utils/MapBuildUtils";
import { ViewBoxScale } from "./Canvas";

export function GuideLine(props: {
  guideLine: GuideLineType;
  selectedGuideLineId: string | undefined | null;
  viewBoxScale: ViewBoxScale;
  currentScale: number;
}) {
  const { guideLine, selectedGuideLineId, viewBoxScale, currentScale } = props;
  const { appMode } = useContext(AppModeContext);

  if (appMode === AppMode.view) {
    return null;
  }
  const [
    intersectionPoint1,
    intersectionPoint2,
  ] = calculateCanvasIntersectionPoints(guideLine, viewBoxScale);

  return (
    <g>
      <g id={guideLine.id!.toString()}>
        {intersectionPoint1 && intersectionPoint2 && (
          <>
            <SVGLine
              strokeDasharray={"5,5"}
              stroke={guideLine.style?.color || "red"}
              strokeWidth={guideLine.style?.width || "0.25pt"}
              x1={intersectionPoint1.x}
              y1={intersectionPoint1.y}
              x2={guideLine.linePoints.point1?.x}
              y2={guideLine.linePoints.point1?.y}
              currentScale={currentScale}
            />
            <SVGLine
              strokeDasharray={"5,5"}
              stroke={guideLine.style?.color || "red"}
              strokeWidth={guideLine.style?.width || "0.25pt"}
              x1={guideLine.linePoints.point2?.x}
              y1={guideLine.linePoints.point2?.y}
              x2={intersectionPoint2.x}
              y2={intersectionPoint2.y}
              currentScale={currentScale}
            />
          </>
        )}
        <SVGLine
          stroke={guideLine.style?.color || "red"}
          strokeWidth={guideLine.style?.width || "0.25pt"}
          x1={guideLine.linePoints.point1?.x}
          y1={guideLine.linePoints.point1?.y}
          x2={guideLine.linePoints.point2?.x}
          y2={guideLine.linePoints.point2?.y}
          currentScale={currentScale}
        />
      </g>

      {guideLine.polygonPoints ? (
        <SVGPolygon
          id={guideLine.id!.toString()}
          points={Array.from(
            calculateGuideLineHiddenScalingPolygon(
              guideLine,
              viewBoxScale,
              currentScale
            )
          ).reduce((str, point) => str + " " + point!.x + "," + point!.y, "")}
          currentScale={currentScale}
        />
      ) : null}

      {guideLine.linePoints.point1 &&
        guideLine.linePoints.point2 &&
        guideLine.id === selectedGuideLineId && (
          <>
            <SVGCircle
              id={"move;" + guideLine.id!.toString()}
              cx={
                (guideLine.linePoints.point1.x +
                  guideLine.linePoints.point2.x) /
                2
              }
              cy={
                (guideLine.linePoints.point1.y +
                  guideLine.linePoints.point2.y) /
                2
              }
              currentScale={currentScale}
            />
            <SVGCircle
              id={"point1;" + guideLine.id!.toString()}
              cx={guideLine.linePoints.point1.x}
              cy={guideLine.linePoints.point1.y}
              style={{ stroke: "yellow", fill: "yellow" }}
              currentScale={currentScale}
            />
            <SVGCircle
              id={"point2;" + guideLine.id!.toString()}
              cx={guideLine.linePoints.point2.x}
              cy={guideLine.linePoints.point2.y}
              style={{ stroke: "yellow", fill: "yellow" }}
              currentScale={currentScale}
            />
          </>
        )}
    </g>
  );
}

const SVGLine = styled.line<{ currentScale: number }>`
  stroke-width: ${(props) => 0.25 / props.currentScale}pt;
`;

const SVGPolygon = styled.polygon<{ currentScale: number }>`
  stroke: white;
  stroke-width: ${(props) => 1 / props.currentScale}pt;
  stroke-opacity: 0;
  fill-opacity: 0;
`;

const SVGCircle = styled.circle<{ currentScale: number }>`
  fill: red;
  r: ${(props) => 2 / props.currentScale}pt;
  stroke: red;
  stroke-width: ${(props) => 1 / props.currentScale}pt;
  stroke-dasharray: 0;
  stroke-linejoin: round;
`;
