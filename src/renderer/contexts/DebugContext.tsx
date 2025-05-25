import { createContext, useContext, useEffect, useState } from "react";

import { clippyApi } from "../clippyApi";
import { DebugState, EMPTY_DEBUG_STATE } from "../../debugState";

export const DebugContext = createContext<DebugState>(EMPTY_DEBUG_STATE);

export const DebugProvider = ({ children }: { children: React.ReactNode }) => {
  const [debugState, setDebugState] = useState<DebugState>(EMPTY_DEBUG_STATE);

  useEffect(() => {
    const fetchDebugState = async () => {
      const state = await clippyApi.getFullDebugState();
      setDebugState(state);
    };
    fetchDebugState();

    clippyApi.offDebugStateChanged();
    clippyApi.onDebugStateChanged((state) => {
      setDebugState(state);
    });

    return () => {
      clippyApi.offDebugStateChanged();
    };
  }, []);

  return (
    <DebugContext.Provider value={debugState}>{children}</DebugContext.Provider>
  );
};

export const useDebugState = () => {
  const context = useContext(DebugContext);

  if (!context) {
    throw new Error("useDebugState must be used within a DebugProvider");
  }

  return context;
};
