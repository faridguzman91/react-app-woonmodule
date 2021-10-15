import React from "react";
import { PolygonType } from "../../../dto/PolygonType";
import { ViewBoxScale } from "./Canvas";
import { HouseDto } from "../../../dto";

interface ExportSvgProps {
  houses: HouseDto[] | undefined;
  aerialView: string;
  viewBoxScale: ViewBoxScale;
}

export const ExportSvg = (props: ExportSvgProps) => {
  const { aerialView, viewBoxScale, houses } = props;

  return (
    <svg
      id={"export-svg"}
      style={{
        width: "100%",
        cursor: "crosshair",
      }}
      height={viewBoxScale.point2.y}
      viewBox={`${viewBoxScale.point1.x} ${viewBoxScale.point1.y} 
        ${viewBoxScale.point2.x} ${viewBoxScale.point2.y}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <style>
        {`
           .polygonStyle
        {
          pointer-events: auto;
          fill: #508ef2;
          fill-opacity: 0.3;
          stroke: #FFFFFF;
          stroke-width: 1;
        }
          `}
      </style>
      <image
        style={{
          visibility: "visible",
          overflow: "visible",
          width: "100%",
        }}
        width={viewBoxScale.point2.x}
        height={viewBoxScale.point2.y}
        xlinkHref={aerialView}
        onDragStart={(event) => {
          event.preventDefault();
        }}
      />
      {houses &&
        houses.map((house) => (
          <g id={"house" + house.number}>
            {house.polygons.map((polygon: PolygonType) => (
              <polygon
                id={polygon.id}
                points={Array.from(polygon.points).reduce(
                  (str, point) => str + " " + point.x + "," + point.y,
                  ""
                )}
              />
            ))}
          </g>
        ))}
    </svg>
  );
};
