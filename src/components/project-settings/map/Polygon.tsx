import React, { useContext } from "react";
import styled from "styled-components";
import { Point, PolygonType } from "../../../dto/PolygonType";
import { HouseContext } from "../../../context/HouseContext";
import { findPolygonCenter } from "./utils/MapBuildUtils";

export function Polygon(props: {
  polygon: PolygonType;
  polygonToEditId?: string | null;
  isDrawingPath?: boolean | null | undefined;
  currentScale: number;
  isNewPath: boolean;
  hoveredPlot: PolygonType | null;
}) {
  const polygon = props.polygon;
  const currentScale = props.currentScale;
  const isDrawingPath = props.isDrawingPath;
  const isNewPath = props.isNewPath;
  const hoveredPlot = props.hoveredPlot;
  const center: Point = findPolygonCenter(polygon);
  const magneticPolygonScale = 1 + 0.07 / currentScale;
  const scaledCenterX = center.x - magneticPolygonScale * center.x;
  const scaledCenterY = center.y - magneticPolygonScale * center.y;
  const { house, polygonId } = useContext(HouseContext);
  const disableEvents = polygon.id === "x-polygon"; // || polygon.id === props.polygonToEditId;

  return (
    <g>
      {/*<title>{`${polygon.id === "x-polygon" ? "New " : ""} Plot ${*/}
      {/*    polygon.plotNumber || ""*/}
      {/*} ${polygon.status || ""}`}</title>*/}

      {isDrawingPath && (
        <MagneticSVGPolygon
          transform={`matrix(${magneticPolygonScale}, 0, 0, ${magneticPolygonScale}, ${scaledCenterX}, ${scaledCenterY})`}
          style={{ pointerEvents: disableEvents ? "none" : "auto" }}
          id={"magnetic-polygon;" + polygon.id}
          points={Array.from(polygon.points).reduce(
            (str, point) => str + " " + point.x + "," + point.y,
            ""
          )}
        />
      )}

      <SVGPolygon
        style={{ pointerEvents: disableEvents ? "none" : "auto" }}
        id={polygon.id}
        fill={
          polygon.id ===
          (house && house.polygons.length > 0 ? polygonId : undefined)
            ? house?.polygons[0].editorSettings.fillColor
            : polygon.editorSettings.fillColor
        }
        fillOpacity={
          polygon.id ===
            (house && house.polygons.length > 0 ? polygonId : undefined) ||
          polygon.id === "x-polygon" ||
          polygon.id === polygonId
            ? 0.8
            : polygon.houseNumber === hoveredPlot?.houseNumber
            ? 0.6
            : 0.3
        }
        stroke={
          polygon.id ===
          (house && house.polygons.length > 0 ? polygonId : undefined)
            ? house?.polygons[0].editorSettings.strokeColor
            : polygon.editorSettings.strokeColor
        }
        strokeWidth={
          polygon.id ===
          (house && house.polygons.length > 0 ? polygonId : undefined)
            ? house?.polygons[0].editorSettings.strokeWidth
            : polygon.editorSettings.strokeWidth
        }
        points={Array.from(polygon.points).reduce(
          (str, point) => str + " " + point.x + "," + point.y,
          ""
        )}
        currentScale={currentScale}
        isActive={
          polygon.id ===
            (house && house.polygons.length > 0 ? polygonId : undefined) ||
          polygon.id === "x-polygon" ||
          polygon.id === polygonId
        }
      />

      {polygon.id === "x-polygon" || polygon.id === props.polygonToEditId
        ? Array.from(polygon.points).map(
            (point, i) =>
              (!props.isDrawingPath || i < polygon.points.length - 1) && (
                <SVGCircle
                  style={{
                    pointerEvents: disableEvents && i > 0 ? "none" : "auto",
                    stroke: isNewPath ? "orange" : "",
                  }}
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={polygon.editorSettings.cornersRadius / currentScale}
                  fill={polygon.editorSettings.fillColor}
                  data-polygonId={polygon.id}
                  currentScale={currentScale}
                />
              )
          )
        : props.isDrawingPath &&
          Array.from(polygon.points).map((point, i) => (
            <SVGMagneticCircle
              key={i}
              cx={point.x}
              cy={point.y}
              data-polygonId={polygon.id}
              currentScale={currentScale}
              //r={props.cornersRadius}
              //fill={props.strokeColor}
            />
          ))}
      {polygon.id === props.polygonToEditId && (
        <SVGCircle
          id={"center"}
          style={{
            pointerEvents: disableEvents ? "none" : "auto",
            fill: "orange",
            stroke: "orange",
          }}
          key={polygon.points.length}
          cx={center.x}
          cy={center.y}
          r={polygon.editorSettings.cornersRadius / currentScale}
          fill={polygon.editorSettings.fillColor}
          data-polygonId={polygon.id}
          currentScale={currentScale}
        />
      )}
    </g>
  );
}

const SVGCircle = styled.circle<{ currentScale: number }>`
  fill: white;
  r: ${(props) => 2 / props.currentScale}pt;
  stroke: ${(props) => props.fill};
  stroke-width: ${(props) => 2 / props.currentScale}pt;
  stroke-dasharray: 0;
  stroke-linejoin: round;
`;

const SVGMagneticCircle = styled.circle<{ currentScale: number }>`
  fill: red;
  fill-opacity: 0;
  r: ${(props) => 5 / props.currentScale}pt;
  &:hover {
    fill-opacity: 1;
    r: ${(props) => 5 / props.currentScale}pt;
  }
`;

const SVGPolygon = styled.polygon<{ currentScale: number; isActive: boolean }>`
  stroke-width: ${(props) => Number(props.strokeWidth) / props.currentScale};
  &:hover {
    stroke-width: ${(props) =>
      (Number(props.strokeWidth) + 1) / props.currentScale};
    fill-opacity: ${(props) => (props.isActive ? 0.8 : 0.6)};
  }
`;

const MagneticSVGPolygon = styled.polygon`
  fill-opacity: 0;
  stroke-width: ${(props) => Number(props.strokeWidth)};
  &:hover {
    fill-opacity: 0;
  }
`;
