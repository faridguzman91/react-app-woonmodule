import { HouseDto } from "../dto";

export const convertImageJsonToMap = (housesDocumentData: any) => {
  const houses: HouseDto[] = [...housesDocumentData];
  for (const house of houses) {
    house.imagesMap = new Map(Object.entries(house.imagesMap));
  }
  return houses;
};

export const convertImageMapToJson = (houses: HouseDto[] | undefined) => {
  const jsonHouses: any = houses ? [...houses] : [];

  if (!houses) {
    return;
  }

  for (const house of jsonHouses) {
    if (!house.imagesMap) {
      house.imagesMap = new Map();
    }
    if (house.imagesMap instanceof Map) {
      house.imagesMap = Object.fromEntries(house.imagesMap);
    }
  }
  return jsonHouses;
};
