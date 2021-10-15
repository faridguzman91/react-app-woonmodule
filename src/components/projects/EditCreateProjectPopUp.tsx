import React, { useEffect, useState } from "react";
import {
  deleteImage,
  loadImageDownloadUrl,
  saveImage,
  saveProject,
} from "../../persistence/persistence";
import { HouseDto, ProjectDto } from "../../dto";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import { Button } from "@material-ui/core";
import { AriaViewUploaderComponent } from "../AriaViewUploaderComponent";
import moment from "moment";
import "cropperjs/dist/cropper.css";
import ImageCropperComponent from "../../ImageCropperComponent";
import { HouseType } from "../../dto/HouseType";

export function EditCreateProjectPopUp(props: {
  isPopupOpen: boolean;
  closePopup: () => void;
  updateProject: (project: ProjectDto) => void;
  project?: ProjectDto | null;
}) {
  const [imageId, setImageId] = useState("");
  const [imageLoadUrl, setImageLoadUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [houseNumber, setHouseNumber] = useState(0);
  const [isProjectNameInvalid, setIsProjectNameInvalid] = useState(false);
  const [isHouseTypesInvalid, setIsHouseTypesInvalid] = useState(false);
  const [isEditProject, setIsEditProject] = useState(false);
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [houseTypes, setHouseTypes] = useState<HouseType[]>([]);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const { isPopupOpen, closePopup, updateProject } = props;

  useEffect(() => {
    if (props.project) {
      setProject(props.project);
      setProjectName(props.project.name);
      setHouseTypes(props.project.houseTypes);
      if (props.project.ariaViewImageId) {
        setImageId(props.project.ariaViewImageId);
      }
      if (props.project.ariaPreViewImage) {
        setImageLoadUrl(props.project.ariaPreViewImage);
      }
    } else {
      setProject(null);
    }
  }, [props.project]);

  useEffect(() => {
    if (project) {
      setIsEditProject(true);
    } else {
      setIsEditProject(false);
    }
  }, [project]);

  const getHousesArray = (number: number): HouseDto[] => {
    let houseArray = [];
    for (let i = 0; i < number; i++) {
      houseArray.push({
        number: i + 1,
      } as HouseDto);
    }
    return houseArray;
  };

  const isInvalidProjectName = () => {
    if (projectName === "") {
      setIsProjectNameInvalid(true);
      return true;
    }
    setIsProjectNameInvalid(false);
    return false;
  };

  const isInvalidHouseTypes = () => {
    if (houseTypes.length <= 0) {
      setIsHouseTypesInvalid(true);
      return true;
    }
    setIsHouseTypesInvalid(false);
    return false;
  };

  const handleCreateProject = async () => {
    let image;
    if (croppedImage) {
      image = await saveCroppedImage(imageLoadUrl);
    }
    if (!isProjectNameInvalid && !isHouseTypesInvalid) {
      const project: ProjectDto = {
        name: projectName,
        houses: getHousesArray(houseNumber),
        ariaViewImageId: imageId,
        ariaPreViewImage: image ? image : imageLoadUrl,
        isDisabled: false,
        guideLines: [],
        creationDate: moment().unix(),
        houseTypes: houseTypes,
        houseAdditionalProperties: [],
      };
      await saveProject(undefined, project);
      closePopup();
    }
  };

  const handleCancel = () => {
    setProjectName("");
    setHouseNumber(0);
    setImageId("");
    setImageLoadUrl("");
    closePopup();
    if (!isEditProject) {
      deleteImage(imageId);
    }
  };

  async function saveCroppedImage(ariaPreViewImage: string) {
    fetch(croppedImage!)
      .then((res) => res.blob())
      .then(async (blob) => {
        const file = new File([blob], "image", { type: "image/png" });
        await saveImage(imageId, file);
      });
    ariaPreViewImage = (await loadImageDownloadUrl(imageId)) as string;
    return ariaPreViewImage;
  }

  const handleSaveCreate = async () => {
    if (isInvalidHouseTypes()) {
      return;
    }
    if (isEditProject) {
      const name = projectName;
      const ariaViewImageId = imageId;
      let ariaPreViewImage = imageLoadUrl;

      if (croppedImage) {
        ariaPreViewImage = await saveCroppedImage(ariaPreViewImage);
      }

      updateProject({
        ...project!,
        houseTypes,
        name,
        ariaViewImageId,
        ariaPreViewImage,
      });

      if (project!.ariaViewImageId === "") {
        deleteImage(project!.ariaViewImageId!);
      }

      closePopup();
    } else {
      await createProject();
    }
  };

  const createProject = async () => {
    if (!isInvalidProjectName() || !isInvalidHouseTypes()) {
      await handleCreateProject();
      setImageId("");
      setImageLoadUrl("");
      closePopup();
    }
  };

  function handleDeleteImage(project: ProjectDto) {
    const editedProject = { ...project };
    editedProject.ariaViewImageId = "";
    editedProject.ariaPreViewImage = "";
    setImageId("");
    setImageLoadUrl("");
    setProject(editedProject);
  }

  function handleHouseTypeChange(value: string) {
    if (value) {
      setHouseTypes(
        value.split(/\s*[,;]\s*/).map((element) => {
          return {
            type: element,
            name: "",
            houseSize: 0,
            roomCount: 0,
          } as HouseType;
        })
      );
    }
  }

  return (
    <Dialog open={isPopupOpen} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        {isEditProject ? `Edit: ${project?.name}` : "Add new project"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To {isEditProject ? "edit" : "create"} project, please fill required
          fields
        </DialogContentText>
        <TextField
          id="projectName"
          autoFocus
          margin="dense"
          label="Project name"
          type="name"
          fullWidth
          required={true}
          error={isProjectNameInvalid}
          helperText={isProjectNameInvalid && "Project name is required"}
          defaultValue={project?.name}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <TextField
          margin="dense"
          id="houseNumber"
          label="Number of houses"
          type="number"
          disabled={isEditProject}
          fullWidth
          defaultValue={project?.houses?.length}
          InputProps={{ inputProps: { min: 0 } }}
          onChange={(event) => setHouseNumber(parseInt(event.target.value, 10))}
        />
        <TextField
          margin="dense"
          id="houseTypes"
          label="HouseTypes"
          type="text"
          //disabled={isEditProject}
          required={true}
          defaultValue={project?.houseTypes.join(",")}
          error={isHouseTypesInvalid}
          helperText={isHouseTypesInvalid && "At least 1 house type required"}
          fullWidth
          onChange={(event) => handleHouseTypeChange(event.target.value)}
        />
        {project?.ariaPreViewImage ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <ImageCropperComponent
              imageSource={project.ariaPreViewImage}
              deleteImage={() => handleDeleteImage(project)}
              getImage={setCroppedImage}
            />
          </div>
        ) : imageId === "" ? (
          <AriaViewUploaderComponent
            setImageId={setImageId}
            setImageLoadUrl={setImageLoadUrl}
          />
        ) : (
          <ImageCropperComponent
            imageSource={imageLoadUrl}
            deleteImage={() => handleDeleteImage(project!)}
            getImage={setCroppedImage}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSaveCreate} color="primary">
          {isEditProject ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
