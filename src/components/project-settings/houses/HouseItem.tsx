import React, { useContext, useEffect } from "react";
import { Box, Icon, makeStyles, Tooltip } from "@material-ui/core";
import { DEFAULT_EDITOR_SETTINGS } from "../../../dto/Project";
import { HouseDto } from "../../../dto";
import IconButton from "@material-ui/core/IconButton";
import editPolygonImg from "../../../assets/polygonEdit.png";
import deletePolygonImg from "../../../assets/polygonRemove.png";
import addPolygonImg from "../../../assets/polygonAdd.png";
import polygonImg from "../../../assets/polygon.png";
import { ToolboxContext } from "../../../context/ToolboxContext";
import { HouseContext } from "../../../context/HouseContext";
import { AppMode, AppModeContext } from "../../../context/AppModeContext";

const useStyles = makeStyles(() => ({
  menuItem: {
    textAlign: "center",
    margin: "5px 10px",
    userSelect: "none",
    cursor: "pointer",
  },
  menuItemPart: {
    padding: "5px",
    userSelect: "none",
    cursor: "pointer",
    border: "1px black solid",
    lineHeight: "35px",
    height: "35px",
    minWidth: "35px",
    backgroundColor: "white",
  },
  activeLeft: {
    border: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
    borderLeft: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
    borderBottom: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
  },
  activeRight: {
    borderTop: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
    borderRight: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
    borderBottom: `3px ${DEFAULT_EDITOR_SETTINGS.fillColor} solid`,
  },
  boxGrid: {
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: "2px",
    // padding: "6px 0",
    borderRadius: "4px",
  },
  buttonIcons: {
    height: "30px",
    width: "30px",
    borderRadius: "15px",
    backgroundColor: "white",
  },
  activeButton: {
    backgroundColor: "lightgreen",
  },
  button: {
    padding: "3px",
  },
  hasPolygon: {
    backgroundColor: "lightgreen",
  },
  activeButtonIcons: {
    backgroundColor: "lightgreen",
  },
  polygonBox: {
    borderRadius: "4px",
    marginRight: "2px",
    backgroundColor: "#eee",
  },
}));

interface HouseItemProps {
  house: HouseDto;
  selected: boolean;
  editPolygon: () => void;
  deletePolygon: () => void;
  drawPolygon: () => void;
}

export const HouseItem = ({
  house,
  selected,
  editPolygon,
  deletePolygon,
  drawPolygon,
}: HouseItemProps) => {
  const classes = useStyles();
  const {
    isSavePolygonButton,
    setIsSavePolygonButton,
    isEditButtonClicked,
    isDrawingButtonClicked,
  } = useContext(ToolboxContext);

  const { polygonId, setPolygonId } = useContext(HouseContext);
  const { appMode } = useContext(AppModeContext);

  console.debug("APP MODE:", appMode);
  function isHouseEmpty() {
    if (house) return Object.keys(house).length === 0;
  }

  const hasPolygon = (): boolean | undefined => {
    if (house) {
      if (house.polygons.length === 0) {
        return false;
      }
      return !isHouseEmpty();
    }
    return house;
  };

  function handleDeletePolygonButtonClicked() {
    setIsSavePolygonButton(true);
    deletePolygon();
  }

  function handleDrawButtonNotShow() {
    if (house) {
      if (house.polygons.length > 0) {
        return true;
      }
      if (!isSavePolygonButton) return true;
      return isHouseEmpty();
    }
    return !house;
  }

  function handleDrawPolygonButtonClicked() {
    // setIsSavePolygonButton(false);
    drawPolygon();
  }

  const getPolygonNumberFromId = (id: string): string => {
    return id.replace("polygon", "");
  };

  return (
    <>
      {selected ? (
        <Box display={"flex"} className={classes.menuItem}>
          <Box
            style={{
              borderRadius: "10px 0 0 10px",
              borderRight: 0,
            }}
            className={`${classes.menuItemPart} ${
              appMode === AppMode.edit && classes.activeLeft
            } ${hasPolygon() ? classes.hasPolygon : ""}`}
          >
            {"#" + house.number}
          </Box>
          {appMode === AppMode.edit && (
            <Box
              style={{ borderRadius: "0 10px 10px 0" }}
              className={`${classes.menuItemPart} ${classes.activeRight}
              }`}
            >
              <div className={classes.boxGrid}>
                <>
                  {house.polygons.map((polygon) => (
                    <Box className={classes.polygonBox}>
                      <IconButton
                        size={"medium"}
                        onClick={() => setPolygonId(polygon.id)}
                        className={classes.button}
                      >
                        <img
                          src={polygonImg}
                          className={`${classes.buttonIcons} ${
                            polygon.id === polygonId
                              ? classes.activeButtonIcons
                              : ""
                          }`}
                        />
                      </IconButton>
                      {polygon.id === polygonId && (
                        <>
                          <Tooltip
                            title={`Edit polygon #${getPolygonNumberFromId(
                              polygon.id
                            )}`}
                            placement="right"
                          >
                            <IconButton
                              size={"medium"}
                              onClick={() => editPolygon()}
                              className={`${classes.button} ${
                                isEditButtonClicked && polygon.id === polygonId
                                  ? classes.activeButton
                                  : ""
                              }`}
                            >
                              <img
                                src={editPolygonImg}
                                className={classes.buttonIcons}
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={`Delete polygon #${getPolygonNumberFromId(
                              polygon.id
                            )}`}
                            placement="right"
                          >
                            <IconButton
                              size={"medium"}
                              color={"secondary"}
                              onClick={handleDeletePolygonButtonClicked}
                              className={classes.button}
                            >
                              <img
                                src={deletePolygonImg}
                                className={classes.buttonIcons}
                              />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  ))}
                  <Box className={classes.polygonBox}>
                    <Tooltip
                      title={`Draw polygon #${house && house.number}`}
                      placement="right"
                    >
                      <IconButton
                        size={"medium"}
                        onClick={() => handleDrawPolygonButtonClicked()}
                        className={`${classes.button} ${
                          isDrawingButtonClicked ? classes.activeButton : ""
                        }`}
                        //===
                        //className={classes.buttons}
                        //style={{ gridColumn: "1", gridRow: "2" }}
                        //startIcon={<Create />}
                        //>>>
                      >
                        <img
                          src={addPolygonImg}
                          className={classes.buttonIcons}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              </div>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          className={`${classes.menuItem} ${classes.menuItemPart} ${
            hasPolygon() ? classes.hasPolygon : ""
          }`}
          style={{ borderRadius: "10px" }}
        >
          {"#" + house.number}
        </Box>
      )}
    </>
  );
};
