import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Polygon } from "./Polygon";
import { Point, PolygonType, Segment } from "../../../dto/PolygonType";
import { GuideLine } from "./GuideLine";
import { GuideLineType } from "../../../dto/GuideLineType";
import { DEFAULT_EDITOR_SETTINGS } from "../../../dto/Project";
import { HouseContext } from "../../../context/HouseContext";
import { AppMode, AppModeContext } from "../../../context/AppModeContext";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { convertScreenToSVGCoordinates } from "./utils/MapBuildUtils";
import penCursor from "../../../assets/penCursor.png";
import { ToolboxContext } from "../../../context/ToolboxContext";

export type ViewBoxScale = {
  point1: Point;
  point2: Point;
};

export function Canvas(props: {
  aerialView: string;
  onMouseMove: any;
  onClickTargetXY: any;
  onMouseDownTargetXY: (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => void;
  onMouseUpTargetXY: (
    target: any,
    x: number,
    y: number,
    ctrl: boolean,
    alt: boolean,
    shift: boolean
  ) => void;
  style?: any;
  onMouseLeave: any;
  newPath: any;
  newGuideLine: Point[] | null;
  polygons: any;
  canvasMousePosition: Point | null;
  isDrawingPath: boolean;
  polygonToEditId: string | null;
  guideLines: GuideLineType[] | null;
  onRightClick: (x: number, y: number) => void;
  viewBoxScale: ViewBoxScale;
  handleKeyboardMove: (shift: { x: number; y: number }) => void;
  savePolygon: () => void;
  selectedGuideLineId: string | undefined | null;
  isHoveredPolygonCenter: boolean;
  hoveredSegment: Segment | null;
  hoveredPlot: PolygonType | null;
}) {
  const {
    aerialView,
    guideLines,
    newGuideLine,
    polygons,
    polygonToEditId,
    newPath,
    isDrawingPath,
    canvasMousePosition,
    onClickTargetXY,
    onMouseDownTargetXY,
    onMouseUpTargetXY,
    onMouseLeave,
    onMouseMove,
    onRightClick,
    style,
    viewBoxScale,
    handleKeyboardMove,
    savePolygon,
    selectedGuideLineId,
    isHoveredPolygonCenter,
    hoveredSegment,
    hoveredPlot,
  } = props;

  const svg = useRef<any>(null);
  const [svgPoint, setSvgPoint] = useState<any>(null);
  const [scrollY, setScrollY] = useState(0);
  const currentScale = useRef(1);
  const translateX = useRef(0);
  const translateY = useRef(0);
  const [allowZoomAndPan, setAllowZoomAndPan] = useState(false);
  const [enableWheel, setEnableWheel] = useState(false);
  const [isCanvasInited, setIsCanvasInited] = useState(false);
  const [isTransformDisabled, setIsTransformDisabled] = useState(false);

  const { house } = useContext(HouseContext);
  const { appMode } = useContext(AppModeContext);
  const {
    isEditButtonClicked,
    isMovingPolygon,
    isMovingGuideLine,
    isMovingGuideLinePoint,
    imageShown,
    guideLinesShown,
    isResetTransform,
    setIsResetTransform,
    setCurrentScale,
  } = useContext(ToolboxContext);

  useEffect(() => {
    svg.current && setSvgPoint(svg.current.createSVGPoint());
  }, [svg]);

  useEffect(() => {
    if (appMode === AppMode.view && isCanvasInited) {
      setIsResetTransform(true);
    } else if (appMode === AppMode.edit && isCanvasInited) {
      setIsTransformDisabled(false);
    }
  }, [appMode, isCanvasInited]);

  useEffect(() => {
    if (appMode === AppMode.view && !isResetTransform) {
      setIsTransformDisabled(true);
    }
  }, [isResetTransform]);

  useEffect(() => {
    console.debug("currentScale changed");
    if (appMode === AppMode.view) {
      currentScale.current = 1;
      setCurrentScale(1);
      return;
    }
    setCurrentScale(currentScale.current);
  }, [currentScale.current]);

  const updateMousePosition = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    if (!e.ctrlKey) e.stopPropagation();
    if (!svgPoint) return;
    let cursorpt = convertScreenToSVGCoordinates(
      e.clientX,
      e.clientY,
      svg.current,
      svgPoint,
      currentScale.current,
      translateX.current,
      translateY.current
    );
    //console.debug("MATRIX::", svg.current.getCTM(), svg.current.getScreenCTM());
    cursorpt &&
      onMouseMove &&
      onMouseMove(
        e.target,
        cursorpt.x,
        cursorpt.y,
        e.clientX,
        e.clientY + scrollY,
        e.ctrlKey,
        e.altKey,
        e.shiftKey
      );
  };

  function handleClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (!e.ctrlKey) {
      e.preventDefault();
      if (!svgPoint) return;
      let cursorpt = convertScreenToSVGCoordinates(
        e.clientX,
        e.clientY,
        svg.current,
        svgPoint,
        currentScale.current,
        translateX.current,
        translateY.current
      );
      cursorpt &&
        onClickTargetXY(
          e.target,
          cursorpt.x,
          cursorpt.y,
          e.ctrlKey,
          e.altKey,
          e.shiftKey
        );
    }
  }

  function handleRightClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    e.preventDefault();
    if (!e.ctrlKey) {
      let cursorpt = convertScreenToSVGCoordinates(
        e.clientX,
        e.clientY,
        svg.current,
        svgPoint,
        currentScale.current,
        translateX.current,
        translateY.current
      );
      cursorpt && onRightClick(cursorpt.x, cursorpt.y);
    }
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (!e.ctrlKey) {
      e.preventDefault();
      if (!svgPoint) return;
      let cursorpt = convertScreenToSVGCoordinates(
        e.clientX,
        e.clientY,
        svg.current,
        svgPoint,
        currentScale.current,
        translateX.current,
        translateY.current
      );
      cursorpt &&
        onMouseDownTargetXY(
          e.target,
          cursorpt.x,
          cursorpt.y,
          e.ctrlKey,
          e.altKey,
          e.shiftKey
        );
    }
  }

  function handleMouseUp(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (!e.ctrlKey) {
      e.preventDefault();
      if (!svgPoint) return;
      let cursorpt = convertScreenToSVGCoordinates(
        e.clientX,
        e.clientY,
        svg.current,
        svgPoint,
        currentScale.current,
        translateX.current,
        translateY.current
      );
      cursorpt &&
        onMouseUpTargetXY(
          e.target,
          cursorpt.x,
          cursorpt.y,
          e.ctrlKey,
          e.altKey,
          e.shiftKey
        );
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    if (event.ctrlKey && key === "ArrowRight") {
      event.preventDefault();
      handleKeyboardMove({ x: 1, y: 0 });
    } else if (event.ctrlKey && key === "ArrowLeft") {
      event.preventDefault();
      handleKeyboardMove({ x: -1, y: 0 });
    } else if (event.ctrlKey && key === "ArrowUp") {
      event.preventDefault();
      handleKeyboardMove({ x: 0, y: -1 });
    } else if (event.ctrlKey && key === "ArrowDown") {
      event.preventDefault();
      handleKeyboardMove({ x: 0, y: 1 });
    } else if (key === "Enter") {
      savePolygon();
    } else if (event.ctrlKey) {
      setAllowZoomAndPan(true);
      setEnableWheel(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!event.ctrlKey) {
      setEnableWheel(false);
    }
  };

  const handleScroll = React.useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    document.addEventListener("scroll", handleScroll, false);
    return () => document.removeEventListener("scroll", handleScroll, false);
  }, []);

  return (
    <TransformWrapper
      wheel={{
        step: 40,
        wheelEnabled: enableWheel,
        disabled: isTransformDisabled,
      }}
      pan={{
        disabled: !enableWheel,
      }}
      scalePadding={{
        disabled: true,
        animationTime: 0,
      }}
      zoomIn={{
        disabled: isTransformDisabled,
      }}
      zoomOut={{
        disabled: isTransformDisabled,
      }}
      pinch={{
        disabled: isTransformDisabled,
      }}
      doubleClick={{
        disabled: isTransformDisabled,
      }}
      // @ts-ignore
      onInit={() => {
        setIsCanvasInited(true);
      }}
    >
      {({
        // @ts-ignore
        scale,
        // @ts-ignore
        positionX,
        // @ts-ignore
        positionY,
        // @ts-ignore
        resetTransform,
        // @ts-ignore
        onInit,
      }) => {
        if (isResetTransform) {
          resetTransform();
        }
        if (isResetTransform && scale === 1) {
          setIsResetTransform(false);
        }
        currentScale.current = scale;
        translateX.current = -positionX;
        translateY.current = -positionY;

        return (
          <>
            <TransformComponent>
              <svg
                style={{
                  width: "100%",
                  cursor: enableWheel
                    ? "move"
                    : isDrawingPath || isEditButtonClicked
                    ? isMovingPolygon || isHoveredPolygonCenter
                      ? "move"
                      : `url(${penCursor}) 0 32, auto`
                    : isMovingGuideLine || isMovingGuideLinePoint
                    ? "move"
                    : "crosshair",
                  border: "1px solid black",
                }}
                height={"100%"}
                viewBox={`${viewBoxScale.point1.x} ${viewBoxScale.point1.y} 
              ${viewBoxScale.point2.x} ${viewBoxScale.point2.y}`}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                ref={svg}
                onClick={(e) => handleClick(e)}
                onContextMenu={(e) => handleRightClick(e)}
                onMouseMove={(e) => updateMousePosition(e)}
                onMouseLeave={onMouseLeave}
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseUp={(e) => handleMouseUp(e)}
                //todo onWheel={() => {console.debug("HOLD CTRL")}}
              >
                <image
                  style={{
                    visibility: imageShown ? "visible" : "hidden",
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
                {newGuideLine && newGuideLine.length === 2 && (
                  <GuideLine
                    guideLine={{
                      id: "new-line",
                      linePoints: {
                        point1: newGuideLine[0],
                        point2: newGuideLine[1],
                      },
                    }}
                    selectedGuideLineId={selectedGuideLineId}
                    currentScale={currentScale.current}
                    viewBoxScale={viewBoxScale}
                  />
                )}
                {newPath && house && (
                  <Polygon
                    polygon={{
                      id: "x-polygon",
                      points: newPath,
                      houseNumber: house!.number,
                      editorSettings:
                        house?.polygons.length > 0 &&
                        house?.polygons[0].editorSettings
                          ? house.polygons[0].editorSettings
                          : DEFAULT_EDITOR_SETTINGS,
                    }}
                    isDrawingPath={isDrawingPath}
                    currentScale={currentScale.current}
                    isNewPath={true}
                    hoveredPlot={hoveredPlot}
                  />
                )}
                {polygons &&
                  polygons.map((polygon: PolygonType, i: number) => (
                    <Polygon
                      key={i}
                      polygon={polygon}
                      polygonToEditId={polygonToEditId}
                      isDrawingPath={isDrawingPath}
                      currentScale={currentScale.current}
                      isNewPath={false}
                      hoveredPlot={hoveredPlot}
                    />
                  ))}

                {/* TODO: what is the reason to not just use guideline property instead of separating each property?*/}
                {guideLinesShown &&
                  guideLines?.map((guideLine: GuideLineType, i: number) => (
                    <GuideLine
                      key={i}
                      guideLine={{
                        id: guideLine.id,
                        linePoints: {
                          point1: guideLine.linePoints.point1,
                          point2: guideLine.linePoints.point2,
                        },
                        polygonPoints: {
                          point1: guideLine.polygonPoints?.point1,
                          point2: guideLine.polygonPoints?.point2,
                          point3: guideLine.polygonPoints?.point3,
                          point4: guideLine.polygonPoints?.point4,
                        },
                        style: guideLine.style,
                      }}
                      selectedGuideLineId={selectedGuideLineId}
                      currentScale={currentScale.current}
                      viewBoxScale={viewBoxScale}
                    />
                  ))}

                {canvasMousePosition && (
                  <SVGCircle
                    pointerEvents="none"
                    cx={canvasMousePosition.x}
                    cy={canvasMousePosition.y}
                    //r={canvasSettings.cornersRadius}
                    //fill={canvasSettings.strokeColor}
                    currentScale={currentScale.current}
                  />
                )}

                {hoveredSegment &&
                  isEditButtonClicked &&
                  !isMovingGuideLine &&
                  !isMovingPolygon && (
                    <GraySVGCircle
                      pointerEvents="none"
                      cx={
                        (hoveredSegment.sides[0].x +
                          hoveredSegment.sides[1].x) /
                        2
                      }
                      cy={
                        (hoveredSegment.sides[0].y +
                          hoveredSegment.sides[1].y) /
                        2
                      }
                      currentScale={currentScale.current}
                    />
                  )}
              </svg>
            </TransformComponent>
          </>
        );
      }}
    </TransformWrapper>
  );
}

const CanvasZoomTools = styled.div`
  position: absolute;
  top: -30px;
  right: 0;
`;

const SVGCircle = styled.circle<{ currentScale: number }>`
  fill: white;
  r: ${(props) => 2 / props.currentScale}pt;
  stroke: #508ef2;
  stroke-width: ${(props) => 1 / props.currentScale}pt;
  stroke-dasharray: 0;
  stroke-linejoin: round;
`;

const GraySVGCircle = styled.circle<{ currentScale: number }>`
  fill: gray;
  r: ${(props) => 2 / props.currentScale}pt;
  stroke: #ffffff;
  stroke-width: ${(props) => 1 / props.currentScale}pt;
  stroke-dasharray: 0;
  stroke-linejoin: round;
`;
