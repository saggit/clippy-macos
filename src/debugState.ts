export interface DebugState {
  simulateDownload?: boolean;
  simulateLoadModel?: boolean;
  simulateNoModelsDownloaded?: boolean;
  openDevToolsOnStart?: boolean;
  enableDragDebug?: boolean;
}

export const EMPTY_DEBUG_STATE: DebugState = {
  simulateDownload: false,
  simulateLoadModel: false,
  simulateNoModelsDownloaded: false,
  openDevToolsOnStart: false,
  enableDragDebug: false,
};
