import { Clock, SerializedClock } from "./Clock";
import { WorkspaceService } from "./WorkspaceService";
import { LocalStorage } from "../storage/LocalStorage";
import * as vscode from "vscode";
import { IdleService } from "./IdleService";

export class TrackerService {
  private clock = new Clock();
  private currentWorkspaceId: string | null = null;
  private idleService?: IdleService;

  constructor(
    private storage: LocalStorage,
    private idleMinutes = 1
  ) {}

  async tryAutoStart() {
    const workspaceId = WorkspaceService.getCurrentWorkspaceId();
    if (!workspaceId) return;

    this.currentWorkspaceId = workspaceId;

    const saved = this.storage.get<SerializedClock | null>(`project:${workspaceId}`, null);
    if (saved) {
      this.clock.restore(saved.accumulatedMs, saved.lastStartedAt ?? undefined);
    }

    this.clock.start();
    this.startIdleService();
    this.persist();
    console.log("[CodeClock] Timer started for", workspaceId);
  }

  private startIdleService() {
    this.idleService?.dispose();
    this.idleService = new IdleService(async () => {
      this.clock.pause();
      await this.persist();

      const resume = "I'm here";
      vscode.window
        .showInformationMessage("CodeClock: You are inactive. The timer has been paused.", resume)
        .then(selection => {
          if (selection === resume) {
            this.clock.start();
            this.startIdleService();
          }
        });
    }, this.idleMinutes);
  }

  async stop() {
    this.clock.pause();
    await this.persist();
  }

  async persist() {
    if (!this.currentWorkspaceId) return;
    await this.storage.set(`project:${this.currentWorkspaceId}`, this.clock.serialize());
  }

  start() {
    this.clock.start();
    this.startIdleService();
  }

  pause() {
    this.clock.pause();
    this.persist();
  }

  toggle() {
    if (this.clock.isRunning()) {
      this.pause();
    } else {
      this.start();
    }
  }

  isRunning(): boolean {
    return this.clock.isRunning();
  }

  getTotalMs() {
    return this.clock.getTotalMs();
  }
}
