import {
    createContext,
    useContext,
  } from "react";
  
  export const MissionsContext =
    createContext(null);
  
  export const useMission = () => {
    const context =
      useContext(MissionsContext);
  
    if (!context) {
      throw new Error(
        "useMission doit être utilisé à l'intérieur de MissionsProvider.",
      );
    }
  
    return context;
  };