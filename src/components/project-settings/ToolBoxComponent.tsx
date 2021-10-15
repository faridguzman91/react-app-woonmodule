import { Button, createStyles, Theme, Tooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import React, { useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import addGuideLineImg from "../../assets/guidelineAdd.png";
//import TextField from "@material-ui/core/TextField";
import { AppMode, AppModeContext } from "../../context/AppModeContext";
import TextField from "@material-ui/core/TextField";
import { HouseContext } from "../../context/HouseContext";
import { Redo, Undo, ZoomOutMap } from "@material-ui/icons";
import { ToolboxContext } from "../../context/ToolboxContext";
import { ToggleButton } from "@material-ui/lab";
import ImageIcon from "@material-ui/icons/Image";
import GridOnIcon from "@material-ui/icons/GridOn";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import { EditorSettings, HouseDto } from "../../dto";
import { IFrameClipboardButton } from "./IFrameClipboardButton";

type Settings = "strokeWidth" | "cornersRadius" | "strokeColor" | "fillColor";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBoxGrid: {
      width: "75px",
      display: "flex",
      flexDirection: "column",
      marginRight: "10px",
    },
    boxGrid: {
      backgroundColor: "#eee",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2px",
      padding: "6px 0",
      borderRadius: "4px",
    },
    buttonIcons: {
      height: "50px",
      width: "50px",
      borderRadius: "25px",
      backgroundColor: "white",
    },
    buttonPaddedIcons: {
      height: "40px",
      width: "40px",
      padding: "5px",
      borderRadius: "25px",
      backgroundColor: "white",
    },
    disabledButton: {
      backgroundColor: "transparent",
      opacity: "0.6",
    },
    button: {
      margin: "2px 0",
      padding: "9px",
    },
    activeButton: {
      border: "5px solid lightgreen",
      padding: "4px",
    },
    textField: {
      //marginRight: theme.spacing(3),
      width: "75px",
    },
    addButton: {
      width: "100%",
      marginBottom: "10px",
    },
    toggle: {
      border: "0",
      borderRadius: "35px",
      marginBottom: "2px",
    },
    collapseButton: {
      width: "20px",
      height: "40px",
      borderRadius: 0,
      backgroundColor: "#eee",
    },
    arrowLeftBox: {
      position: "absolute",
      left: "72px",
      top: "47px",
      borderRadius: 0,
    },
    arrowRightBox: {
      marginTop: "10px",
      height: "40px",
      borderRadius: 0,
    },
  })
);

