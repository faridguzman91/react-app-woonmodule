import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ListItemSecondaryAction,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { useProject } from "../../hooks/projectHooks";
import GetAppIcon from "@material-ui/icons/GetApp";
import PublishIcon from "@material-ui/icons/Publish";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import MaterialTable, { Column } from "material-table";
import { HouseDto, ProjectDto } from "../../dto";
import {
  calculateHouseNumber,
  handleDeleteHouse,
  handleSaveHouse,
} from "./HousesApi";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import AddIcon from "@material-ui/icons/Add";
import { AddColumnPopUp } from "./AddColumnPopUp";
import { AdditionalProperty } from "../../dto/AdditionalProperty";
import { saveProject } from "../../persistence/persistence";
import { AdditionalPropertyType } from "../../dto/AdditionalPropertyType";
import { HouseStatus } from "../../dto/HouseStatus";
import { Point } from "../../dto/PolygonType";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import { DeleteColumnDialog } from "./DeleteColumnDialog";
import { EditColumnDialog } from "./EditColumnDialog";
import { HouseTypeTable } from "./HouseTypeTable";

const useStyles = makeStyles(() =>
  createStyles({
    wrap: {
      paddingLeft: "20px",
      paddingRight: "20px",
    },
    titles: {
      marginTop: "20px",
      marginLeft: "10%",
      marginBottom: "20px",
    },
    subtitle: {
      color: "gray",
      fontWeight: "bold",
    },
    exportButton: {
      backgroundColor: "white",
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderLeft: "1px solid black",
    },
    importButton: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    tableToggleActive: {
      backgroundColor: "#3f51b5",
      color: "white",
    },
    tableToggleInactive: {
      backgroundColor: "white",
    },
    button: {
      borderTop: "1px solid black",
      borderBottom: "1px solid black",
      borderRight: "1px solid black",
    },
    backNextButton: {
      marginTop: "20px",
      marginBottom: "20px",
      height: "50px",
      width: "120px",
    },
    backIcon: {
      marginLeft: "-20px",
    },
    nextIcon: {
      marginRight: "-20px",
    },
    backNextText: {
      marginTop: "5px",
    },
    tableBox: {
      marginTop: "30px",
    },
    availableIcon: {
      alignCenter: "center",
      fontSize: "small",
      color: "green",
    },
    offerIcon: {
      fontSize: "small",
      color: "yellow",
    },
    soldIcon: {
      fontSize: "small",
      color: "red",
    },
    headerMenuIcon: {
      marginTop: "-5px",
    },
  })
);

export const columnStyle: Column<any> = {
  align: "left",
  width: "auto",
};

