import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  CallMissed,
  Check,
  Clear,
  Crop,
  Delete,
  PanTool,
  RotateLeft,
  RotateRight,
  ZoomIn,
  ZoomOut,
} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";

export const ImageCropperComponent = (props: {
  imageSource: string;
  deleteImage: () => void;
  getImage: Dispatch<SetStateAction<string | null>>;
}) => {
  const { imageSource, deleteImage, getImage } = props;

  const [image, setImage] = useState<any>(null);
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState<any>();

  useEffect(() => {
    const data = async () => {
      let blob = await fetch(imageSource).then((r) => r.blob());
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as any);
      };

      reader.readAsDataURL(blob);
    };
    data();
  }, [imageSource]);

  useEffect(() => {
    if (cropData) {
      setImage(cropData);
    }
  }, [cropData]);

  function getCropData() {
    const crop = cropper.getCroppedCanvas().toDataURL();
    setCropData(crop);
    getImage(crop);
  }

  function setDragModeCrop() {
    cropper.setDragMode("crop");
  }

  function setDragModeMove() {
    cropper.setDragMode("move");
  }

  function setDragModeClear() {
    cropper.clear();
  }

  function setZoomIn() {
    cropper.zoom(0.1);
  }

  function setZoomOut() {
    cropper.zoom(-0.1);
  }

  function setRotationRight() {
    cropper.rotate(90);
  }

  function setRotationLeft() {
    cropper.rotate(-90);
  }

  function handleReset() {
    cropper.reset();
  }

  return (
    <div>
      <div style={{ width: "100%" }}>
        <Cropper
          style={{ height: 400, width: "100%" }}
          initialAspectRatio={1}
          preview=".img-preview"
          src={image}
          viewMode={3}
          guides={true}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          responsive={true}
          autoCropArea={1}
          checkOrientation={false}
          onInitialized={(instance) => {
            setCropper(instance);
          }}
        />
      </div>
      <div>
        <IconButton color="primary" onClick={setDragModeCrop}>
          <Crop />
        </IconButton>
        <IconButton color="primary" onClick={setDragModeMove}>
          <PanTool />
        </IconButton>
        <IconButton color="primary" onClick={setDragModeClear}>
          <Clear />
        </IconButton>
        <IconButton color="primary" onClick={getCropData}>
          <Check />
        </IconButton>

        <IconButton color="primary" onClick={setZoomIn}>
          <ZoomIn />
        </IconButton>
        <IconButton color="primary" onClick={setZoomOut}>
          <ZoomOut />
        </IconButton>

        <IconButton color="primary" onClick={setRotationRight}>
          <RotateRight />
        </IconButton>
        <IconButton color="primary" onClick={setRotationLeft}>
          <RotateLeft />
        </IconButton>

        <IconButton color="primary" onClick={handleReset}>
          <CallMissed />
        </IconButton>
        <IconButton color="secondary" onClick={deleteImage}>
          <Delete />
        </IconButton>
      </div>
    </div>
  );
};

export default ImageCropperComponent;
