import { exec } from "node:child_process";

/**
 * Executes a command using exec and returns a promise that resolves with the output.
 *
 * @param cmd The command to execute.
 * @returns A promise that resolves with the command output.
 */
export function execPromise(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}
