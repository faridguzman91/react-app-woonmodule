import { Image } from "./Image";

export type CustomImage = Image & { file?: File; dataURL?: string };
