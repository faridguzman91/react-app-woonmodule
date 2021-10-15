import React from "react";
import "./App.css";
import "./assets/stylesheets/base.scss";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
//import Editor from "./components/Editor";
//import PublicView from "./components/PublicView";
import { Projects } from "./components/projects/Projects";
import { ProjectSettings } from "./components/project-settings/ProjectSettings";
import { ContextProvider } from "./context/AppModeContext";
import { HouseContextProvider } from "./context/HouseContext";
import { ToolboxContextProvider } from "./context/ToolboxContext";
import { HousesEdit } from "./components/houses-edit/HousesEdit";
import { ProjectViewOnly } from "./components/project-settings/ProjectViewOnly";

const App = () => {
  return (
    <Router>
      <ContextProvider>
        <HouseContextProvider>
          <ToolboxContextProvider>
            <Switch>
              <Route exact path="/projects" children={<Projects />} />
              <Route
                exact
                path="/projects/:id"
                children={<ProjectSettings />}
              />
              <Route
                exact
                path="/projects/houses-edit/:id"
                children={<HousesEdit />}
              />
              <Route exact path="/view/:id" children={<ProjectViewOnly />} />
              {/* <Route exact path="/edit/:id" children={<Editor />} /> */}
              {/* <Route exact path="/add" children={<Editor />} /> */}
              {/* <Route exact path="/public/:id" children={<PublicView />} /> */}
              <Route exact path="/">
                <Redirect to="/projects" />
              </Route>
            </Switch>
          </ToolboxContextProvider>
        </HouseContextProvider>
      </ContextProvider>
    </Router>
  );
};

export default App;