export const ToolBoxComponent = (props: {
  isUndoHistory: boolean;
  isRedoHistory: boolean;
  drawInnerLine: () => void;
  handleAddHouse: () => void;
  handleReturnToProjectsList: () => void;
  handleExport: () => void;
}) => {
  const classes = useStyles();
  const {
    isRedoHistory,
    isUndoHistory,
    drawInnerLine,
    handleAddHouse,
    handleReturnToProjectsList,
    handleExport,
  } = props;

  const { appMode } = useContext(AppModeContext);
  const {
    isRedoButtonClicked,
    isUndoButtonClicked,
    setIsDrawGuideLineButtonClicked,
    isDrawGuideLineButtonClicked,
    setIsRedoButtonClicked,
    setIsUndoButtonClicked,
    isAddInnerLineButtonClicked,
    isSavePolygonButton,
    setIsSavePolygonButton,
    imageShown,
    setImageShown,
    guideLinesShown,
    setGuideLinesShown,
    setIsResetTransform,
    toolBoxShown,
    setToolBoxShown,
  } = useContext(ToolboxContext);
  const { house, setHouse } = useContext(HouseContext);

  useEffect(() => {
    if (house && house.polygons.length > 0) {
      setIsSavePolygonButton(false);
    } else {
      setIsSavePolygonButton(true);
    }
  }, [house]);

  if (appMode === AppMode.view) {
    return null;
  }

  function handleButtonDisabled() {
    if (house) {
      if (house.polygons.length === 0) {
        return true;
      }
      return isHouseEmpty();
    }
    return !house;
  }

  function handleUndoButtonDisabled() {
    return !isUndoHistory;
  }

  function handleRedoButtonDisabled() {
    return !isRedoHistory;
  }

  function isHouseEmpty() {
    if (house) return Object.keys(house).length === 0;
  }

  function changeEditorSetting(setting: Settings, value: string) {
    if (house?.polygons.length === 0) {
      return;
    }

    const editedEditorSettings = { ...house?.polygons[0].editorSettings };
    const editedHouse = { ...house };

    switch (setting) {
      case "strokeWidth":
        editedEditorSettings.strokeWidth = Number(value);
        if (editedHouse.polygons) {
          editedHouse.polygons[0].editorSettings = editedEditorSettings as EditorSettings;
          setHouse(editedHouse as HouseDto);
        }
        break;

      case "strokeColor":
        editedEditorSettings.strokeColor = value;
        if (editedHouse.polygons) {
          editedHouse.polygons[0].editorSettings = editedEditorSettings as EditorSettings;
          setHouse(editedHouse as HouseDto);
        }
        break;

      case "fillColor":
        editedEditorSettings.fillColor = value;
        if (editedHouse.polygons) {
          editedHouse.polygons[0].editorSettings = editedEditorSettings as EditorSettings;
          setHouse(editedHouse as HouseDto);
        }
        break;
    }
  }

  return toolBoxShown ? (
    <div className={classes.toolBoxGrid}>
      <Button
        variant="contained"
        color="primary"
        className={classes.addButton}
        onClick={handleReturnToProjectsList}
      >
        Home
      </Button>

      <div className={`${classes.boxGrid} ${classes.arrowLeftBox}`}>
        <Tooltip title={`Collapse Tool Bar`} placement="right" arrow>
          <IconButton
            className={classes.collapseButton}
            onClick={() => setToolBoxShown(false)}
          >
            <ArrowLeftIcon fontSize={"large"} />
          </IconButton>
        </Tooltip>
      </div>

      <div className={classes.boxGrid}>
        <Tooltip title={`Add guide line`} placement="right" arrow>
          <IconButton
            size={"medium"}
            style={{
              gridRow: "2",
              gridColumn: "1",
            }}
            onClick={() =>
              setIsDrawGuideLineButtonClicked(!isDrawGuideLineButtonClicked)
            }
            className={`${classes.button} ${
              isDrawGuideLineButtonClicked ? classes.activeButton : ""
            }`}
          >
            <img src={addGuideLineImg} className={classes.buttonIcons} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Toggle guide lines`} placement="right" arrow>
          <IconButton
            size={"medium"}
            color={guideLinesShown ? "primary" : undefined}
            onClick={() => setGuideLinesShown(!guideLinesShown)}
            className={classes.button}
          >
            <GridOnIcon
              fontSize={"small"}
              className={classes.buttonPaddedIcons}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Toggle image`} placement="right" arrow>
          <IconButton
            size={"small"}
            color={imageShown ? "primary" : undefined}
            onClick={() => setImageShown(!imageShown)}
            className={classes.button}
          >
            <ImageIcon
              fontSize={"small"}
              className={classes.buttonPaddedIcons}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Resize image`} placement="right" arrow>
          <IconButton
            size={"small"}
            onClick={() => setIsResetTransform(true)}
            color={"primary"}
          >
            <ZoomOutMap className={classes.buttonPaddedIcons} />
          </IconButton>
        </Tooltip>
      </div>
      <div className={classes.boxGrid}>
        <TextField
          className={classes.textField}
          id="fill-color-setting"
          label="Fill color"
          value={
            house?.polygons && house.polygons.length > 0
              ? house.polygons[0].editorSettings.fillColor
              : "0"
          }
          onChange={(e) => changeEditorSetting("fillColor", e.target.value)}
        />
        <TextField
          className={classes.textField}
          id="stroke-color-setting"
          label="Stroke color"
          value={
            house?.polygons && house.polygons.length > 0
              ? house.polygons[0].editorSettings.strokeColor
              : "0"
          }
          onChange={(e) => changeEditorSetting("strokeColor", e.target.value)}
        />
        <TextField
          className={classes.textField}
          id="stroke-width-setting"
          label="Stroke width"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          value={
            house?.polygons && house.polygons.length > 0
              ? house.polygons[0].editorSettings.strokeWidth
              : 0
          }
          onChange={(e) => changeEditorSetting("strokeWidth", e.target.value)}
        />
      </div>

      <div className={classes.boxGrid} style={{ marginTop: "20px" }}>
        <div>
          <IconButton
            disabled={handleUndoButtonDisabled()}
            size={"small"}
            onClick={() => setIsUndoButtonClicked(!isUndoButtonClicked)}
            color={"primary"}
            //className={classes.button}
          >
            <Undo />
          </IconButton>
          <IconButton
            disabled={handleRedoButtonDisabled()}
            size={"small"}
            onClick={() => setIsRedoButtonClicked(!isRedoButtonClicked)}
            color={"primary"}
            //className={classes.button}
          >
            <Redo />
          </IconButton>
        </div>
      </div>

      {/*{appMode === AppMode.edit ? (*/}
      {/*  <Button*/}
      {/*    variant="contained"*/}
      {/*    color="primary"*/}
      {/*    className={classes.addButton}*/}
      {/*    onClick={handleAddHouse}*/}
      {/*  >*/}
      {/*    Add house*/}
      {/*  </Button>*/}
      {/*) : null}*/}
      <Button
        variant="contained"
        color="primary"
        className={classes.addButton}
        onClick={handleExport}
      >
        Export
      </Button>
      <IFrameClipboardButton className={classes.addButton} />
    </div>
  ) : (
    <div className={`${classes.boxGrid} ${classes.arrowRightBox}`}>
      <Tooltip title={`Collapse Tool Bar`} placement="right" arrow>
        <IconButton
          className={classes.collapseButton}
          onClick={() => setToolBoxShown(true)}
        >
          <ArrowRightIcon fontSize={"large"} />
        </IconButton>
      </Tooltip>
    </div>
  );
};
