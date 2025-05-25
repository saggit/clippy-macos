import fs from "fs";
import path from "path";

import { getLogger } from "../logger";
import { app } from "electron";

export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  repository?: {
    type: string;
    url: string;
  };
  author?: string;
  license?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Get the path to a package in the node_modules directory
 *
 * @param packageName The name of the package
 * @returns {string | null} The path to the package or null if not found
 */
export function getPackagePath(packageName: string): string | null {
  try {
    const packagePath = path.join(
      app.getAppPath(),
      "node_modules",
      packageName,
    );

    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package not found at ${packagePath}`);
    }

    return packagePath;
  } catch (error) {
    getLogger().warn(`Failed to read package path for ${packageName}`, error);
  }

  return null;
}

/**
 * Get the package.json file for a given package
 *
 * @param packageName The name of the package
 * @returns {Promise<PackageJson | null>} The package.json file or null if not found
 */
export async function getPackageJson(
  packageName: string,
): Promise<PackageJson | null> {
  let result: PackageJson | null = null;

  try {
    const packagePath = getPackagePath(packageName);

    if (!packagePath) {
      throw new Error(`Could not find package path for ${packageName}`);
    }

    const packageJsonPath = path.join(packagePath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      const packageJsonString = await fs.promises.readFile(
        packageJsonPath,
        "utf-8",
      );
      result = JSON.parse(packageJsonString);
    } else {
      throw new Error(
        `Could not find package.json for ${packageName} in ${packageJsonPath}`,
      );
    }
  } catch (error) {
    getLogger().warn(`Failed to read package for ${packageName}`, error);
  }

  return result;
}
