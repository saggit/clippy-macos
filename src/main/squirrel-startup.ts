import path from "path";
import { spawn } from "child_process";
import { app } from "electron";

// More or less the same code as electron-squirrel-startup, but with some
// changes to make it work with TypeScript.

function run(args: string[], done: () => void) {
  const updateExe = path.resolve(
    path.dirname(process.execPath),
    "..",
    "Update.exe",
  );

  spawn(updateExe, args, {
    detached: true,
  }).on("close", done);
}

function check() {
  if (process.platform === "win32") {
    const cmd = process.argv[1];
    const target = path.basename(process.execPath);

    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target + ""], app.quit);
      return true;
    }

    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target + ""], app.quit);
      return true;
    }

    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }

  return false;
}

export const shouldQuit = check();
