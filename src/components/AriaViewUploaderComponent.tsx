import {
  APP_IMAGE_EXTENSIONS,
  BYTES_IN_MEGABYTE,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_WIDTH,
} from "../constants/constants";
import { v4 as uuidv4 } from "uuid";
import { loadImageDownloadUrl, saveImage } from "../persistence/persistence";
import ImageUploader from "react-images-upload";
import React, { useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export const AriaViewUploaderComponent = (props: {
  setImageId: (id: string) => void;
  setImageLoadUrl: (loadUrl: string) => void;
}) => {
  const { setImageId, setImageLoadUrl } = props;

  const [
    imageValidationErrorMessage,
    setImageValidationErrorMessage,
  ] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateImage = (image: File) => {
    // if (!image || !APP_IMAGE_EXTENSIONS.includes(image.type)) {
    //   setImageValidationErrorMessage("Image extension is not supported");
    // } else if (image.size > MAX_IMAGE_SIZE) {
    //   setImageValidationErrorMessage("Image size is too big");
    // } else {
    //   const img = new Image();
    //   img.src = URL.createObjectURL(image);
    //   img.onload = function () {
    //     if (img.width < MAX_IMAGE_WIDTH) {
    //       setImageValidationErrorMessage("Image width is too little");
    //     } else if (img.height < MAX_IMAGE_HEIGHT) {
    //       setImageValidationErrorMessage("Image height is too little");
    //     } else {
    handleImageUploaded(image);
    //     }
    //   };
    // }
  };

  const handleImageUploaded = async (image: any) => {
    setIsLoading(true);
    const url = uuidv4();
    await saveImage(url, image);
    const ariaPreViewImage = await loadImageDownloadUrl(url);
    setImageLoadUrl(ariaPreViewImage!);
    setImageId(url);
  };

  return (
    <div>
      {isLoading ? (
        <div>
          Processing image...
          <br />
          <CircularProgress />
        </div>
      ) : (
        <ImageUploader
          withIcon={false}
          withPreview={false}
          singleImage={true}
          label={
            `Max file size: ${
              MAX_IMAGE_SIZE / BYTES_IN_MEGABYTE
            } mb; minimal resolution: ${MAX_IMAGE_WIDTH} * ${MAX_IMAGE_HEIGHT} px;
              extension: ${APP_IMAGE_EXTENSIONS} \n\n` +
            imageValidationErrorMessage
          }
          labelStyles={
            !imageValidationErrorMessage
              ? { whiteSpace: "pre-line" }
              : { color: "red", fontSize: "15px" }
          }
          buttonText="Upload an aerial view"
          onChange={(images) => validateImage(images[0])}
          fileSizeError=""
          fileTypeError=""
          errorStyle={{ fontSize: "0px" }}
        />
      )}
    </div>
  );
};
