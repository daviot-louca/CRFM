import { useContext } from "react";
import { MissionsContext } from "./MissionsContextValue";

export function useMission() {
  const context = useContext(MissionsContext);

  if (!context) {
    throw new Error("useMission doit être utilisé dans un MissionsProvider");
  }

  return context;
}
