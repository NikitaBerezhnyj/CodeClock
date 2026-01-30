import * as vscode from "vscode";

export type IdleCallback = () => void;

export class IdleService {
  private idleTimeoutMs: number;
  private lastActivity: number;
  private idleTimer?: NodeJS.Timeout;

  constructor(
    private onIdle: IdleCallback,
    idleMinutes = 30
  ) {
    this.idleTimeoutMs = idleMinutes * 60 * 1000;
    this.lastActivity = Date.now();
    this.subscribeToEvents();
    this.resetTimer();
  }

  private subscribeToEvents() {
    const events: vscode.Disposable[] = [
      vscode.window.onDidChangeTextEditorSelection(() => this.reset()),
      vscode.window.onDidChangeActiveTextEditor(() => this.reset()),
      vscode.workspace.onDidChangeTextDocument(() => this.reset()),
      vscode.window.onDidChangeWindowState(() => this.reset())
    ];

    events.forEach(event => vscode.Disposable.from(event));
  }

  private reset() {
    this.lastActivity = Date.now();
    this.resetTimer();
  }

  private resetTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const timeLeft = this.idleTimeoutMs - (Date.now() - this.lastActivity);
    this.idleTimer = setTimeout(() => {
      this.onIdle();
    }, timeLeft);
  }

  dispose() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }
}
