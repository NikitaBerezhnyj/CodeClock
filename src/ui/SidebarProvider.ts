import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TrackerService } from "../core/TrackerService";
import { Session } from "../model/Session";

type TrackerState = {
  time: string;
  running: boolean;
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _interval?: NodeJS.Timeout;

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

  private getSessionsHtml(): string {
    const sessions: Session[] = this.tracker.getSessions();

    if (sessions.length === 0) {
      return '<div class="history-empty">No sessions yet</div>';
    }

    return sessions
      .map(s => {
        const startDate = new Date(s.startedAt);

        const day = startDate.getDate().toString().padStart(2, "0");
        const month = (startDate.getMonth() + 1).toString().padStart(2, "0");
        const year = startDate.getFullYear();

        const hours = startDate.getHours().toString().padStart(2, "0");
        const minutes = startDate.getMinutes().toString().padStart(2, "0");

        const formattedDate = `${day}.${month}.${year} - ${hours}:${minutes}`;
        const duration = this.formatTimeShort(s.durationMs);

        return `
        <div class="history-item">
            <span class="history-date">${formattedDate}</span>
            <span class="history-duration">${duration}</span>
        </div>`;
      })
      .reverse()
      .join("");
  }

  private getTotalDuration(): string {
    const totalMs = this.tracker.getProjectTotalMs();
    return this.formatTotalTime(totalMs);
  }

  private updateWebview() {
    if (!this._view) return;

    this._view.webview.postMessage({
      command: "state",
      payload: this.getState()
    });

    this._view.webview.postMessage({
      command: "updateHistory",
      payload: {
        totalDuration: this.getTotalDuration(),
        sessionsList: this.getSessionsHtml()
      }
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

  private formatTimeShort(ms: number): string {
    const totalMinutes = Math.floor(ms / 1000 / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    const s = Math.floor((ms / 1000) % 60)
      .toString()
      .padStart(2, "0");

    return `${h}h ${m}m ${s}s`;
  }

  private formatTotalTime(ms: number): string {
    const totalMinutes = Math.floor(ms / 1000 / 60);

    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const totalDays = Math.floor(totalHours / 24);
    const days = totalDays % 30;
    const totalMonths = Math.floor(totalDays / 30);
    const months = totalMonths % 12;
    const years = Math.floor(totalMonths / 12);

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    const display = parts.join(" ") || "0m";

    const totalHoursExact = Math.floor(totalMinutes / 60);
    const tooltip = `${totalHoursExact}h ${minutes}m`;

    return `<span title="${tooltip}">${display}</span>`;
  }

  private getHtmlContent(): string {
    const sessionsList = this.getSessionsHtml();
    const totalDuration = this.getTotalDuration();

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
    if (this._interval) clearInterval(this._interval);
  }
}
