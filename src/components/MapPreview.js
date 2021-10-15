import React, { useState, useRef } from "react";
import Canvas from "./Canvas";
import styled from "styled-components";
import HouseTooltip from "./tooltips/HouseTooltip";
import PlotFilter from "./PlotFilter";

function MapPreview(props) {
  const { aerialView, savedPolygons } = props;

  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const popupPosition = useRef({ top: 0, left: 0 });

  function handleMouseMove(target, x, y) {
    if (target.tagName === "polygon") {
      if (!hoveredPlot || target.id !== hoveredPlot.id) {
        let boundingRect = target.getBoundingClientRect();
        popupPosition.current = {
          left: (boundingRect.left + boundingRect.right) / 2,
          top: boundingRect.top + window.pageYOffset - 100,
        };
        setHoveredPlot(
          savedPolygons.find((polygon) => polygon.id === target.id)
        );
      }
    } else {
      if (hoveredPlot) setHoveredPlot(null);
    }
  }

  function handleTargetXYClicked(target, x, y) {
    if (target.tagName === "polygon" || target.tagName === "circle") {
      setSelectedPlotId(target.id);
    } else {
      setSelectedPlotId(null);
    }
  }

  function onFilterChanged(value) {
    let newFilters;
    if (selectedFilters.includes(value)) {
      newFilters = selectedFilters.filter((selected) => selected !== value);
    } else {
      newFilters = selectedFilters.concat([value]);
    }
    setSelectedFilters(newFilters);
  }

  function calculateDesiredPolygonOpacity(polygon) {
    if (selectedPlotId === polygon.id) return 0.7;
    if (selectedFilters.includes(polygon.status)) return 0.7;
    return 0.0;
  }

  function calculateDesiredPolygoneFill(polygon) {
    switch (polygon.status) {
      case "red":
        return "#fc6423";
      case "green":
        return "#00cf8a";
      case "yellow":
        return "#d9cd48";
      default:
        return "#508ef2";
    }
  }

  return (
    <MapPreviewContainer>
      {aerialView ? (
        <div>
          {hoveredPlot && (
            <HouseTooltip
              position={popupPosition.current}
              tooltipFor={hoveredPlot}
            />
          )}
          <PlotFilter
            selected={selectedFilters}
            onFilterChanged={onFilterChanged}
          />
          <Canvas
            style={{ float: "left", width: "100%" }}
            aerialView={aerialView}
            selectedPlotId={selectedPlotId}
            editorSettings={props.editorSettings}
            getPolygonOpacity={calculateDesiredPolygonOpacity}
            getPolygonFill={calculateDesiredPolygoneFill}
            polygons={savedPolygons}
            onClickTargetXY={(target, x, y) =>
              handleTargetXYClicked(target, x, y)
            }
            onMouseMove={(target, x, y) => handleMouseMove(target, x, y)}
          />
        </div>
      ) : (
        ""
      )}
    </MapPreviewContainer>
  );
}

export default MapPreview;

const MapPreviewContainer = styled.div`
  max-width: 1024px;
  margin: auto;
`;