export const HousesEdit = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [{ project }] = useProject(id);
  const [stateProject, setStateProject] = useState<ProjectDto | null>(null);
  const [isAddColumnPopUpOpen, setIsAddColumnPopUpOpen] = useState<boolean>(
    false
  );
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
  const [clickedId, setClickedId] = useState<string>("");
  const [
    editedProperty,
    setEditedProperty,
  ] = useState<AdditionalProperty | null>(null);
  const [
    deletedProperty,
    setDeletedProperty,
  ] = useState<AdditionalProperty | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [allDataOpen, setAllDataOpen] = useState<boolean>(true);

  const statusSortingMap = new Map<HouseStatus, number>([
    ["Available", 3],
    ["Offer", 2],
    ["Sold", 1],
    ["", 0],
  ]);

  useEffect(() => {
    if (project) {
      if (project.houses) {
        for (let house of project.houses) {
          if (!house.polygons) {
            house.polygons = [];
            if (house.polygon) {
              house.polygons.push(house.polygon);
            }
          }
        }
      }
      saveProject(project.id, project);
      setStateProject(project);
    }
  }, [project]);

  const handleAddColumn = async (additionalProperty: AdditionalProperty) => {
    let houseAdditionalProperties: AdditionalProperty[];
    if (!stateProject) {
      return;
    }

    if (stateProject.houseAdditionalProperties) {
      houseAdditionalProperties = [
        ...stateProject.houseAdditionalProperties,
        additionalProperty,
      ];
    } else {
      houseAdditionalProperties = [additionalProperty];
    }

    const updatedProject = { ...stateProject };
    updatedProject.houseAdditionalProperties = houseAdditionalProperties;
    setStateProject(updatedProject);

    await saveProject(updatedProject.id, updatedProject);
  };

  const handleDeleteColumn = async (deletedProperty: AdditionalProperty) => {
    let houseAdditionalProperties: AdditionalProperty[] = [];
    if (!stateProject) {
      return;
    }

    if (stateProject.houseAdditionalProperties) {
      houseAdditionalProperties = stateProject.houseAdditionalProperties.filter(
        (property) => property.name !== deletedProperty.name
      );
    }

    const updatedProject = { ...stateProject };
    updatedProject.houseAdditionalProperties = houseAdditionalProperties;
    if (stateProject.houses) {
      let updatedHouses = [...stateProject.houses];
      for (let house of updatedHouses) {
        const field = deletedProperty.field;
        if (house.hasOwnProperty(field)) {
          delete house[field as keyof typeof house];
        }
      }
      updatedProject.houses = updatedHouses;
    }
    setStateProject(updatedProject);

    await saveProject(updatedProject.id, updatedProject);
  };

  const handleEditColumn = async (
    additionalProperty: AdditionalProperty,
    newName: string
  ) => {
    if (!stateProject) {
      return;
    }
    const oldColumnName = additionalProperty.name;
    const deletedField = additionalProperty.field;
    additionalProperty.name = newName;
    additionalProperty.field = newName.trim().toLowerCase();

    let houseAdditionalProperties: AdditionalProperty[] = [];

    if (stateProject.houseAdditionalProperties) {
      houseAdditionalProperties = [
        ...stateProject.houseAdditionalProperties,
        additionalProperty,
      ];
      houseAdditionalProperties = stateProject.houseAdditionalProperties.filter(
        (property) => property.name !== oldColumnName
      );
    }
    const updatedProject = { ...stateProject };
    updatedProject.houseAdditionalProperties = houseAdditionalProperties;
    setStateProject(updatedProject);

    if (stateProject.houses) {
      let updatedHouses = [...stateProject.houses];
      for (let house of updatedHouses) {
        const newField = additionalProperty.field;
        if (house.hasOwnProperty(deletedField)) {
          (house as any)[newField as keyof typeof house] =
            house[deletedField as keyof typeof house];
          delete house[deletedField as keyof typeof house];
        }
      }
      updatedProject.houses = updatedHouses;
    }
    setStateProject(updatedProject);

    await saveProject(updatedProject.id, updatedProject);
  };

  const handleDeleteColumnClicked = (
    additionalProperty: AdditionalProperty
  ) => {
    setDeletedProperty(additionalProperty);
    handleHeaderMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleEditColumnNameClicked = (
    additionalProperty: AdditionalProperty
  ) => {
    setEditedProperty(additionalProperty);
    handleHeaderMenuClose();
    setIsEditDialogOpen(true);
  };

  const getColumnTitleForAdditionalProperty = (
    property: AdditionalProperty
  ) => {
    if (property.type === "area") {
      return property.name + ", m2";
    }
    return property.name;
  };

  const getColumnTypeFromPropertyType = (
    type: AdditionalPropertyType
  ):
    | "string"
    | "boolean"
    | "numeric"
    | "date"
    | "datetime"
    | "time"
    | "currency" => {
    switch (type) {
      case "string":
        return "string";
      case "area":
        return "numeric";
      case "money":
        return "currency";
      case "checkbox":
        return "boolean";
      default:
        return "string";
    }
  };

  const additionalColumnParametersFromPropertyType = (
    property: AdditionalProperty
  ) => {
    if (property.type === "money") {
      return {
        currencySetting: {
          locale: "en-EN",
          currencyCode: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      };
    } else if (property.type === "select" && property.choices) {
      return {
        lookup: {
          ...property.choices,
        },
      };
    }
    return [];
  };

  const handleHeaderMenuClose = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleHeaderClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setMousePosition({ x: event.clientX - 2, y: event.clientY - 4 });
    setClickedId(event.currentTarget.id);
  };

  const additionalProperties = (): Column<HouseDto>[] => {
    let additionalProperties: Column<HouseDto>[] = [];
    if (stateProject && stateProject.houseAdditionalProperties) {
      for (let additionalProperty of stateProject.houseAdditionalProperties) {
        additionalProperties.push({
          ...columnStyle,
          title: (
            <>
              <Typography
                id={additionalProperty.name}
                onContextMenu={(event) => handleHeaderClick(event)}
              >
                {getColumnTitleForAdditionalProperty(additionalProperty)}
              </Typography>
              <Menu
                keepMounted
                open={
                  clickedId === additionalProperty.name && mousePosition.y !== 0
                }
                onClose={handleHeaderMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  mousePosition.y !== 0 && mousePosition.x !== 0
                    ? { top: mousePosition.y, left: mousePosition.x }
                    : undefined
                }
                TransitionProps={{
                  timeout: 100,
                }}
              >
                <MenuItem
                  onClick={() =>
                    handleEditColumnNameClicked(additionalProperty)
                  }
                >
                  Edit name
                  <ListItemSecondaryAction>
                    <EditIcon
                      className={classes.headerMenuIcon}
                      fontSize={"inherit"}
                    />
                  </ListItemSecondaryAction>
                </MenuItem>
                <MenuItem
                  onClick={() => handleDeleteColumnClicked(additionalProperty)}
                >
                  Delete
                  <ListItemSecondaryAction>
                    <DeleteOutlineIcon
                      className={classes.headerMenuIcon}
                      fontSize={"inherit"}
                    />
                  </ListItemSecondaryAction>
                </MenuItem>
              </Menu>
            </>
          ),
          editPlaceholder: getColumnTitleForAdditionalProperty(
            additionalProperty
          ),
          type: getColumnTypeFromPropertyType(additionalProperty.type),
          field: additionalProperty.field,
          customSort: (a, b) => {
            if (a) {
              if (b) {
                const aField = a[additionalProperty.field as keyof typeof a];
                const bField = b[additionalProperty.field as keyof typeof b];
                if (aField) {
                  if (bField) {
                    return aField >= bField ? 1 : -1;
                  } else return 1;
                } else if (bField) {
                  return -1;
                } else return 0;
              }
              return 1;
            } else if (b) {
              return -1;
            } else return 0;
          },
          ...additionalColumnParametersFromPropertyType(additionalProperty),
        });
      }
    }
    return additionalProperties;
  };

  const getStatusSortingValue = (status: HouseStatus): number => {
    let mapValue: number | undefined = statusSortingMap.get(status);
    if (mapValue) {
      return mapValue;
    }
    return 0;
  };

  const statusSortingAlgorithm = {
    ascending: (a: HouseDto, b: HouseDto) =>
      getStatusSortingValue(a.status) - getStatusSortingValue(b.status),
    descending: (a: HouseDto, b: HouseDto) =>
      getStatusSortingValue(b.status) - getStatusSortingValue(a.status),
  };

  const columns: Column<HouseDto>[] = [
    {
      ...columnStyle,
      title: "Id",
      field: "number",
      type: "numeric",
      initialEditValue: stateProject ? calculateHouseNumber(stateProject) : 1,
      editable: "never",
    },
    {
      ...columnStyle,
      title: "Type",
      field: "type",
      lookup: stateProject?.houseTypes
        .map((element) => element.type)
        .reduce((acc: any, attribute: string) => {
          acc[attribute] = attribute;
          return acc;
        }, {}),
    },
    {
      ...columnStyle,
      title: "Type Name",
      field: "type",
      render: (rowData) => {
        const type = stateProject?.houseTypes.find(
          (type) => type.type === rowData.type
        );
        return type && type.name ? type.name : "";
      },
      editable: "never",
    },
    {
      ...columnStyle,
      title: "Status",
      field: "status",
      lookup: {
        Available: (
          <Box display={"inline-block"} whiteSpace={"nowrap"}>
            <FiberManualRecordIcon className={classes.availableIcon} />
            Available
          </Box>
        ),
        Offer: (
          <Box display={"inline-block"} whiteSpace={"nowrap"}>
            <FiberManualRecordIcon className={classes.offerIcon} /> Offer
          </Box>
        ),
        Sold: (
          <Box display={"inline-block"} whiteSpace={"nowrap"}>
            <FiberManualRecordIcon className={classes.soldIcon} /> Sold
          </Box>
        ),
      },
      customSort: statusSortingAlgorithm.ascending,
    },
    {
      ...columnStyle,
      title: "GBO, m2",
      field: "houseSize",
      render: (rowData) => {
        const type = stateProject?.houseTypes.find(
          (type) => type.type === rowData.type
        );
        return type && type.houseSize ? type.houseSize : "";
      },
      editable: "never",
    },
    {
      ...columnStyle,
      title: "Roomcount",
      field: "roomCount",
      render: (rowData) => {
        const type = stateProject?.houseTypes.find(
          (type) => type.type === rowData.type
        );
        if (type && type.roomCount === 0) {
          return 0;
        }
        return type && type.roomCount ? type.roomCount : "";
      },
      editable: "never",
    },
    { ...columnStyle, title: "Orientatie", field: "orientatie" },
    { ...columnStyle, title: "Terrace, m2", field: "terrace", type: "numeric" },
    {
      ...columnStyle,
      title: "Price",
      field: "price",
      type: "currency",
      currencySetting: {
        locale: "en-EN",
        currencyCode: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      },
    },
    ...additionalProperties(),
  ];

  const handleReturnToProjectsList = () => {
    history.push("/projects");
  };

  const handleGoToMapTool = () => {
    if (stateProject) {
      history.push(`/projects/${stateProject.id}`);
    }
  };

  return (
    <Box className={classes.wrap}>
      <DeleteColumnDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        columnName={deletedProperty ? deletedProperty.name : ""}
        deleteColumn={() => handleDeleteColumn(deletedProperty!)}
        setEditedProperty={setDeletedProperty}
      />
      <EditColumnDialog
        project={stateProject}
        editedProperty={editedProperty}
        handleEditColumn={handleEditColumn}
        setIsOpen={setIsEditDialogOpen}
        isOpen={isEditDialogOpen}
        setEditedProperty={setEditedProperty}
      />
      <AddColumnPopUp
        project={stateProject}
        isAddColumnPopUpOpen={isAddColumnPopUpOpen}
        setIsAddColumnPopUpOpen={setIsAddColumnPopUpOpen}
        handleAddColumn={handleAddColumn}
      />

      <Box className={classes.titles}>
        <Typography variant="h3" component="h3">
          List of Houses
        </Typography>
        <Typography variant="h5" component="h5" className={classes.subtitle}>
          To create the table, please choose column names
        </Typography>
      </Box>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Box>
          <Button
            className={`${classes.button} ${classes.exportButton} ${
              allDataOpen
                ? classes.tableToggleInactive
                : classes.tableToggleActive
            } `}
            variant="contained"
            onClick={() => setAllDataOpen(false)}
            disableElevation
          >
            House Type
          </Button>
          <Button
            className={`${classes.button} ${classes.importButton} ${
              allDataOpen
                ? classes.tableToggleActive
                : classes.tableToggleInactive
            }`}
            variant="contained"
            onClick={() => setAllDataOpen(true)}
            disableElevation
          >
            All Data
          </Button>
        </Box>
        <Box>
          <Button
            className={`${classes.button} ${classes.exportButton} `}
            variant="contained"
            disableElevation
          >
            <GetAppIcon />
            Export
          </Button>
          <Button
            className={`${classes.button} ${classes.importButton}`}
            variant="contained"
            color="primary"
            disableElevation
          >
            <PublishIcon />
            Import
          </Button>
        </Box>
      </Box>

      <Box className={classes.tableBox}>
        {allDataOpen ? (
          <MaterialTable
            options={{
              paging: false,
              showTitle: false,
              headerStyle: {
                whiteSpace: "nowrap",
              },
            }}
            actions={[
              {
                icon: () => (
                  <Button
                    disableRipple={true}
                    style={{ marginTop: "5px", backgroundColor: "transparent" }}
                    color={"primary"}
                  >
                    <AddIcon style={{ marginTop: "-5px" }} /> Add column
                  </Button>
                ),
                onClick: () => {
                  setIsAddColumnPopUpOpen(true);
                },
                position: "toolbar",
                tooltip: "Add column",
              },
            ]}
            data={stateProject?.houses ? stateProject.houses : []}
            columns={columns}
            editable={{
              onRowAdd: (newData) =>
                new Promise<void>((resolve) => {
                  handleSaveHouse(
                    newData,
                    stateProject,
                    setStateProject
                  ).then(() => resolve());
                }),
              onRowUpdate: (newData) =>
                new Promise<void>((resolve) => {
                  handleSaveHouse(
                    newData,
                    stateProject,
                    setStateProject
                  ).then(() => resolve());
                }),
              onRowDelete: (oldData) =>
                new Promise<void>((resolve) => {
                  handleDeleteHouse(
                    oldData,
                    stateProject,
                    setStateProject
                  ).then(() => resolve());
                }),
            }}
          />
        ) : (
          <HouseTypeTable project={stateProject} setProject={setStateProject} />
        )}
      </Box>

      <Box display={"flex"} justifyContent={"space-between"}>
        <Button
          className={classes.backNextButton}
          variant="contained"
          color="primary"
          onClick={handleReturnToProjectsList}
          disableElevation
        >
          <ArrowLeftIcon fontSize={"large"} className={classes.backIcon} />
          <Box className={classes.backNextText}>Back</Box>
        </Button>
        <Button
          className={classes.backNextButton}
          variant="contained"
          color="primary"
          onClick={handleGoToMapTool}
        >
          <Box className={classes.backNextText}>Next</Box>
          <ArrowRightIcon fontSize={"large"} className={classes.nextIcon} />
        </Button>
      </Box>
    </Box>
  );
};
