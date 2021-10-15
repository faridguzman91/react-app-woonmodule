import React from "react";
import styled from "styled-components";

type TooltipProps = { position: { top: number; left: number } };

export function MovePolygonTooltip(props: TooltipProps) {
    const position = props.position;
    return (
        <TooltipWrapper top={position.top + 130} left={position.left - 60}>
            <div>Hold to move polygon</div>
        </TooltipWrapper>
    );
}

type TooltipWrapperProps = { top: number; left: number };
const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  text-align: center;
  color: red;
  font-size: 12px;
  top: ${(props: TooltipWrapperProps) => props.top || 0}px;
  left: ${(props: TooltipWrapperProps) => props.left || 0}px;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1;
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
  }
`;
