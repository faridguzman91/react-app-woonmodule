import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { saveProject } from "../../persistence/persistence";
import { useProject } from "../../hooks/projectHooks";
import "./ProjectSettings.css";
import { createStyles } from "@material-ui/core";
import { HouseDto, ProjectDto } from "../../dto";
import { makeStyles } from "@material-ui/core/styles";
import { PolygonType } from "../../dto/PolygonType";
import ConfirmationPopUp from "../ConfirmationPopUp";
import { HouseContext } from "../../context/HouseContext";
import { AppMode, AppModeContext } from "../../context/AppModeContext";
import { HouseTopPanel } from "./houses/HouseTopPanel";
import { MapView } from "./map/MapView";

const useStyles = makeStyles(() =>
  createStyles({
    addButton: {
      marginLeft: "15px",
      marginRight: "1.5%",
      marginTop: "0px",
      alignSelf: "flex-start",
      display: "block",
    },
    details: {
      alignItems: "center",
    },
    housesBlock: {
      width: "30%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      marginLeft: "10px",
      marginTop: "15px",
    },
    mapAndToolBoxBlock: {
      width: "100%",
      display: "flex",
      flexDirection: "row-reverse",
      padding: "1em",
      paddingTop: "0",
    },
    imageDiv: {
      width: "100%",
      paddingLeft: "12px",
    },
    imageDivToolBoxShown: {
      paddingLeft: "80px",
    },
    topButtonBlock: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    topSticky: {
      position: "sticky",
      top: 0,
      zIndex: 2,
      backgroundColor: "white",
    },
    topPanelDiv: {
      padding: "10px",
    },
    toolBoxSticky: {
      position: "sticky",
      top: 134,
      height: 0,
      paddingLeft: "0px",
      zIndex: 2,
      width: 0,
    },
  })
);

export const ProjectViewOnly = () => {
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();

  const [{ project, isError, isLoading }, setProject] = useProject(id);
  const [stateProject, setStateProject] = useState<ProjectDto | null>(null);

  const [savedPolygons, setSavedPolygons] = useState<any[]>([]);
  //const [savedGuideLines, setSavedGuideLines] = useState<any[]>([]);
  const [imageId, setImageId] = useState("");
  const [imageLoadUrl, setImageLoadUrl] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  //const [isAlertPolygonShown, setIsAlertPolygonShown] = useState(false);

  const { house, setHouse, setNewPlot, polygonId } = useContext(HouseContext);
  const { appMode, setAppMode } = useContext(AppModeContext);

  const history = useHistory();

  useEffect(() => {
    setAppMode(AppMode.view);
  }, []);

  useEffect(() => {
    if (project) {
      setStateProject(project);
    }
  }, [project]);

  useEffect(() => {
    if (stateProject) {
      updateSavedPolygons(stateProject);
    }
  }, [stateProject]);

  const updateSavedPolygons = (project: ProjectDto) => {
    const houses = project?.houses;
    if (houses) {
      let polygons: PolygonType[] = [];
      for (const house of houses) {
        if (house.polygons) {
          polygons = [...polygons, ...house.polygons];
        }
      }
      setSavedPolygons(polygons);
    }
  };

  if (isError) {
    return <div>Error</div>;
  }
  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!stateProject) {
    return (
      <ConfirmationPopUp
        actionPopupButtonLabel={"Ok"}
        customClosePopUpButton={null}
        isOpen={true}
        closePopUp={() => {}}
        confirmationLabel={"Project does not exists"}
        confirmationText={
          <>
            Click <b>Ok</b> button to return to projects list
          </>
        }
        action={() => {}}
      />
    );
  }

  const { ariaPreViewImage } = stateProject;

  const selectPlot = (plotId: string | null) => {
    if (plotId) {
      setSelectedPlotId(plotId);
      if (plotId.startsWith("polygon")) {
        const polygon = savedPolygons.find((polygon) => polygon.id === plotId);
        const house = stateProject.houses?.find(
          (h) => polygon.houseNumber === h.number
        );
        if (house) {
          setHouse(house);
        }
      }
    } else {
      setSelectedPlotId(null);
      setHouse(null!);
    }
  };

  return (
    <div className="ProjectSettings">
      <div className={classes.topSticky}>
        {/* <AppBarComponent projectName={stateProject.name} /> */}
        <div className={classes.topPanelDiv}>
          <HouseTopPanel
            houses={stateProject.houses ? stateProject.houses : []}
            selectedHouse={house}
            setOpenedHouse={(house: HouseDto) => {
              setHouse(house);
            }}
            focusPlot={setSelectedPlotId}
            editPolygon={() => {}}
            deletePolygon={() => {}}
            drawPolygon={() => {}}
          />
        </div>
      </div>
      <div className="ProjectSettings">
        {!isLoading ? (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div className={classes.mapAndToolBoxBlock}>
              <div className={`${classes.imageDiv}`}>
                {ariaPreViewImage ? (
                  <MapView
                    aerialView={ariaPreViewImage}
                    savedPolygons={savedPolygons}
                    selectedPlot={selectedPlotId}
                    setSelectedPlot={selectPlot}
                    houses={stateProject?.houses ? stateProject?.houses : null}
                  />
                ) : (
                  <div
                    style={{
                      width: "25%",
                      paddingLeft: "50%",
                      paddingTop: "50px",
                    }}
                  >
                    No map available
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </div>
  );
};
