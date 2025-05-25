import { createContext, useContext } from "react";

export type WindowContextType = {
  currentWindow: Window;
};

/**
 * Context for providing access to the correct window object
 */
export const WindowContext = createContext<WindowContextType>({
  currentWindow: window,
});

/**
 * Hook to access the correct window from the current React context
 *
 * @returns The appropriate window object for the current context
 */
export function useWindow(): WindowContextType {
  const { currentWindow } = useContext(WindowContext);

  if (!currentWindow) {
    throw new Error("useWindow must be used within a WindowProvider");
  }

  return { currentWindow };
}
