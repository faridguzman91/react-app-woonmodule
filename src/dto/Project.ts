import { HouseDto } from "./index";
import { GuideLineType } from "./GuideLineType";
import { AdditionalProperty } from "./AdditionalProperty";
import { HouseType } from "./HouseType";

export type ProjectDto = {
  id?: string;
  name: string;
  houses?: HouseDto[];
  ariaViewImageId?: string;
  ariaPreViewImage?: string | null;
  isDisabled: boolean;
  guideLines?: GuideLineType[];
  creationDate: number;
  houseTypes: HouseType[];
  houseAdditionalProperties?: AdditionalProperty[];
};

export type EditorSettings = {
  cornersRadius: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
};

export const DEFAULT_EDITOR_SETTINGS = {
  cornersRadius: 5,
  strokeWidth: 1,
  strokeColor: "#FFFFFF",
  fillColor: "#508ef2",
};
