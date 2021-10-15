import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import React, { ChangeEvent, useContext } from "react";
import { AppMode, AppModeContext } from "../../context/AppModeContext";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { createStyles, Theme } from "@material-ui/core";

export const AppBarComponent = (props: { projectName: string }) => {
  const { appMode, setAppMode } = useContext(AppModeContext);

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      projectName: {
        gridColumnStart: "2",
        gridColumnEnd: "2",
        alignItems: "center",
        justifySelf: "center",
        alignSelf: "center",
      },
    })
  );

  const classes = useStyles();
  const { projectName } = props;

  const handleChange = (event: ChangeEvent<{}>, newValue: AppMode) => {
    setAppMode(newValue);
  };

  return (
    <AppBar
      position="static"
      style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr" }}
    >
      <Tabs
        value={appMode}
        onChange={handleChange}
        style={{
          minWidth:"400px",
          gridColumnStart: "1",
          gridColumnEnd: "2",
        }}
      >
        <Tab label="Build" {...a11yProps(AppMode.edit)} />
        <Tab label="Preview" {...a11yProps(AppMode.view)} />
      </Tabs>

      <Typography variant="h6" color="inherit" className={classes.projectName}>
        Project: {projectName}
      </Typography>
    </AppBar>
  );
};

function a11yProps(index: any) {
  return {
    id: `nav-tab-${index}`,
    "aria-controls": `nav-tabpanel-${index}`,
  };
}
