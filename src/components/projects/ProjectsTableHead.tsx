import { TableCell, TableHead, TableRow } from "@material-ui/core";
import React from "react";

interface Column {
  id: "name" | "houseNumber" | "ariaImage" | "creationDate" | "actions";
  label: string;
  minWidth?: number;
  align?: "right" | "center";
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: "name", label: "Project Name", minWidth: 300 },
  { id: "houseNumber", label: "Number of houses", minWidth: 50 },
  // {
  //   id: "ariaImage",
  //   label: "Area image",
  //   minWidth: 170,
  //   align: "center",
  //   format: (value: number) => value.toLocaleString(),
  // },
  {
    id: "creationDate",
    label: "Created",
    minWidth: 170,
    align: "center",
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 100,
    align: "center",
    format: (value: number) => value.toLocaleString(),
  },
];

export const ProjectsTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
            style={{ minWidth: column.minWidth }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
