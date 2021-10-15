import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { PolygonType } from "../dto/PolygonType";
import { ToolboxContext } from "../context/ToolboxContext";

type PlotState = {
  isDrawingPath: boolean;
  polygon: PolygonType | null;
};

export const useUndoRedo = (props: {
  setIsUndoHistoryPresent: Dispatch<SetStateAction<boolean>>;
  setIsRedoHistoryPresent: Dispatch<SetStateAction<boolean>>;
}): {
  clearHistory: () => void;
  pushUndoHistory: (plotState: PlotState) => void;
  handleUndo: Function;
  handleRedo: Function;
} => {
  const [undoHistory, setUndoHistory] = useState<PlotState[]>([]);
  const [redoHistory, setRedoHistory] = useState<PlotState[]>([]);
  const { setIsUndoHistoryPresent, setIsRedoHistoryPresent } = props;
  const { isDrawingButtonClicked, isEditButtonClicked } = useContext(
    ToolboxContext
  );

  useEffect(() => {
    if (undoHistory.length > 0) {
      setIsUndoHistoryPresent(true);
    } else {
      setIsUndoHistoryPresent(false);
    }

    if (redoHistory.length > 0) {
      setIsRedoHistoryPresent(true);
    } else {
      setIsRedoHistoryPresent(false);
    }
  }, [undoHistory, redoHistory]);

  function getHistoryPlotId() {
    if (undoHistory.length > 0) {
      return undoHistory[0].polygon!.id;
    } else if (redoHistory.length > 0) {
      return redoHistory[0].polygon!.id;
    }
    return "";
  }

  function pushUndoHistory(state: PlotState) {
    setUndoHistory([...undoHistory, state]);
  }

  function undo(currentPlotState: PlotState) {
    let state: PlotState = undoHistory.pop()!;
    setRedoHistory([...redoHistory, currentPlotState]);
    return state;
  }

  function redo(currentPlotState: PlotState) {
    let state: PlotState = redoHistory.pop()!;
    setUndoHistory([...undoHistory, currentPlotState]);
    return state;
  }

  function clearHistory() {
    setUndoHistory([]);
    setRedoHistory([]);
  }

  function handleUndo(
    isDrawingPath: boolean,
    newPlot: PolygonType | null,
    setNewPlot: (
      value:
        | ((prevState: PolygonType | null) => PolygonType | null)
        | PolygonType
        | null
    ) => void,
    setDrawingPath: (
      value: ((prevState: boolean) => boolean) | boolean
    ) => void,
    componentSavedPolygons: PolygonType[],
    setComponentSavedPolygons: (
      value: ((prevState: PolygonType[]) => PolygonType[]) | PolygonType[]
    ) => void
  ) {
    if (isDrawingButtonClicked) {
      const state = undo({ isDrawingPath, polygon: newPlot });
      setNewPlot(state.polygon);
      setDrawingPath(state.isDrawingPath);
    } else if (isEditButtonClicked) {
      const currentPlot: PolygonType = componentSavedPolygons.find(
        (polygon) => {
          return polygon.id === getHistoryPlotId();
        }
      )!;

      const state = undo({ isDrawingPath, polygon: { ...currentPlot } });
      const index = componentSavedPolygons.findIndex((polygon) => {
        return polygon.id === state.polygon?.id;
      });
      const polygons = [...componentSavedPolygons];
      polygons[index] = state.polygon!;
      setComponentSavedPolygons(polygons);
    }
  }

  function handleRedo(
    isDrawingPath: boolean,
    newPlot: PolygonType | null,
    setNewPlot: (
      value:
        | ((prevState: PolygonType | null) => PolygonType | null)
        | PolygonType
        | null
    ) => void,
    setDrawingPath: (
      value: ((prevState: boolean) => boolean) | boolean
    ) => void,
    componentSavedPolygons: PolygonType[],
    setComponentSavedPolygons: (
      value: ((prevState: PolygonType[]) => PolygonType[]) | PolygonType[]
    ) => void
  ) {
    if (isDrawingButtonClicked) {
      const state = redo({ isDrawingPath, polygon: newPlot });

      setNewPlot(state.polygon);
      setDrawingPath(state.isDrawingPath);
    } else if (isEditButtonClicked) {
      const currentPlot: PolygonType = componentSavedPolygons.find(
        (polygon) => {
          return polygon.id === getHistoryPlotId();
        }
      )!;

      const state = redo({ isDrawingPath, polygon: { ...currentPlot } });
      const index = componentSavedPolygons.findIndex((polygon) => {
        return polygon.id === state.polygon?.id;
      });
      const polygons = [...componentSavedPolygons];
      polygons[index] = state.polygon!;
      setComponentSavedPolygons(polygons);
    }
  }

  return {
    pushUndoHistory: pushUndoHistory,
    clearHistory: clearHistory,
    handleUndo: handleUndo,
    handleRedo: handleRedo,
  };
};
