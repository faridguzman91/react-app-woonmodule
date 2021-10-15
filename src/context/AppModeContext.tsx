import React, { useState } from "react";
type MyProps = {};

export enum AppMode {
  edit = 0,
  view = 1,
}

export const AppModeContext = React.createContext<{
  appMode: AppMode;
  setAppMode: (v: AppMode) => void;
}>({ appMode: AppMode.edit, setAppMode: () => {} });

export const ContextProvider: React.FunctionComponent<MyProps> = (props) => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.edit);
  const { children } = props;

  return (
    <AppModeContext.Provider
      value={{ appMode: appMode, setAppMode: setAppMode }}
    >
      {children}
    </AppModeContext.Provider>
  );
};
