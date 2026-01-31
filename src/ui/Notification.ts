import * as vscode from "vscode";

export class Notifications {
  static async showInfo(message: string, actions?: Record<string, () => void | Promise<void>>) {
    const buttons = actions ? Object.keys(actions) : [];

    const selection = await vscode.window.showInformationMessage(message, ...buttons);

    if (!selection || !actions) return;

    const action = actions[selection];
    if (action) {
      await action();
    }
  }
}
