import React from "react";
import styled from "styled-components";
import { SvgIcon } from "@material-ui/core";

const ADD_ICON_PATH = "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z";
type TooltipProps = { position: { top: number; left: number } };

export function AddPointTooltip(props: TooltipProps) {
  const position = props.position;

  return (
    <TooltipWrapper top={position.top - 75} left={position.left - 75}>
      <SvgIcon>
        <path d={ADD_ICON_PATH} />
      </SvgIcon>
      <div>Add point</div>
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
