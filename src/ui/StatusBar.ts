import * as vscode from "vscode";

export class StatusBar {
  private _statusBarItem: vscode.StatusBarItem;

  constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  }

  public show() {
    const projectName = "MyProject";
    const elapsedTime = "1h 24m";

    this._statusBarItem.text = `${projectName} — ${elapsedTime}`;
    this._statusBarItem.tooltip = "CodeClock";
    this._statusBarItem.show();
  }

  public dispose() {
    this._statusBarItem.dispose();
  }
}
