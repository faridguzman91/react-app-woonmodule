import React, { useEffect, useState } from "react";
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import { HouseDto } from "../../../dto";
import { makeStyles } from "@material-ui/core/styles";
import ImageUploading from "react-images-uploading";
import { deleteImage, saveImage } from "../../../persistence/persistence";
import { v4 as uuidv4 } from "uuid";
import { HouseStatus } from "../../../dto/HouseStatus";
import { MAX_IMAGES_NUMBER } from "../../../constants/constants";
import { ImageListType } from "react-images-uploading/dist/typings";
import { Image } from "../../../dto/Image";
import { useLoadImages } from "../../../hooks/houseHooks";
import { CustomImage } from "../../../dto/CustomImage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: "100%",
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    imageItem: {
      display: "flex",
      margin: "10px 0",
    },
    imageItem__btnWrapper: {
      display: "flex",
      flexDirection: "column",
      marginLeft: "10px",
    },
  })
);

export const HouseSettingsPopUp = (props: {
  popUpTitle: string;
  saveButtonAlias: string;
  isPopUpOpen: boolean;
  closePopUp: () => void;
  saveHouse: (house: HouseDto) => void;
  house: HouseDto | null;
  houseTypes: string[];
}) => {
  const {
    saveButtonAlias,
    popUpTitle,
    isPopUpOpen,
    closePopUp,
    saveHouse,
    house,
    houseTypes,
  } = props;

  const classes = useStyles();
  const [houseType, setType] = useState<string>("");
  const [houseStatus, setHouseStatus] = useState<HouseStatus>("");
  const [housePrice, setHousePrice] = useState(0);
  const [housePlotSize, setHousePlotSize] = useState(0);
  const [houseSize, setHouseSize] = useState(0);
  const [images, setImages] = useLoadImages([]);

  useEffect(() => {
    setType(house?.type ? house?.type : "");
    setHouseStatus(house?.status ? house.status : "");
    setHousePrice(house?.price ? house.price : 0);
    setHousePlotSize(house?.plotSize ? house.plotSize : 0);
    setHouseSize(house?.houseSize ? house.houseSize : 0);
    setImages(house?.imagesMap ? Array.from(house?.imagesMap.values()) : []);
  }, [house]);

  const manageImages = (house: HouseDto): Map<string, Image> => {
    const result: Map<string, Image> = new Map<string, Image>();
    const deletedImages: Map<string, Image> = house?.imagesMap
      ? house?.imagesMap
      : new Map<string, Image>();

    for (let i = 0; i < images.length; i++) {
      let img = images[i] as CustomImage;
      if (!img.id) {
        const id = uuidv4();
        img.id = id;
        saveImage(id, img.file);
        result.set(id, { id: img.id });
      } else if (deletedImages.has(img.id)) {
        result.set(img.id, { id: img.id });
        deletedImages.delete(img.id);
      }
    }

    if (deletedImages.size !== 0) {
      for (const idImgToDelete of deletedImages.keys()) {
        deleteImage(idImgToDelete);
      }
    }

    return result;
  };

  function handleCreateUpdateHouse(house: HouseDto | null) {
    const imagesMap = manageImages(house ? house : ({} as HouseDto));

    const houseToSave: HouseDto = {
      number: props.house?.number ? props.house?.number : 0,
      price: housePrice,
      type: houseType,
      status: houseStatus,
      plotSize: housePlotSize,
      houseSize: houseSize,
      imagesMap: imagesMap,
      polygons: house ? house.polygons : [],
    };
    saveHouse(houseToSave);
    closePopUp();
  }

  const handleClosePopUp = () => {
    setType(house?.type ? house?.type : "");
    setHouseStatus(house?.status ? house?.status : "");
    setHousePrice(house?.price ? house?.price : 0);
    setHousePlotSize(house?.plotSize ? house?.plotSize : 0);
    setHouseSize(house?.houseSize ? house?.houseSize : 0);
    setImages(house?.imagesMap ? Array.from(house?.imagesMap.values()) : []);
    closePopUp();
  };

  // const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setType(event.target.value as string);
  // };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setHouseStatus(event.target.value as HouseStatus);
  };

  const onImageUploadingChange = (imageList: ImageListType) => {
    setImages(imageList as CustomImage[]);
  };

  return (
    <Dialog open={isPopUpOpen} aria-labelledby="form-dialog-title">
      <DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography component={"span"} variant={"h4"} gutterBottom>
              {popUpTitle}
            </Typography>
          </DialogContentText>

          <FormControl className={classes.formControl}>
            <InputLabel id="house-type-select-label">Type</InputLabel>
            <Select
              labelId="house-type-select-label"
              id="house-type-select"
              value={houseType}
              onChange={() => {}}
            >
              {houseTypes &&
                houseTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel id="house-status-select-label">Status</InputLabel>
            <Select
              labelId="house-status-select-label"
              id="house-status-select"
              value={houseStatus}
              onChange={handleStatusChange}
            >
              <MenuItem value={"Beschikbaar"}>Beschikbaar</MenuItem>
              <MenuItem value={"Optie"}>Optie</MenuItem>
              <MenuItem value={"Verkocht"}>Verkocht</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="price"
            label="v.o.n. prijs"
            type="number"
            fullWidth
            defaultValue={housePrice}
            onChange={(event) => setHousePrice(+event.target.value)}
          />
          <TextField
            margin="dense"
            id="plot-size"
            label="Kavel afmeting ** m2"
            type="number"
            fullWidth
            defaultValue={housePlotSize}
            onChange={(event) => setHousePlotSize(+event.target.value)}
          />
          <TextField
            margin="dense"
            id="house-size"
            label="Gebruiksoppervlakte woning **m2"
            type="number"
            fullWidth
            defaultValue={houseSize}
            onChange={(event) => setHouseSize(+event.target.value)}
          />
          <div>
            <ImageUploading
              multiple
              value={images}
              onChange={onImageUploadingChange}
              maxNumber={MAX_IMAGES_NUMBER}
              dataURLKey="dataURL"
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageRemove,
              }) => (
                <div className="upload__image-wrapper">
                  <Button
                    style={{ marginRight: "10px" }}
                    onClick={onImageUpload}
                    variant={"outlined"}
                    color="primary"
                  >
                    Upload image
                  </Button>
                  <Button
                    onClick={onImageRemoveAll}
                    variant={"outlined"}
                    color="secondary"
                  >
                    Remove all
                  </Button>
                  {imageList.map((image, index) => (
                    <div key={index} className="imageItem">
                      <img src={image.dataURL} width="100" />
                      <div className="imageItem__btnWrapper">
                        <Button
                          variant={"outlined"}
                          color="secondary"
                          onClick={() => onImageRemove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopUp} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateUpdateHouse(house)}
            color="primary"
          >
            {saveButtonAlias}
          </Button>
        </DialogActions>
      </DialogTitle>
    </Dialog>
  );
};
