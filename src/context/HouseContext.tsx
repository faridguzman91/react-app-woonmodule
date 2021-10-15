import React, { useState } from "react";
import { HouseDto } from "../dto";
import { PolygonType } from "../dto/PolygonType";

type Props = {};

export const HouseContext = React.createContext<{
  house: HouseDto | null;
  setHouse: (v: HouseDto) => void;
  newPlot: PolygonType | null;
  setNewPlot: (v: PolygonType | null) => void;
  polygonId: string | null;
  setPolygonId: (v: string | null) => void;
}>({
  house: null,
  setHouse: () => {},
  newPlot: null,
  setNewPlot: () => {},
  polygonId: null,
  setPolygonId: () => {},
});

export const HouseContextProvider: React.FunctionComponent<Props> = (props) => {
  const [house, setHouse] = useState<HouseDto | null>(null);
  const [newPlot, setNewPlot] = useState<PolygonType | null>(null);
  const [polygonId, setPolygonId] = useState<string | null>(null);
  const { children } = props;

  return (
    <HouseContext.Provider
      value={{
        house: house,
        setHouse: setHouse,
        newPlot: newPlot,
        setNewPlot: setNewPlot,
        polygonId: polygonId,
        setPolygonId: setPolygonId,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
};
