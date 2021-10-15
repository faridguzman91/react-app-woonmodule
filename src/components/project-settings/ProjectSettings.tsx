import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { saveProject } from "../../persistence/persistence";
import { useProject } from "../../hooks/projectHooks";
import "./ProjectSettings.css";
import { AriaViewUploaderComponent } from "../AriaViewUploaderComponent";
import { createStyles } from "@material-ui/core";
import { HouseDto, ProjectDto } from "../../dto";
import { HouseSettingsPopUp } from "./houses/HouseSettingsPopUp";
import { makeStyles } from "@material-ui/core/styles";
import { MapBuild } from "./map/MapBuild";
import { PolygonType } from "../../dto/PolygonType";
import ConfirmationPopUp from "../ConfirmationPopUp";
import { ToolBoxComponent } from "./ToolBoxComponent";
import { GuideLineType } from "../../dto/GuideLineType";
import { AppBarComponent } from "./AppBarComponent";
import { HouseContext } from "../../context/HouseContext";
import { ToolboxContext } from "../../context/ToolboxContext";
import { AppMode, AppModeContext } from "../../context/AppModeContext";
import { HouseTopPanel } from "./houses/HouseTopPanel";
import { ViewBoxScale } from "./map/Canvas";
import { ExportSvg } from "./map/ExportSvg";
import { renderToStaticMarkup } from "react-dom/server";
import { INITIAL_VIEW_BOX_X_VALUE } from "../../constants/constants";
import JSZip from "jszip";

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

