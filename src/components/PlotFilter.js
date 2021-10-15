import React from "react";
import styled, { css } from "styled-components";

function PlotFilter(props) {
  return (
    <FilterWrapper>
      <FilterOption
        value="green"
        selected={props.selected && props.selected.includes("green")}
        color="#2e8529"
        onClick={() => props.onFilterChanged("green")}
      >
        green
      </FilterOption>
      <FilterOption
        value="yellow"
        selected={props.selected && props.selected.includes("yellow")}
        color="#f29100"
        onClick={() => props.onFilterChanged("yellow")}
      >
        yellow
      </FilterOption>
      <FilterOption
        value="red"
        selected={props.selected && props.selected.includes("red")}
        color="#ea2f00"
        onClick={() => props.onFilterChanged("red")}
      >
        red
      </FilterOption>
    </FilterWrapper>
  );
}

const FilterWrapper = styled.div`
  display: inline-flex;
  width: 450px;
  margin: 8px;
`;

const FilterOption = styled.div`
  width: 150px;
  padding: 10px 5px;
  text-align: center;
  border-left: 5px solid ${(props) => props.color};
  box-sizing: border-box;
  cursor: pointer;

  ${(props) =>
    props.selected &&
    css`
      background-color: ${props.color};
      color: white;
    `}

  transition: border-width .4s ease-out;

  &:hover {
    border-left: 10px solid ${(props) => props.color};
  }
`;

export default PlotFilter;
