import { HouseDto, ProjectDto } from "../../dto";
import { deleteImage, saveProject } from "../../persistence/persistence";
import { houseDtoReservedPropertyNames } from "../../dto/House";
import { HouseType } from "../../dto/HouseType";

export const calculateHouseNumber = (stateProject: ProjectDto): number => {
  let maxCounter = 0;
  if (!stateProject.houses) {
    return 1;
  }
  for (const house of stateProject.houses) {
    if (house.number > maxCounter) {
      maxCounter = house.number;
    }
  }
  maxCounter++;
  return maxCounter;
};

const removeHouse = (houses: HouseDto[], number: number): HouseDto[] => {
  const editHouses = [...houses];
  for (let i = 0; i < editHouses.length; i++) {
    if (editHouses[i].number === number) {
      editHouses.splice(i, 1);
    }
  }
  return editHouses;
};

const fillEmptyHouseFields = (house: HouseDto) => {
  if (!house.imagesMap) {
    house.imagesMap = new Map();
  }
  if (!house.price) {
    house.price = 0;
  }
  if (!house.houseSize) {
    house.houseSize = 0;
  }
};

export const handleSaveHouse = async (
  house: HouseDto,
  stateProject: ProjectDto | null,
  setStateProject: (atg: ProjectDto) => void
) => {
  fillEmptyHouseFields(house);
  let houses: HouseDto[];
  if (!stateProject) {
    return;
  }

  if (!house.polygons) {
    house.polygons = [];
  }

  if (stateProject.houses) {
    houses = [...stateProject.houses];
  } else {
    houses = [];
  }

  if (house.number === 0) {
    house.number = calculateHouseNumber(stateProject);
    houses.push(house);
  } else {
    houses = removeHouse(houses, house.number);
    houses.push(house);
    houses.sort((a, b) => a.number - b.number);
  }

  const updatedProject = { ...stateProject };
  updatedProject.houses = houses;
  setStateProject(updatedProject);

  await saveProject(updatedProject.id, updatedProject);
};

const deleteHouseImages = (imageIds: string[]) => {
  for (const id of imageIds) {
    deleteImage(id);
  }
};

export const handleDeleteHouse = async (
  house: HouseDto,
  stateProject: ProjectDto | null,
  setStateProject: (atg: ProjectDto) => void
) => {
  if (!stateProject || !stateProject.houses) {
    return;
  }
  const houses = [...stateProject.houses];
  const index = houses.findIndex((element) => element.number === house.number);

  if (index >= 0) {
    houses.splice(index, 1);
  }
  await deleteHouseImages(Array.from(house.imagesMap.keys()));
  stateProject.houses = houses;
  const updatedProject = { ...stateProject };
  setStateProject(updatedProject);
  await saveProject(stateProject.id, stateProject);
};

export const checkIfColumnNameIsNotReserved = (
  project: ProjectDto | null,
  newColumnName: string
): boolean => {
  return !(
    houseDtoReservedPropertyNames.includes(newColumnName) ||
    project?.houseAdditionalProperties
      ?.map(function (property) {
        return property.name;
      })
      .includes(newColumnName)
  );
};

export const handleSaveHouseType = async (
  houseType: HouseType,
  stateProject: ProjectDto | null,
  setStateProject: (atg: ProjectDto) => void
) => {
  let houseTypes: HouseType[];
  if (!stateProject) {
    return;
  }

  if (stateProject.houseTypes) {
    houseTypes = [...stateProject.houseTypes];
  } else {
    houseTypes = [];
  }

  const index = houseTypes.findIndex(
    (element) => element.type === houseType.type
  );

  if (index === -1) {
    houseTypes.push(houseType);
  } else {
    houseTypes[index] = houseType;
  }

  const updatedProject = { ...stateProject };
  updatedProject.houseTypes = houseTypes;
  setStateProject(updatedProject);

  await saveProject(updatedProject.id, updatedProject);
};

export const handleDeleteHouseType = async (
  houseType: HouseType,
  stateProject: ProjectDto | null,
  setStateProject: (atg: ProjectDto) => void
) => {
  if (!stateProject || !stateProject.houses) {
    return;
  }
  const houseTypes = [...stateProject.houseTypes];
  const index = houseTypes.findIndex(
    (element) => element.type === houseType.type
  );

  if (index >= 0) {
    houseTypes.splice(index, 1);
  }
  stateProject.houseTypes = houseTypes;
  const updatedProject = { ...stateProject };
  setStateProject(updatedProject);
  await saveProject(stateProject.id, stateProject);
};
