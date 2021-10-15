import {EditorSettings} from "./Project";

export type Point = { x: number; y: number };

export type Segment = {
  sides: Point[];
  isLastSegment: boolean;
  polygon: PolygonType;
};

export type PolygonType = {
  id: string;
  points: Point[];
  houseNumber: number;
  editorSettings: EditorSettings
};
