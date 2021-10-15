import React, { ReactElement, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

export default function ConfirmationPopUp(props: {
  isOpen: boolean;
  closePopUp: () => void;
  confirmationLabel: ReactElement | string;
  confirmationText: ReactElement | string;
  action: () => void;
  closePopupButtonLabel?: string;
  actionPopupButtonLabel?: string;
  customClosePopUpButton?: ReactElement | null;
  customActionPopUpButton?: ReactElement | null;
}) {
  const {
    isOpen,
    closePopUp,
    confirmationLabel,
    confirmationText,
    action,
    closePopupButtonLabel,
    actionPopupButtonLabel,
    customActionPopUpButton,
    customClosePopUpButton,
  } = props;

  const defaultLabels = {
    defaultClosePopupButtonLabel: "Cancel",
    defaultActionPopupButtonLabel: "Delete",
  };

  const defaultComponents = {
    defaultCloseButton: (
      <Button onClick={closePopUp} color="primary">
        {closePopupButtonLabel
          ? closePopupButtonLabel
          : defaultLabels.defaultClosePopupButtonLabel}
      </Button>
    ),
    defaultActionButton: (
      <Button onClick={handleAction} variant="contained" color="secondary">
        {actionPopupButtonLabel
          ? actionPopupButtonLabel
          : defaultLabels.defaultActionPopupButtonLabel}
      </Button>
    ),
  };

  function handleAction() {
    action();
    closePopUp();
  }

  return (
    <Dialog open={isOpen} aria-labelledby="form-dialog-title">
      <DialogTitle id="deletion-dialog">{confirmationLabel}</DialogTitle>
      <DialogContent>
        <DialogContentText>{confirmationText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {customClosePopUpButton === null
          ? null
          : customClosePopUpButton === undefined
          ? defaultComponents.defaultCloseButton
          : customClosePopUpButton}

        {customActionPopUpButton === null
          ? null
          : customActionPopUpButton === undefined
          ? defaultComponents.defaultActionButton
          : customActionPopUpButton}
      </DialogActions>
    </Dialog>
  );
}
