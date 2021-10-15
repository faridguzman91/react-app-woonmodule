import { HouseStatus } from "./HouseStatus";
import { Image } from "./Image";
import { PolygonType } from "./PolygonType";

export type HouseDto = {
  number: number;
  type: string;
  status: HouseStatus;
  price: number;
  plotSize: number;
  houseSize: number;
  imagesMap: Map<string, Image>;
  polygon?: PolygonType;
  polygons: PolygonType[];
};

export const houseDtoReservedPropertyNames: string[] = [
  "number",
  "type",
  "status",
  "price",
  "plotSize",
  "houseSize",
  "ImagesMap",
  "polygon",
  "polygons",
];
