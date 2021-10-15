import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import { ProjectDto } from "../../dto";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import { AdditionalProperty } from "../../dto/AdditionalProperty";
import { checkIfColumnNameIsNotReserved } from "./HousesApi";

interface EditColumnDialogProps {
  project: ProjectDto | null;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
  handleEditColumn: (property: AdditionalProperty, newName: string) => void;
  editedProperty: AdditionalProperty | null;
  setEditedProperty: (property: AdditionalProperty | null) => void;
}

export const EditColumnDialog = ({
  project,
  isOpen,
  setIsOpen,
  handleEditColumn,
  editedProperty,
  setEditedProperty,
}: EditColumnDialogProps) => {
  const [newColumnName, setNewColumnName] = useState<string>(
    editedProperty ? editedProperty.name : ""
  );
  const [isColumnNameInvalid, setIsColumnNameInvalid] = useState<boolean>(
    false
  );
  const [columnNameErrorText, setColumnNameErrorText] = useState<string>("");

  useEffect(() => {
    if (editedProperty) {
      setNewColumnName(editedProperty.name);
    }
  }, [editedProperty]);

  const handleCloseDialog = () => {
    setIsOpen(false);
    setNewColumnName(editedProperty ? editedProperty.name : "");
    setEditedProperty(null);
  };

  const handleSave = () => {
    if (!newColumnName || /^\s*$/.test(newColumnName)) {
      setIsColumnNameInvalid(true);
      setColumnNameErrorText("New column name should not be blank");
      return;
    }
    if (!checkIfColumnNameIsNotReserved(project, newColumnName)) {
      setIsColumnNameInvalid(true);
      setColumnNameErrorText("This name is already reserved");
      return;
    }
    if (editedProperty) {
      handleEditColumn(editedProperty, newColumnName);
    }
    handleCloseDialog();
  };

  return (
    <Dialog open={isOpen} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Edit column name</DialogTitle>
      <DialogContent>
        <TextField
          id="columnName"
          autoFocus
          margin="dense"
          label="Column name"
          type="name"
          fullWidth
          error={isColumnNameInvalid}
          helperText={isColumnNameInvalid && columnNameErrorText}
          defaultValue={newColumnName}
          onChange={(event) => setNewColumnName(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
