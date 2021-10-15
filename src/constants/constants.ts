export const MAX_IMAGE_SIZE = Number(process.env.REACT_APP_MAX_IMAGE_SIZE);
export const MAX_IMAGE_HEIGHT = Number(process.env.REACT_APP_MAX_IMAGE_HEIGHT);
export const MAX_IMAGE_WIDTH = Number(process.env.REACT_APP_MAX_IMAGE_WIDTH);
export const APP_IMAGE_EXTENSIONS =
  process.env.REACT_APP_IMAGE_EXTENSIONS &&
  JSON.parse(process.env.REACT_APP_IMAGE_EXTENSIONS);
export const MAX_IMAGES_NUMBER = Number(
  process.env.REACT_APP_MAX_IMAGES_NUMBER
);
export const BYTES_IN_MEGABYTE = 1048576;
export const AUTO_HIDDEN_ALERT_DURATION = 4000;
export const INITIAL_VIEW_BOX_X_VALUE = 1000;

export const PROJECT_COLLECTION_PATH =
  process.env.REACT_APP_PROJECT_COLLECTION_PATH;
