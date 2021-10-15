import { Point } from "./PolygonType";

export type GuideLineType = {
  id?: string;
  linePoints: { point1?: Point; point2?: Point };
  polygonPoints?: {
    point1?: Point;
    point2?: Point;
    point3?: Point;
    point4?: Point;
  };
  lineParameters?: {a: number, b: number, c: number} //ax + by + c = 0 not necessarily present
  style?: {
    color?: string;
    width?: number;
    stroke?: string;
  }
};
