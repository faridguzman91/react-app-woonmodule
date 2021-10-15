import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import { AdditionalProperty } from "../../dto/AdditionalProperty";

interface DeleteColumnDialogProps {
  columnName: string;
  deleteColumn: () => void;
  open: boolean;
  setOpen: (arg: boolean) => void;
  setEditedProperty: (property: AdditionalProperty | null) => void;
}

export const DeleteColumnDialog = ({
  columnName,
  deleteColumn,
  open,
  setOpen,
  setEditedProperty,
}: DeleteColumnDialogProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    deleteColumn();
    setOpen(false);
    setEditedProperty(null);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to delete column "' + columnName + '"?'}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
