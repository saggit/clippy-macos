import { app } from "electron";
import path from "path";
import fs from "fs";

import { ClippyDebugInfo, NestedRecord } from "../types/interfaces";
import { getLogger } from "./logger";

/**
 * Get debug information for the Llama binary
 *
 * @returns {Promise<ClippyDebugInfo>} The debug information
 */
export async function getClippyDebugInfo(): Promise<ClippyDebugInfo> {
  const debugInfo: ClippyDebugInfo = {
    platform: process.platform,
    arch: process.arch,
    versions: process.versions,
    llamaBinaries: await getNodeLlamaBinaries(),
    llamaBinaryFiles: {},
    checks: await getDebugChecks(),
    gpu: await app.getGPUInfo("complete"),
  };

  for (const llamaBinary of debugInfo.llamaBinaries) {
    debugInfo.llamaBinaryFiles[llamaBinary] =
      await getLlamaBinaryFiles(llamaBinary);
  }

  return debugInfo;
}

/**
 * Runs a series of checks to determine the state of the environment
 * and the availability of certain packages.
 *
 * @returns {Promise<Record<string, boolean | string>>} An object containing the results of the checks.
 *          Each key is the name of the check, and the value is either a boolean
 *          indicating success or failure, or a string describing the error.
 */
async function getDebugChecks(): Promise<Record<string, boolean | string>> {
  const checks: Record<string, boolean | string> = {};
  const checksToRun: Array<{
    name: string;
    check: () => Promise<boolean> | boolean;
  }> = [
    {
      name: "can-require-node-llama-cpp",
      check: async () => !!(await import("node-llama-cpp")),
    },
    {
      name: "can-see-node-modules-folder",
      check: () => !!getNodeModulesPath(),
    },
    {
      name: "can-see-node-llama-binaries",
      check: async () => (await getNodeLlamaBinaries()).length > 0,
    },
  ];

  for (const { name, check } of checksToRun) {
    try {
      const result = await check();
      checks[name] = !!result;
    } catch (error) {
      getLogger().log(`Error running check ${name}:`, error);
      checks[name] = `${error}`;
    }
  }

  return checks;
}

/**
 * Returns the folders inside the @node-llama-cpp directory
 *
 * @returns {Promise<Array<string>>} An array of folder names inside the @node-llama-cpp directory
 */
async function getNodeLlamaBinaries(): Promise<Array<string>> {
  const folders: Array<string> = [];

  try {
    const nodeModulesPath = getNodeModulesPath();
    const llamaCppPath = path.join(nodeModulesPath, "@node-llama-cpp");

    if (!fs.existsSync(llamaCppPath)) {
      throw new Error(`@node-llama-cpp directory not found at ${llamaCppPath}`);
    }

    for (const entry of await fs.promises.readdir(llamaCppPath)) {
      const entryPath = path.join(llamaCppPath, entry);
      if (fs.statSync(entryPath).isDirectory()) {
        folders.push(entry);
      }
    }

    return folders;
  } catch (error) {
    getLogger().warn("Error reading @node-llama-cpp directory:", error);
  }

  return folders;
}

/**
 * Returns the files inside the llama binary directory
 *
 * @param {string} llamaBinary - The name of the llama binary
 * @returns {Promise<NestedRecord<number>>} An object representing the files and their sizes
 */
async function getLlamaBinaryFiles(
  llamaBinary: string,
): Promise<NestedRecord<number>> {
  try {
    const nodeModulesPath = getNodeModulesPath();
    const llamaBinaryPath = path.join(
      nodeModulesPath,
      "@node-llama-cpp",
      llamaBinary,
    );

    if (!fs.existsSync(llamaBinaryPath)) {
      throw new Error(`Llama binary directory not found at ${llamaBinaryPath}`);
    }

    return readDirectory(llamaBinaryPath);
  } catch (error) {
    getLogger().warn("Error reading llama binary directory:", error);

    return {
      error: -1,
    };
  }
}

/**
 * UNSAFE HELPERS
 */

/**
 * Get the path to the node_modules directory
 *
 * @returns {string} The path to the node_modules directory
 * @throws {Error} If the node_modules directory cannot be found
 */
function getNodeModulesPath(): string {
  const nodeModulesPath = path.join(app.getAppPath(), "node_modules");

  if (!fs.existsSync(nodeModulesPath)) {
    throw new Error(`node_modules directory not found at ${nodeModulesPath}`);
  }

  return nodeModulesPath;
}

/**
 * Recursively reads a directory and returns its contents as a nested object.
 *
 * @param {string} dir - The directory to read.
 * @returns {Promise<NestedRecord<number>>} A promise that resolves to an object
 *          representing the directory contents.
 */
async function readDirectory(dir: string): Promise<NestedRecord<number>> {
  const result: NestedRecord<number> = {};

  try {
    for (const entry of await fs.promises.readdir(dir)) {
      const entryPath = path.join(dir, entry);
      const stat = await fs.promises.stat(entryPath);

      if (fs.statSync(entryPath).isDirectory()) {
        result[entry] = await readDirectory(entryPath);
      } else {
        result[entry] = stat.size;
      }
    }
  } catch (error) {
    getLogger().warn("Error reading directory:", error);

    result["error"] = -1;
  }

  return result;
}
