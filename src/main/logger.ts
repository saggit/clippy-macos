import type { Logger } from "electron-log";

let _log: Logger = undefined;

function getElectronLog() {
  if (_log) {
    return _log;
  }

  return (_log = require("electron-log"));
}

export function getLogger(): Logger {
  return getElectronLog();
}
