import React from "react";
import styled from "styled-components";
import { HouseDto } from "../../dto";

type TooltipProps = {
  tooltipFor: HouseDto | null;
  position: any;
  isEditButtonClicked: boolean;
};

function HouseTooltip(props: TooltipProps) {
  if (!props.tooltipFor || props.isEditButtonClicked) {
    return null;
  }

  const house: HouseDto = props.tooltipFor;
  const position = props.position;

  return (
    <TooltipWrapper
      top={position.top}
      left={position.left - 175}
      backgroundColor={house.polygons[0]?.editorSettings.fillColor}
    >
      <div>{`House number: ${house.number || ""}`}</div>
      <div>{`House type: ${house.type || ""}`}</div>
      <div>{`House status: ${house.status || ""}`}</div>
      <div>{`€ ${house.price && house.price.toLocaleString("nl-NL") || ""}`}</div>
      <div>
        Kavel afmeting: 
        {house.plotSize && house.plotSize.toLocaleString("nl-NL") || ""} m<sup>2</sup>
      </div>
      <div>
        Gebruiksoppervlakte woning: 
        {house.houseSize && house.houseSize.toLocaleString("nl-NL") || ""} m<sup>2</sup>
      </div>
    </TooltipWrapper>
  );
}
type TooltipWrapperProps = { backgroundColor: any; top: any; left: any };
const TooltipWrapper = styled.div`
  width: 150px;
  display: flex;
  flex-direction: column;
  position: absolute;
  text-align: center;
  color: white;
  font-size: 12px;
  background-color: ${(props: TooltipWrapperProps) => props.backgroundColor};
  top: ${(props: TooltipWrapperProps) => props.top || 0}px;
  left: ${(props: TooltipWrapperProps) => props.left || 0}px;
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
    border-top: 16px solid
      ${(props: TooltipWrapperProps) => props.backgroundColor};
  }
`;

export default HouseTooltip;
