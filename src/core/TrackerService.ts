import { IdleService } from "./IdleService";
import { Clock, SerializedClock } from "./Clock";
import { Notifications } from "../ui/Notification";
import { WorkspaceService } from "./WorkspaceService";
import { LocalStorage } from "../storage/LocalStorage";

export class TrackerService {
  private clock = new Clock();
  private currentWorkspaceId: string | null = null;
  private idleService?: IdleService;

  constructor(
    private storage: LocalStorage,
    private idleMinutes = 30
  ) {}

  private hasWorkspace(): boolean {
    return this.currentWorkspaceId !== null;
  }

  async tryAutoStart() {
    const workspaceId = WorkspaceService.getCurrentWorkspaceId();
    if (!workspaceId) return;

    await this.switchWorkspace(workspaceId);
  }

  async switchWorkspace(newWorkspaceId: string) {
    if (this.currentWorkspaceId === newWorkspaceId) {
      return;
    }

    if (this.currentWorkspaceId) {
      this.clock.pause();
      await this.storage.set(`project:${this.currentWorkspaceId}`, this.clock.serialize());
    }

    this.clock.reset();

    const saved = this.storage.get<SerializedClock | null>(`project:${newWorkspaceId}`, null);

    if (saved) {
      this.clock.restore(saved.accumulatedMs, saved.lastStartedAt ?? undefined);
    }

    this.currentWorkspaceId = newWorkspaceId;
    this.clock.start();
    this.startIdleService();

    console.log("[CodeClock] Switched workspace to", newWorkspaceId);
  }

  async deactivateWorkspace() {
    if (!this.currentWorkspaceId) return;

    this.clock.pause();
    await this.persist();

    this.currentWorkspaceId = null;
    this.idleService?.dispose();
    this.idleService = undefined;

    console.log("[CodeClock] Workspace deactivated, timer stopped");
  }

  private startIdleService() {
    this.idleService?.dispose();
    this.idleService = new IdleService(async () => {
      this.pause();

      await Notifications.showInfo("CodeClock: You are inactive. The timer has been paused.", {
        "I'm here": async () => {
          if (!this.hasWorkspace()) return;

          this.clock.start();
          this.startIdleService();
        }
      });
    }, this.idleMinutes);
  }

  start() {
    if (!this.hasWorkspace()) {
      console.warn("[CodeClock] Cannot start timer: no active workspace");
      Notifications.showInfo("CodeClock works only inside an opened workspace", {
        OK: () => {}
      });
      return;
    }

    this.clock.start();
    this.startIdleService();
  }

  async stop() {
    if (!this.hasWorkspace()) {
      console.warn("[CodeClock] Cannot stop timer: no active workspace");
      Notifications.showInfo("CodeClock works only inside an opened workspace", {
        OK: () => {}
      });
      return;
    }

    this.pause();
  }

  pause() {
    this.clock.pause();
    this.persist();
  }

  toggle() {
    if (!this.hasWorkspace()) {
      console.warn("[CodeClock] Cannot toggle timer: no active workspace");
      Notifications.showInfo("CodeClock works only inside an opened workspace", {
        OK: () => {}
      });
      return;
    }

    if (this.clock.isRunning()) {
      this.pause();
    } else {
      this.start();
    }
  }

  async persist() {
    if (!this.currentWorkspaceId) return;
    await this.storage.set(`project:${this.currentWorkspaceId}`, this.clock.serialize());
  }

  isRunning(): boolean {
    return this.clock.isRunning();
  }

  getTotalMs() {
    return this.clock.getTotalMs();
  }
}