export const ProjectSettings = () => {
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();

  const [{ project, isError, isLoading }, setProject] = useProject(id);
  const [stateProject, setStateProject] = useState<ProjectDto | null>(null);

  const [savedPolygons, setSavedPolygons] = useState<any[]>([]);
  const [savedGuideLines, setSavedGuideLines] = useState<any[]>([]);
  const [addHouseDialogOpen, setAddHouseDialogOpen] = useState(false);
  const [imageId, setImageId] = useState("");
  const [imageLoadUrl, setImageLoadUrl] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [isAlertPolygonShown, setIsAlertPolygonShown] = useState(false);
  const [isUndoHistoryPresent, setIsUndoHistoryPresent] = useState(false);
  const [isRedoHistoryPresent, setIsRedoHistoryPresent] = useState(false);

  const { house, setHouse, setNewPlot, polygonId } = useContext(HouseContext);
  const { appMode } = useContext(AppModeContext);
  const {
    isDrawingButtonClicked,
    setIsDrawingButtonClicked,
    isEditButtonClicked,
    setIsEditButtonClicked,
    setIsSavePolygonButtonClicked,
    isAddInnerLineButtonClicked,
    setIsAddInnerLineButtonClicked,
    toolBoxShown,
  } = useContext(ToolboxContext);

  const history = useHistory();

  useEffect(() => {
    setIsEditButtonClicked(false);
  }, [house]);

  useEffect(() => {
    if (project) {
      saveProject(project?.id, {
        ...project,
        ariaViewImageId: imageId,
        ariaPreViewImage: imageLoadUrl,
      });
      setProject(id);
    }
  }, [imageId]);

  useEffect(() => {
    if (project) {
      setStateProject(project);
    }
  }, [project]);

  useEffect(() => {
    if (appMode === AppMode.view) {
      setIsDrawingButtonClicked(false);
      setIsEditButtonClicked(false);
    }
  }, [appMode]);

  useEffect(() => {
    if (stateProject) {
      updateSavedPolygons(stateProject);
    }

    if (stateProject?.guideLines) {
      setSavedGuideLines(stateProject.guideLines);
    }
  }, [stateProject]);

  if (isError) {
    return <div>Error</div>;
  }
  if (isLoading) {
    return <div>Loading</div>;
  }

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

  function handleReturnToProjectsList() {
    history.push("/projects");
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
        action={handleReturnToProjectsList}
      />
    );
  }

  const { ariaPreViewImage } = stateProject;

  const handleAlertClose = () => {
    setIsAlertPolygonShown(false);
  };

  const checkPolygonPointsAmount = (polygons: PolygonType[]): boolean => {
    for (let polygon of polygons) {
      if (polygon.points.length < 3) {
        return true;
      }
    }
    return false;
  };

  async function savePolygons(polygons: PolygonType[]) {
    if (polygons.length === 0) {
      return;
    }
    const houseToSave = stateProject?.houses?.find(
      (statePolygonHouse) => statePolygonHouse.number === house!.number
    );

    if (!houseToSave) {
      return;
    }

    houseToSave.polygons = polygons.filter(
      (polygon) => polygon.houseNumber === houseToSave.number
    );
    if (
      houseToSave.polygons.length === 0 ||
      checkPolygonPointsAmount(houseToSave.polygons)
    ) {
      setIsAlertPolygonShown(true);
    } else {
      setIsDrawingButtonClicked(false);
      setSavedPolygons(polygons);
      setIsSavePolygonButtonClicked(false);
      await handleSaveHouse(houseToSave);
    }
  }

  const handleAddHouse = () => {
    setAddHouseDialogOpen(true);
  };

  const handleAddHouseDialogClose = () => {
    setAddHouseDialogOpen(false);
  };

  const calculateHouseNumber = (stateProject: ProjectDto): number => {
    let maxCounter = 0;
    if (!stateProject.houses) {
      return 1;
    }
    for (const house of stateProject.houses) {
      if (house.number > maxCounter) {
        maxCounter = house.number;
      }
    }
    maxCounter++;
    return maxCounter;
  };

  const handleSaveHouse = async (house: HouseDto) => {
    let houses: HouseDto[];

    if (stateProject.houses) {
      houses = [...stateProject.houses];
    } else {
      houses = [];
    }

    if (house.number === 0) {
      house.number = calculateHouseNumber(stateProject);
      houses.push(house);
    } else {
      houses = removeHouse(houses, house.number);
      houses.push(house);
      houses.sort((a, b) => a.number - b.number);
    }

    const updatedProject = { ...stateProject };
    updatedProject.houses = houses;
    setStateProject(updatedProject);

    await saveProject(updatedProject.id, updatedProject);
  };

  const removeHouse = (houses: HouseDto[], number: number): HouseDto[] => {
    const editHouses = [...houses];
    for (let i = 0; i < editHouses.length; i++) {
      if (editHouses[i].number === number) {
        editHouses.splice(i, 1);
      }
    }
    return editHouses;
  };

  const handleDrawPolygon = () => {
    if (!house) {
      return;
    }

    // if (house.polygons.length === 0) {
    setIsDrawingButtonClicked(!isDrawingButtonClicked);
    // }
  };

  const handleEditPolygon = () => {
    if (!house) {
      return;
    }

    if (isEditButtonClicked) {
      setIsEditButtonClicked(false);
    } else {
      setIsEditButtonClicked(true);
    }
  };

  const handleDrawInnerLine = () => {
    setIsAddInnerLineButtonClicked(!isAddInnerLineButtonClicked);
  };

  const handleDeletePolygon = async () => {
    if (!house) {
      return;
    }

    const findHouse = stateProject!.houses!.find(
      (statePolygonHouse) => statePolygonHouse.number === house.number
    );

    if (findHouse && findHouse.polygons.length > 0) {
      const deletedIndex = findHouse.polygons.findIndex(
        (polygon) => polygon.id === polygonId
      );
      delete findHouse.polygons[deletedIndex];
      findHouse.polygons = findHouse.polygons.flat();
      await handleSaveHouse(findHouse);
    }
    setNewPlot(null);
  };

  function handleSaveGuideLine(line: GuideLineType) {
    const lineToSave = { ...line };

    if (stateProject && stateProject.id) {
      if (stateProject.guideLines) {
        stateProject.guideLines = [...stateProject.guideLines, lineToSave];
      } else {
        stateProject.guideLines = [lineToSave];
      }
      saveProject(stateProject?.id, stateProject);
    }
  }

  function handleDeleteGuideLine(guideLine: GuideLineType) {
    if (stateProject && stateProject.guideLines) {
      const guideLines: GuideLineType[] = [...stateProject.guideLines];
      const lineIndex = guideLines.findIndex(
        (line) => line.id === guideLine.id
      );
      guideLines.splice(lineIndex, 1);
      stateProject.guideLines = guideLines;

      const updatedProject = { ...stateProject, guideLines };
      saveProject(updatedProject.id, updatedProject);
    }
  }

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
      setIsDrawingButtonClicked(false);
    }
  };

  const image = ariaPreViewImage ? (
    <MapBuild
      aerialView={ariaPreViewImage}
      savedPolygons={savedPolygons}
      savePolygons={savePolygons}
      selectedPlot={selectedPlotId}
      setSelectedPlot={selectPlot}
      isAlertPolygonShown={isAlertPolygonShown}
      showPolygonAlert={setIsAlertPolygonShown}
      handleAlertPolygonClose={handleAlertClose}
      savedGuideLines={savedGuideLines}
      saveGuideLine={handleSaveGuideLine}
      deleteGuideLine={handleDeleteGuideLine}
      houses={stateProject?.houses ? stateProject?.houses : null}
      setIsRedoHistoryPresent={setIsRedoHistoryPresent}
      setIsUndoHistoryPresent={setIsUndoHistoryPresent}
    />
  ) : (
    <div style={{ width: "25%", paddingLeft: "50%", paddingTop: "50px" }}>
      <AriaViewUploaderComponent
        setImageId={setImageId}
        setImageLoadUrl={setImageLoadUrl}
      />
    </div>
  );

  const handleExport = () => {
    if (ariaPreViewImage) {
      let imageName: string = project ? project.name : "image";
      const svgName: string = project ? project.name + ".svg" : "export.svg";
      fetch(ariaPreViewImage)
        .then((res) => res.blob()) // Gets the response and returns it as a blob
        .then((imageBlob) => {
          if (imageBlob.type === "image/jpeg") {
            imageName += ".jpg";
          } else if (imageBlob.type === "image/png") {
            imageName += ".png";
          }
          const img = new Image();
          img.src = ariaPreViewImage;
          let viewBoxScale: ViewBoxScale = {
            point1: { x: 0, y: 0 },
            point2: { x: INITIAL_VIEW_BOX_X_VALUE, y: 0 },
          };
          const y = (viewBoxScale.point2.x / img.width) * img.height;
          viewBoxScale = {
            point1: { x: 0, y: 0 },
            point2: { x: INITIAL_VIEW_BOX_X_VALUE, y: y },
          };
          const exportSvg = (
            <ExportSvg
              houses={stateProject.houses}
              aerialView={imageName}
              viewBoxScale={viewBoxScale}
            />
          );
          let html = renderToStaticMarkup(exportSvg);
          html = html.replaceAll(
            "></polygon>",
            ' class="polygonStyle"></polygon>'
          );
          const formatter = require("html-formatter");
          html = formatter.render(html);

          const zip = new JSZip();
          zip.file(svgName, html);
          zip.file(imageName, imageBlob);
          zip.generateAsync({ type: "base64" }).then(function (content) {
            const link = document.createElement("a");
            link.href = "data:application/zip;base64," + content;
            link.download = project ? project.name + ".zip" : "export.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        });
    }
  };

  return (
    <div className="ProjectSettings">
      <div className={classes.topSticky}>
        <AppBarComponent projectName={stateProject.name} />
        <div className={classes.topPanelDiv}>
          <HouseTopPanel
            houses={stateProject.houses ? stateProject.houses : []}
            selectedHouse={house}
            setOpenedHouse={(house: HouseDto) => {
              setHouse(house);
            }}
            focusPlot={setSelectedPlotId}
            editPolygon={handleEditPolygon}
            deletePolygon={handleDeletePolygon}
            drawPolygon={handleDrawPolygon}
          />
        </div>
      </div>
      <div className="ProjectSettings">
        {!isLoading ? (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div className={classes.mapAndToolBoxBlock}>
              <div
                className={`${classes.imageDiv} ${
                  toolBoxShown ? classes.imageDivToolBoxShown : ""
                }`}
              >
                {image}
              </div>
              <div className={classes.toolBoxSticky}>
                {ariaPreViewImage ? (
                  <ToolBoxComponent
                    drawInnerLine={handleDrawInnerLine}
                    isRedoHistory={isRedoHistoryPresent}
                    isUndoHistory={isUndoHistoryPresent}
                    handleAddHouse={handleAddHouse}
                    handleReturnToProjectsList={handleReturnToProjectsList}
                    handleExport={handleExport}
                  />
                ) : null}
              </div>
            </div>
            <HouseSettingsPopUp
              isPopUpOpen={addHouseDialogOpen}
              closePopUp={handleAddHouseDialogClose}
              saveHouse={handleSaveHouse}
              popUpTitle={"Add house"}
              saveButtonAlias={"Create"}
              house={null}
              houseTypes={project!.houseTypes.map(
                (houseType) => houseType.type
              )}
            />
          </div>
        ) : (
          <div>Loading</div>
        )}
      </div>
    </div>
  );
};
