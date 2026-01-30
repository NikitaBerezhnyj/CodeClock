import { Clock, SerializedClock } from "./Clock";
import { WorkspaceService } from "./WorkspaceService";
import { LocalStorage } from "../storage/LocalStorage";

export class TrackerService {
  private clock = new Clock();
  private currentWorkspaceId: string | null = null;

  constructor(private storage: LocalStorage) {}

  async tryAutoStart() {
    const workspaceId = WorkspaceService.getCurrentWorkspaceId();
    if (!workspaceId) return;

    this.currentWorkspaceId = workspaceId;

    const saved = this.storage.get<SerializedClock | null>(`project:${workspaceId}`, null);
    if (saved) {
      this.clock.restore(saved.accumulatedMs, saved.lastStartedAt ?? undefined);
    }

    this.clock.start();
    this.persist();
    console.log("[CodeClock] Timer started for", workspaceId);
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
