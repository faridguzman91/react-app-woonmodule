import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { createStyles } from "@material-ui/core/styles";
import { ProjectDto } from "../../dto";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import { AdditionalPropertyType } from "../../dto/AdditionalPropertyType";
import { AdditionalProperty } from "../../dto/AdditionalProperty";
import ChipInput from "material-ui-chip-input";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { checkIfColumnNameIsNotReserved } from "./HousesApi";

const useStyles = makeStyles(() =>
  createStyles({
    columnTypeSelect: {
      marginTop: "30px",
    },
    checkBoxIcon: {
      marginTop: "7px",
    },
  })
);

interface AddColumnPopUpProps {
  project: ProjectDto | null;
  isAddColumnPopUpOpen: boolean;
  setIsAddColumnPopUpOpen: (arg: boolean) => void;
  handleAddColumn: (arg: AdditionalProperty) => void;
}

export const AddColumnPopUp = ({
  project,
  isAddColumnPopUpOpen,
  setIsAddColumnPopUpOpen,
  handleAddColumn,
}: AddColumnPopUpProps) => {
  const classes = useStyles();
  const [isColumnNameInvalid, setIsColumnNameInvalid] = useState<boolean>(
    false
  );
  const [columnNameErrorText, setColumnNameErrorText] = useState<string>("");
  const [newColumnName, setNewColumnName] = useState<string>("");
  const [newColumnType, setNewColumnType] = useState<AdditionalPropertyType>(
    "string"
  );
  const [selectChoices, setSelectChoices] = useState<string[]>([]);
  const [isChoicesInvalid, setIsChoicesInvalid] = useState<boolean>(false);
  const [choicesErrorText, setChoicesErrorText] = useState<string>("");

  const handleAdd = async () => {
    const columnName = newColumnName.trim().toLowerCase();
    if (!columnName || /^\s*$/.test(columnName)) {
      setIsColumnNameInvalid(true);
      setColumnNameErrorText("Column name should not be blank");
      return;
    }
    if (!checkIfColumnNameIsNotReserved(project, newColumnName)) {
      setIsColumnNameInvalid(true);
      setColumnNameErrorText("This name is already reserved");
      return;
    }
    if (newColumnType === "select" && selectChoices.length === 0) {
      setIsChoicesInvalid(true);
      setChoicesErrorText("Add at least one choice");
      return;
    }
    if (newColumnType === "select") {
      handleAddColumn({
        name: newColumnName,
        type: newColumnType,
        field: columnName,
        choices: selectChoices,
      });
    } else {
      handleAddColumn({
        name: newColumnName,
        type: newColumnType,
        field: columnName,
      });
    }
    handleClosePopUp();
  };

  const handleClosePopUp = () => {
    setNewColumnType("string");
    setNewColumnName("");
    setSelectChoices([]);
    setIsChoicesInvalid(false);
    setIsColumnNameInvalid(false);
    setIsAddColumnPopUpOpen(false);
  };

  return (
    <Dialog open={isAddColumnPopUpOpen} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add new column</DialogTitle>
      <DialogContent>
        <DialogContentText>Column options</DialogContentText>
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

        <FormControl component="fieldset" className={classes.columnTypeSelect}>
          <FormLabel component="legend">Choose type</FormLabel>
          <RadioGroup
            aria-label="type"
            name="type"
            value={newColumnType}
            onChange={(event, value) =>
              setNewColumnType(value as AdditionalPropertyType)
            }
          >
            <FormControlLabel value="string" control={<Radio />} label="Text" />
            <FormControlLabel
              value="select"
              control={<Radio />}
              label={
                <ChipInput
                  label="Select with choices"
                  variant="outlined"
                  aria-multiline
                  defaultValue={selectChoices}
                  error={isChoicesInvalid}
                  helperText={isChoicesInvalid && choicesErrorText}
                  onChange={(chip) => setSelectChoices(chip)}
                  disabled={newColumnType !== "select"}
                />
              }
            />
            <FormControlLabel value="area" control={<Radio />} label="m2" />
            <FormControlLabel value="money" control={<Radio />} label="€" />
            <FormControlLabel
              value="checkbox"
              control={<Radio />}
              label={<CheckBoxIcon className={classes.checkBoxIcon} />}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClosePopUp} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
