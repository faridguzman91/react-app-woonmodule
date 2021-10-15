import React from "react";
import styled from "styled-components";

type TooltipProps = { position: { top: number; left: number } };

export function GuideLineTooltip(props: TooltipProps) {
  const position = props.position;

  return (
    <TooltipWrapper
      top={position.top - 75}
      left={position.left - 75}
    >
      <div>Right click to remove line</div>
      {/*{plot.url && <PlotUrl href={plot.url}>{plot.url}</PlotUrl>}*/}
    </TooltipWrapper>
  );
}

type TooltipWrapperProps = { top: number; left: number };
const TooltipWrapper = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  position: absolute;
  text-align: center;
  color: white;
  font-size: 12px;
  top: ${(props: TooltipWrapperProps) => props.top || 0}px;
  left: ${(props: TooltipWrapperProps) => props.left || 0}px;
  background-color: rgb(93, 149, 230);
  border-radius: 5px;
  z-index: 1;
  padding: 5px 3px;
  font-weight: bold;

  &:after {
    content: "";
    position: absolute;
    bottom: -16px;
    left: 0;
    right: 0;
    margin: auto;
    width: 0;
    height: 0;
    border-left: 16px solid transparent;
    border-right: 16px solid transparent;
    border-top: 16px solid "red";
  }
`;

const PlotUrl = styled.a`
  color: white;
  white-space: nowrap;
  overflow: hidden;
  font-size: 11px;
`;
