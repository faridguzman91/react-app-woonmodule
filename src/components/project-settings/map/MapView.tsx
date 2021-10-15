import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import HouseTooltip from "../../tooltips/HouseTooltip";
import { HouseDto } from "../../../dto";
import { Canvas, ViewBoxScale } from "./Canvas";
import { Point, PolygonType, Segment } from "../../../dto/PolygonType";
import { GuideLineType } from "../../../dto/GuideLineType";
import {
  AUTO_HIDDEN_ALERT_DURATION,
  INITIAL_VIEW_BOX_X_VALUE,
} from "../../../constants/constants";
import { HouseContext } from "../../../context/HouseContext";

export function MapView(props: {
  aerialView: string;
  savedPolygons: any[];
  selectedPlot: string | null;
  setSelectedPlot: (id: string | null) => void;
  houses: HouseDto[] | null;
}) {
  const {
    aerialView,
    savedPolygons,
    selectedPlot,
    setSelectedPlot,
    houses,
  } = props;

  const [componentSavedPolygons, setComponentSavedPolygons] = useState<
    PolygonType[]
  >([]);
  const [hoveredPlot, setHoveredPlot] = useState<PolygonType | null>(null);
  const [toolTipHouse, setToolTipHouse] = useState<HouseDto | null>(null);
  const [viewBoxScale, setViewBoxScale] = useState<ViewBoxScale>({
    point1: { x: 0, y: 0 },
    point2: { x: INITIAL_VIEW_BOX_X_VALUE, y: 0 },
  });

  const { house, polygonId, setPolygonId } = useContext(HouseContext);

  const popupPosition = useRef({ top: -99, left: -99 });
  const maxPlotId = useRef(1);

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
      setHoveredPlot(null);
      setPolygonId(null);
    }
  }, [selectedPlot]);

  function setPopUpPosition(target: Element) {
    let boundingRect = target.getBoundingClientRect();
    popupPosition.current = {
      left: (boundingRect.left + boundingRect.right) / 2,
      top: boundingRect.top + window.pageYOffset + -250,
    };
  }

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

    if (target.tagName === "polygon") {
      if (!hoveredPlot || target.id !== hoveredPlot.id) {
        setPopUpPosition(target);
        setHoveredPlot(
          savedPolygons.find((polygon) => polygon.id === target.id)
        );
      }
    } else {
      if (hoveredPlot) setHoveredPlot(null);
    }
  }

  const handleTargetClick = (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => {
    if (target.tagName === "polygon") {
      setSelectedPlot(target.id);
    }
  };

  return (
    <div style={{ flex: 1, position: "relative", paddingTop: "10px" }}>
      {aerialView ? (
        <>
          {hoveredPlot && (
            <HouseTooltip
              position={popupPosition.current}
              tooltipFor={toolTipHouse}
              isEditButtonClicked={false}
            />
          )}
          <Canvas
            //style={{ cursor: "crosshair" }}
            newGuideLine={null}
            guideLines={[]}
            polygonToEditId={null}
            aerialView={aerialView}
            newPath={null}
            polygons={componentSavedPolygons}
            canvasMousePosition={null}
            onClickTargetXY={(
              target: any,
              x: number,
              y: number,
              ctrl: boolean,
              alt: boolean,
              shift: boolean
            ) => handleTargetClick(target, x, y, ctrl, alt, shift)}
            onMouseDownTargetXY={() => {}}
            onMouseUpTargetXY={() => {}}
            isDrawingPath={false}
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
            selectedGuideLineId={null}
            onMouseLeave={() => {}}
            onRightClick={(x: number, y: number) => {}}
            viewBoxScale={viewBoxScale}
            handleKeyboardMove={() => {}}
            savePolygon={() => {}}
            isHoveredPolygonCenter={false}
            hoveredSegment={null}
            hoveredPlot={hoveredPlot}
          />
        </>
      ) : (
        "Loading ..."
      )}
    </div>
  );
}
