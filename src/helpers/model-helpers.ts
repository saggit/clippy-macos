import { ManagedModel, ModelState } from "../models";

export function isModelDownloading(model?: ManagedModel) {
  return (
    model && !!model.downloadState && model.downloadState.state !== "completed"
  );
}

export function isModelReady(model?: ManagedModel) {
  return (
    model &&
    model.downloaded &&
    (!model.downloadState || model.downloadState.state === "completed")
  );
}

export function areAnyModelsReadyOrDownloading(models: ModelState) {
  return Object.values(models).some((model) => {
    return model.downloaded || isModelDownloading(model);
  });
}
