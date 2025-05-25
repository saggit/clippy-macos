import { DownloadItem } from "electron";
import { ManagedModel } from "../models";
import { getLogger } from "./logger";

/**
 * Mock implementation of Electron's DownloadItem for download simulation
 */
export class MockDownloadItem implements Partial<DownloadItem> {
  private _receivedBytes = 0;
  private _totalBytes: number;
  private _startTime: number;
  private _savePath: string;
  private _state: "progressing" | "completed" | "cancelled" | "interrupted" =
    "progressing";
  private _intervalId: NodeJS.Timeout;
  private _name: string;

  constructor(model: ManagedModel, onComplete: () => void) {
    this._name = model.name;
    this._totalBytes = model.size * 1024 * 1024; // Convert MB to bytes
    this._startTime = Date.now();
    this._savePath = model.path;

    // Simulation parameters
    const downloadDuration = 10 * 1000; // 10 seconds
    const updateInterval = 100; // Update every 100ms

    getLogger().info(
      `MockDownloadItem: Simulating download for model: ${model.name} (will take 10 seconds)`,
    );

    // Simulate download progress
    this._intervalId = setInterval(() => {
      const elapsedTime = Date.now() - this._startTime;
      const progress = Math.min(elapsedTime / downloadDuration, 1);

      this._receivedBytes = Math.floor(this._totalBytes * progress);

      // Complete download after 10 seconds
      if (progress >= 1) {
        clearInterval(this._intervalId);
        this._state = "completed";
        getLogger().info(
          `MockDownloadItem: Simulated download completed for model: ${model.name}`,
        );
        onComplete();
      }
    }, updateInterval);
  }

  public getTotalBytes(): number {
    return this._totalBytes;
  }

  public getReceivedBytes(): number {
    return this._receivedBytes;
  }

  public getPercentComplete(): number {
    return (this._receivedBytes / this._totalBytes) * 100;
  }

  public getStartTime(): number {
    return this._startTime;
  }

  public getSavePath(): string {
    return this._savePath;
  }

  public getCurrentBytesPerSecond(): number {
    return this._totalBytes / 10; // Constant rate over 10 seconds
  }

  public getState(): "progressing" | "completed" | "cancelled" | "interrupted" {
    return this._state;
  }

  public cancel(): void {
    clearInterval(this._intervalId);
    this._state = "cancelled";
    getLogger().info(
      `MockDownloadItem: Cancelled download for model: ${this._name}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setSavePath(_path: string): void {
    // No-op for mock
  }
}
