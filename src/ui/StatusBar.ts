import * as vscode from "vscode";
import { TrackerService } from "../core/TrackerService";
import { WorkspaceService } from "../core/WorkspaceService";

export class StatusBar {
  private _statusBarItem: vscode.StatusBarItem;
  private _interval?: NodeJS.Timeout;
  private _lastRenderedMinute: number | null = null;

  constructor(private tracker: TrackerService) {
    this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this._statusBarItem.command = "codeclock.openSidebar";
  }

  public show() {
    this.update(true);
    this._statusBarItem.tooltip = "CodeClock";
    this._statusBarItem.show();

    this._interval = setInterval(() => {
      this.update();
    }, 1000);
  }

  private update(force = false) {
    const totalMs = this.tracker.getTotalMs();
    const totalMinutes = Math.floor(totalMs / 60000);

    if (!force && totalMinutes === this._lastRenderedMinute) {
      return;
    }

    this._lastRenderedMinute = totalMinutes;

    const projectName = WorkspaceService.getWorkspaceName() ?? "No project";
    const elapsedTime = this.formatElapsedTime(totalMs);

    this._statusBarItem.text = `${projectName} — ${elapsedTime}`;
  }

  private formatElapsedTime(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  public dispose() {
    if (this._interval) {
      clearInterval(this._interval);
    }
    this._statusBarItem.dispose();
  }
}
