import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TrackerService } from "../core/TrackerService";

type TrackerState = {
  time: string;
  running: boolean;
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _interval?: NodeJS.Timeout;

  private sessions: { date: string; duration: string }[] = [
    { date: "30.01.2026", duration: "1h 20m" },
    { date: "29.01.2026", duration: "45m" },
    { date: "15.01.2026", duration: "2h 5m" }
  ];

  constructor(
    private context: vscode.ExtensionContext,
    private tracker: TrackerService
  ) {}

  activate() {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider("codeclock.sidebar", this)
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand("codeclock.toggleTimer", () => {
        this.toggleTimer();
      })
    );

    this._interval = setInterval(() => {
      this.updateWebview();
    }, 1000);
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent();

    webviewView.webview.onDidReceiveMessage(message => {
      if (message.command === "toggleTimer") {
        this.toggleTimer();
      }
    });

    this.updateWebview();
  }

  private toggleTimer() {
    this.tracker.toggle();
    this.updateWebview();
  }

  private getState(): TrackerState {
    return {
      time: this.formatTime(this.tracker.getTotalMs()),
      running: this.tracker.isRunning()
    };
  }

  private updateWebview() {
    if (!this._view) return;

    this._view.webview.postMessage({
      command: "state",
      payload: this.getState()
    });
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);

    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");

    return `${h}:${m}:${s}`;
  }

  private getHtmlContent(): string {
    const totalDuration = "4h 10m";

    const sessionsList = this.sessions
      .map(
        session => `
        <div class="history-item">
            <span class="history-duration">${session.duration}</span>
            <span class="history-date">${session.date}</span>
        </div>`
      )
      .join("");

    const htmlPath = path.join(
      this.context.extensionPath,
      "src",
      "ui",
      "webview",
      "sidebar",
      "sidebar.html"
    );
    let html = fs.readFileSync(htmlPath, "utf8");

    const styleUri = this._view!.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, "src", "ui", "webview", "sidebar", "sidebar.css")
      )
    );
    const scriptUri = this._view!.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, "src", "ui", "webview", "sidebar", "sidebar.js")
      )
    );

    const nonce = this.getNonce();

    html = html
      .replace(/{{cspSource}}/g, this._view!.webview.cspSource)
      .replace(/{{nonce}}/g, nonce)
      .replace(/{{styleUri}}/g, styleUri.toString())
      .replace(/{{scriptUri}}/g, scriptUri.toString())
      .replace(/{{totalDuration}}/g, totalDuration)
      .replace(/{{sessionsList}}/g, sessionsList);

    return html;
  }

  private getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  dispose() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}
