import { AdditionalPropertyType } from "./AdditionalPropertyType";

export type AdditionalProperty = {
  name: string;
  type: AdditionalPropertyType;
  field: string;
  choices?: string[];
};
