import React from "react";
import { ProjectDto } from "../../dto";
import MaterialTable, { Column } from "material-table";
import { handleDeleteHouseType, handleSaveHouseType } from "./HousesApi";
import { columnStyle } from "./HousesEdit";
import { HouseType } from "../../dto/HouseType";

interface HouseTypeTableProps {
  project: ProjectDto | null;
  setProject: (project: ProjectDto) => void;
}

export const HouseTypeTable = ({
  project,
  setProject,
}: HouseTypeTableProps) => {
  const columns: Column<HouseType>[] = [
    {
      ...columnStyle,
      title: "Type",
      field: "type",
    },
    {
      ...columnStyle,
      title: "Type Name",
      field: "name",
    },
    {
      ...columnStyle,
      title: "GBO, m2",
      field: "houseSize",
      type: "numeric",
    },
    { ...columnStyle, title: "Roomcount", field: "roomCount", type: "numeric" },
  ];

  return (
    <MaterialTable
      options={{
        paging: false,
        showTitle: false,
        headerStyle: {
          whiteSpace: "nowrap",
        },
      }}
      data={project ? project.houseTypes : []}
      columns={columns}
      editable={{
        onRowAdd: (newData) =>
          new Promise<void>((resolve) => {
            handleSaveHouseType(newData, project, setProject).then(() =>
              resolve()
            );
          }),
        onRowUpdate: (newData) =>
          new Promise<void>((resolve) => {
            handleSaveHouseType(newData, project, setProject).then(() =>
              resolve()
            );
          }),
        onRowDelete: (oldData) =>
          new Promise<void>((resolve) => {
            handleDeleteHouseType(oldData, project, setProject).then(() =>
              resolve()
            );
          }),
      }}
    />
  );
};
