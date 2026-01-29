import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private running = false;
  private timerSeconds = 0;
  private interval?: ReturnType<typeof setInterval>;
  private sessions: { date: string; duration: string }[] = [
    { date: "30.01.2026", duration: "1h 20m" },
    { date: "29.01.2026", duration: "45m" },
    { date: "15.01.2026", duration: "2h 5m" }
  ];

  constructor(private context: vscode.ExtensionContext) {}

  activate() {
    this.context.subscriptions.push(
      vscode.window.registerWebviewViewProvider("codeclock.sidebar", this)
    );

    this.context.subscriptions.push(
      vscode.commands.registerCommand("codeclock.toggleTimer", () => {
        this.toggleTimer();
      })
    );

    this.interval = setInterval(() => {
      if (this.running) {
        this.timerSeconds++;
        this.updateWebview();
      }
    }, 1000);
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: vscode.WebviewViewResolveContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent();

    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case "toggleTimer":
          this.toggleTimer();
          break;
      }
    });
  }

  private toggleTimer() {
    this.running = !this.running;
    this.updateWebview();
    vscode.window.showInformationMessage(this.running ? "Таймер запущено" : "Таймер зупинено");
  }

  private updateWebview() {
    if (this._view) {
      this._view.webview.postMessage({
        command: "updateTimer",
        time: this.formatTime(this.timerSeconds),
        running: this.running
      });
    }
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
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
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
