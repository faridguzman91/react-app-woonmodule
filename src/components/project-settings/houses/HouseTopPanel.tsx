import React, { useContext, useEffect } from "react";
import ScrollMenu from "react-horizontal-scrolling-menu";
import { makeStyles } from "@material-ui/core";
import { HouseItem } from "./HouseItem";
import { HouseDto } from "../../../dto";
import { HouseContext } from "../../../context/HouseContext";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { AppMode, AppModeContext } from "../../../context/AppModeContext";

const useStyles = makeStyles(() => ({
  arrow: {
    backgroundColor: "#eee",
    color: "gray",
    fontSize: "40pt",
    marginTop: "3px",
    paddingTop: "2.5px",
    paddingBottom: "4px",
    cursor: "pointer",
  },
  arrowLeft: {
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  arrowRight: {
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
}));

interface HouseTopPanelProps {
  houses: HouseDto[];
  selectedHouse: HouseDto | null;
  setOpenedHouse: (house: HouseDto) => void;
  focusPlot: (house: string | null) => void;
  editPolygon: () => void;
  deletePolygon: () => void;
  drawPolygon: () => void;
}

export const HouseTopPanel = ({
  houses,
  selectedHouse,
  setOpenedHouse,
  focusPlot,
  editPolygon,
  deletePolygon,
  drawPolygon,
}: HouseTopPanelProps) => {
  const classes = useStyles();
  const { setHouse, polygonId } = useContext(HouseContext);
  const { appMode } = useContext(AppModeContext);

  useEffect(() => {
    if (!selectedHouse && houses.length > 0) {
      setHouse(houses[0]);
    }
  }, [selectedHouse]);

  const Menu = (houses: HouseDto[], selectedHouse: HouseDto | null) =>
    houses.map((house: HouseDto) => {
      return (
        <HouseItem
          house={house}
          key={house.number}
          selected={house.number === selectedHouse?.number}
          editPolygon={editPolygon}
          deletePolygon={deletePolygon}
          drawPolygon={drawPolygon}
        />
      );
    });

  const menu = Menu(houses, selectedHouse);

  const onSelect = (key: string | number | null) => {
    if (typeof key === "string") {
      const openedHouse = houses.find((house) => house.number === Number(key));
      if (openedHouse) {
        setOpenedHouse(openedHouse);
        setHouse(openedHouse);
        if (openedHouse.polygons.length > 0) {
          if (
            openedHouse.polygons.find((polygon) => polygon.id === polygonId)
          ) {
            focusPlot(polygonId);
          } else {
            focusPlot(openedHouse.polygons[0].id);
          }
        } else {
          focusPlot(null);
        }
      }
    }
  };

  return (
    <ScrollMenu
      wheel={true}
      wrapperStyle={{
        width: "100%",
        padding: 0,
        backgroundColor: "#eee",
      }}
      data={menu}
      arrowLeft={
        <ArrowLeftIcon className={`${classes.arrow} ${classes.arrowLeft}`} />
      }
      arrowRight={
        <ArrowRightIcon className={`${classes.arrow} ${classes.arrowRight}`} />
      }
      selected={String(selectedHouse?.number)}
      onSelect={onSelect}
    />
  );
};
