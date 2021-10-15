import React, { useEffect, useState } from "react";
import { useProjects } from "../../hooks/projectHooks";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { ProjectTableFooter } from "./ProjectTableFooter";
import { ProjectsTableHead } from "./ProjectsTableHead";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import { ProjectDto } from "../../dto";
import { EditCreateProjectPopUp } from "./EditCreateProjectPopUp";
import { useHistory } from "react-router-dom";
import ConfirmationPopUp from "../ConfirmationPopUp";
import { deleteProject, saveProject } from "../../persistence/persistence";
import moment from "moment";
import SearchIcon from "@material-ui/icons/Search";

//makestyles thema uit material core

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      minWidth: 500,
    },
    button: {
      height: "50px",
      fontWeight: "bold",
      paddingLeft: "35px",
      paddingRight: "35px",
    },
    topBox: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginTop: "20px",
    },
    searchField: {
      marginTop: "10px",
      marginBottom: "20px",
      width: "400px",
    },
  })
);

type ProjectsProps = {};

export const Projects = (props: ProjectsProps) => {
  const history = useHistory();
  //eerste state is een object, setProjects wordt update functie
  const [{ projects }, setProjects] = useProjects();
  //classes zijn nu functies
  const classes = useStyles();
  //stateful waarde, dan update functie (set defalt state naar 0)
  const [page, setPage] = React.useState(0);
  //eerst een stateful waarde, dan de update functie
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
//stateful waarde addProjectDialog, update functie setAddProjectDialog
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  //idem ditto
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  //idem ditto
  const [projectToDelete, setProjectToDelete] = useState<ProjectDto | null>(
    //idem ditto
    null
  );
  const [projectsState, setProjectsState] = useState<ProjectDto[]>([]);
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    setProjectsState([...projects]);
  }, [projects]);

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, projectsState.length - page * rowsPerPage);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenProject = (project: ProjectDto) => {
    history.push(`/projects/houses-edit/${project.id}`);
  };

  const handleOpenDeleteProjectForm = (project: ProjectDto) => {
    setProjectToDelete(project);
    setDeleteProjectDialogOpen(true);
  };

  const handleCloseDeleteProjectForm = () => {
    setProjectToDelete(null);
    setDeleteProjectDialogOpen(false);
    setProjects();
  };

  const handleOpenProjectForm = (project: any) => {
    if (!project) {
      setProject(null);
    } else {
      setProject(project);
    }
    setAddProjectDialogOpen(true);
  };

  const handleCloseProjectForm = () => {
    setAddProjectDialogOpen(false);
    setProjects();
  };

  const handleDelete = async () => {
    if (projectToDelete && projectToDelete.id) {
      await deleteProject(projectToDelete.id);
    }
  };

  async function handleUpdateProject(project: ProjectDto) {
    await saveProject(project.id, project);
    setProjects();
  }

  return (
    <>
      <EditCreateProjectPopUp
        isPopupOpen={addProjectDialogOpen}
        closePopup={handleCloseProjectForm}
        project={project}
        updateProject={handleUpdateProject}
      />

      <ConfirmationPopUp
        isOpen={deleteProjectDialogOpen}
        closePopUp={handleCloseDeleteProjectForm}
        confirmationLabel={<div>Delete project</div>}
        confirmationText={
          <>
            Delete project <b>{projectToDelete?.name}</b>?
          </>
        }
        action={handleDelete}
      />

      <Box className={classes.topBox}>
        <Box
          display={"flex"}
          flexDirection="row"
          justifyContent={"space-between"}
        >
          <Typography variant="h3" component="h3">
            List of Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<AddIcon />}
            onClick={() => handleOpenProjectForm(null)}
          >
            Add New Project
          </Button>
        </Box>

        <TextField
          type="search"
          placeholder={"Search a project"}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          variant={"outlined"}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="custom pagination table">
          <ProjectsTableHead />
          <TableBody>
            {(rowsPerPage > 0
              ? projectsState.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : projectsState
            )
              .filter((projectsState) =>
                projectsState.name
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              )
              .map((projectsState) => (
                <TableRow key={projectsState.id} hover>
                  <TableCell
                    component="th"
                    scope="row"
                    align="left"
                    onClick={() => handleOpenProject(projectsState)}
                  >
                    {projectsState.name}
                  </TableCell>
                  <TableCell
                    style={{ width: 160 }}
                    align="center"
                    onClick={() => handleOpenProject(projectsState)}
                  >
                    {projectsState.houses?.length}
                  </TableCell>
                  {/* <TableCell
                  style={{ minWidth: 160 }}
                  align="center"
                  onClick={() => handleOpenProject(projectsState)}
                >
                  {projectsState.ariaViewImageId}
                </TableCell> */}

                  <TableCell
                    onClick={() => handleOpenProject(projectsState)}
                    style={{ minWidth: 160 }}
                    align="center"
                    sortDirection={"desc"}
                  >
                    {moment
                      .unix(projectsState.creationDate)
                      .format("DD/MM/YYYY hh:mm")}
                  </TableCell>

                  <TableCell align="center" width="100">
                    <IconButton
                      onClick={() => handleOpenProjectForm(projectsState)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDeleteProjectForm(projectsState)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <ProjectTableFooter
            count={projectsState.length}
            rowsPerPage={rowsPerPage}
            page={page}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Table>
      </TableContainer>
    </>
  );
};
