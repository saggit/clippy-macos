import * as inspector from "node:inspector";
import { dialog } from "electron";
import { execPromise } from "./helpers/execPromise";
import { getLogger } from "./logger";

/**
 * Is the inspector enabled?
 *
 * @returns {boolean} True if the inspector is enabled, false otherwise.
 */
export function getIsInspectorEnabled(): boolean {
  return inspector.url() !== undefined;
}

export async function openInspector() {
  try {
    if (getIsInspectorEnabled()) {
      closeInspector();
    }

    inspector.open();
    await openChromeInspect();
  } catch (error) {
    getLogger().warn(
      "Debugger: Failed to enable main process debugger (node inspector)",
      error,
    );
  }
}

export function closeInspector() {
  try {
    inspector.close();
  } catch (error) {
    getLogger().warn(
      "Debugger: Failed to close main process debugger (node inspector)",
      error,
    );
  }
}

/**
 * Opens the Chrome DevTools inspector.
 *
 * @returns {Promise<void>} A promise that resolves when the inspector is opened.
 */
async function openChromeInspect(): Promise<void> {
  try {
    if (process.platform === "darwin") {
      await execPromise("open -a 'Google Chrome' chrome://inspect");
    } else if (process.platform === "win32") {
      await execPromise("start chrome chrome://inspect");
    } else if (process.platform === "linux") {
      await execPromise("xdg-open chrome://inspect");
    }
  } catch (error) {
    getLogger().warn("Debugger: Failed to open Chrome DevTools", error);

    await dialog.showMessageBox({
      title: "Inspector",
      message:
        "Inspector session is active. Please open Chrome DevTools (chrome://inspect) in a browser of your choice.",
    });
  }
}
