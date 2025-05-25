import { app } from "electron";
import { Versions } from "../../types/interfaces";
import { getPackageJson } from "./getPackage";

/**
 * Get the versions of the application
 *
 * @returns {Versions} The versions of the application
 */
export async function getVersions(): Promise<Versions> {
  const versions = {
    ...process.versions,
    clippy: app.getVersion(),
    nodeLlamaCpp: await readPackageVersion("node-llama-cpp"),
  } as Versions;

  return versions;
}

async function readPackageVersion(packageName: string): Promise<string | null> {
  const packageJson = await getPackageJson(packageName);

  return packageJson?.version || null;
}
