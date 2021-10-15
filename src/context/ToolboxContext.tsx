import React, { createContext, useState } from "react";

type ToolboxContextProps = {};

export const ToolboxContext = createContext<{
  isDrawingButtonClicked: boolean;
  setIsDrawingButtonClicked: (v: boolean) => void;
  isSavePolygonButtonClicked: boolean;
  setIsSavePolygonButtonClicked: (v: boolean) => void;
  isEditButtonClicked: boolean;
  setIsEditButtonClicked: (v: boolean) => void;
  isDrawGuideLineButtonClicked: boolean;
  setIsDrawGuideLineButtonClicked: (v: boolean) => void;
  isUndoButtonClicked: boolean;
  setIsUndoButtonClicked: (v: boolean) => void;
  isRedoButtonClicked: boolean;
  setIsRedoButtonClicked: (v: boolean) => void;
  isAddInnerLineButtonClicked: boolean;
  setIsAddInnerLineButtonClicked: (v: boolean) => void;
  isMovingPolygon: boolean;
  setIsMovingPolygon: (v: boolean) => void;
  isMovingGuideLine: boolean;
  setIsMovingGuideLine: (v: boolean) => void;
  isMovingGuideLinePoint: boolean;
  setIsMovingGuideLinePoint: (v: boolean) => void;
  isSavePolygonButton: boolean;
  setIsSavePolygonButton: (v: boolean) => void;
  imageShown: boolean;
  setImageShown: (v: boolean) => void;
  guideLinesShown: boolean;
  setGuideLinesShown: (v: boolean) => void;
  isResetTransform: boolean;
  setIsResetTransform: (v: boolean) => void;
  toolBoxShown: boolean;
  setToolBoxShown: (v: boolean) => void;
  currentScale: number;
  setCurrentScale: (v: number) => void;
}>({
  isDrawingButtonClicked: false,
  setIsDrawingButtonClicked: () => {},
  isSavePolygonButtonClicked: false,
  setIsSavePolygonButtonClicked: () => {},
  isEditButtonClicked: false,
  setIsEditButtonClicked: () => {},
  isDrawGuideLineButtonClicked: false,
  setIsDrawGuideLineButtonClicked: () => {},
  isUndoButtonClicked: false,
  setIsUndoButtonClicked: () => {},
  isRedoButtonClicked: false,
  setIsRedoButtonClicked: () => {},
  isAddInnerLineButtonClicked: false,
  setIsAddInnerLineButtonClicked: () => {},
  isMovingPolygon: false,
  setIsMovingPolygon: () => {},
  isMovingGuideLine: false,
  setIsMovingGuideLine: () => {},
  isMovingGuideLinePoint: false,
  setIsMovingGuideLinePoint: () => {},
  isSavePolygonButton: false,
  setIsSavePolygonButton: () => {},
  imageShown: false,
  setImageShown: () => {},
  guideLinesShown: false,
  setGuideLinesShown: () => {},
  isResetTransform: false,
  setIsResetTransform: () => {},
  toolBoxShown: false,
  setToolBoxShown: () => {},
  currentScale: 1,
  setCurrentScale: () => {},
});

export const ToolboxContextProvider: React.FunctionComponent<ToolboxContextProps> = (
  props
) => {
  const [isDrawingButtonClicked, setIsDrawingButtonClicked] = useState(false);
  const [isSavePolygonButtonClicked, setIsSavePolygonButtonClicked] = useState(
    false
  );
  const [isEditButtonClicked, setIsEditButtonClicked] = useState(false);
  const [
    isDrawGuideLineButtonClicked,
    setIsDrawGuideLineButtonClicked,
  ] = useState(false);
  const [isUndoButtonClicked, setIsUndoButtonClicked] = useState(false);
  const [isRedoButtonClicked, setIsRedoButtonClicked] = useState(false);
  const [
    isAddInnerLineButtonClicked,
    setIsAddInnerLineButtonClicked,
  ] = useState(false);
  const [isMovingPolygon, setIsMovingPolygon] = useState<boolean>(false);
  const [isMovingGuideLine, setIsMovingGuideLine] = useState<boolean>(false);
  const [isMovingGuideLinePoint, setIsMovingGuideLinePoint] = useState<boolean>(
    false
  );
  const [isSavePolygonButton, setIsSavePolygonButton] = useState(true);
  const [imageShown, setImageShown] = useState<boolean>(true);
  const [guideLinesShown, setGuideLinesShown] = useState<boolean>(true);
  const [isResetTransform, setIsResetTransform] = useState<boolean>(false);
  const [toolBoxShown, setToolBoxShown] = useState<boolean>(true);
  const [currentScale, setCurrentScale] = useState<number>(1);

  const { children } = props;

  return (
    <ToolboxContext.Provider
      value={{
        isDrawingButtonClicked: isDrawingButtonClicked,
        setIsDrawingButtonClicked: setIsDrawingButtonClicked,
        isSavePolygonButtonClicked: isSavePolygonButtonClicked,
        setIsSavePolygonButtonClicked: setIsSavePolygonButtonClicked,
        isEditButtonClicked: isEditButtonClicked,
        setIsEditButtonClicked: setIsEditButtonClicked,
        isDrawGuideLineButtonClicked: isDrawGuideLineButtonClicked,
        setIsDrawGuideLineButtonClicked: setIsDrawGuideLineButtonClicked,
        isUndoButtonClicked: isUndoButtonClicked,
        setIsUndoButtonClicked: setIsUndoButtonClicked,
        isRedoButtonClicked: isRedoButtonClicked,
        setIsRedoButtonClicked: setIsRedoButtonClicked,
        isAddInnerLineButtonClicked: isAddInnerLineButtonClicked,
        setIsAddInnerLineButtonClicked: setIsAddInnerLineButtonClicked,
        isMovingPolygon: isMovingPolygon,
        setIsMovingPolygon: setIsMovingPolygon,
        isMovingGuideLine: isMovingGuideLine,
        setIsMovingGuideLine: setIsMovingGuideLine,
        isMovingGuideLinePoint: isMovingGuideLinePoint,
        setIsMovingGuideLinePoint: setIsMovingGuideLinePoint,
        isSavePolygonButton: isSavePolygonButton,
        setIsSavePolygonButton: setIsSavePolygonButton,
        imageShown: imageShown,
        setImageShown: setImageShown,
        guideLinesShown: guideLinesShown,
        setGuideLinesShown: setGuideLinesShown,
        isResetTransform: isResetTransform,
        setIsResetTransform: setIsResetTransform,
        toolBoxShown: toolBoxShown,
        setToolBoxShown: setToolBoxShown,
        currentScale: currentScale,
        setCurrentScale: setCurrentScale,
      }}
    >
      {children}
    </ToolboxContext.Provider>
  );
};
