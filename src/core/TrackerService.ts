import { IdleService } from "./IdleService";
import { Clock } from "./Clock";
import { Notifications } from "../ui/Notification";
import { WorkspaceService } from "./WorkspaceService";
import { LocalStorage } from "../storage/LocalStorage";
import { ProjectTime } from "../model/ProjectTime";
import { Session } from "../model/Session";

type ActiveSession = {
  startedAt: number;
};

export class TrackerService {
  private clock = new Clock();
  private idleService?: IdleService;
  private currentWorkspaceId: string | null = null;
  private project: ProjectTime | null = null;
  private activeSession: ActiveSession | null = null;

  constructor(
    private storage: LocalStorage,
    private idleMinutes = 30
  ) {}

  private hasWorkspace(): boolean {
    return this.currentWorkspaceId !== null;
  }

  private loadProject(workspaceId: string) {
    const stored = this.storage.get<ProjectTime | null>(`project:${workspaceId}`, null);

    this.project = stored || {
      workspaceId,
      totalMs: 0,
      sessions: []
    };

    console.log("[CodeClock] Loaded project data:", JSON.stringify(this.project, null, 2));

    const activeSessionData = this.storage.get<ActiveSession | null>(
      `active-session:${workspaceId}`,
      null
    );

    if (activeSessionData) {
      const elapsedMs = Date.now() - activeSessionData.startedAt;

      console.log("[CodeClock] Found incomplete session from previous VS Code session");

      const restoredSession: Session = {
        id: crypto.randomUUID(),
        workspaceId,
        startedAt: activeSessionData.startedAt,
        endedAt: Date.now(),
        durationMs: elapsedMs
      };

      this.project.sessions.push(restoredSession);
      this.project.totalMs += elapsedMs;

      console.log("[CodeClock] Closed previous session:", {
        duration: Math.round(elapsedMs / 1000),
        seconds: "sec"
      });

      this.storage.set(`active-session:${workspaceId}`, null);
      this.storage.set(`project:${workspaceId}`, this.project);
    }
  }

  private async persistProject() {
    if (!this.project) {
      console.log("[CodeClock] No project to persist");
      return;
    }

    console.log("[CodeClock] Persisting project:", {
      totalMs: this.project.totalMs,
      sessionsCount: this.project.sessions.length,
      hasActiveSession: !!this.activeSession
    });

    await this.storage.set(`project:${this.project.workspaceId}`, this.project);

    if (this.activeSession) {
      await this.storage.set(`active-session:${this.project.workspaceId}`, {
        startedAt: this.activeSession.startedAt
      });
    } else {
      await this.storage.set(`active-session:${this.project.workspaceId}`, null);
    }

    console.log("[CodeClock] Persist complete");
  }

  private startSession() {
    if (this.activeSession) {
      console.log("[CodeClock] Session already active");
      return;
    }

    this.clock.reset();
    this.clock.start();

    this.activeSession = {
      startedAt: Date.now()
    };

    this.startIdleService();
    console.log(
      "[CodeClock] New session started at",
      new Date(this.activeSession.startedAt).toISOString()
    );
  }

  private async endSession() {
    if (!this.activeSession || !this.project) {
      console.log("[CodeClock] No active session to end");
      return;
    }

    this.clock.pause();
    const durationMs = this.clock.getTotalMs();
    const endedAt = Date.now();

    console.log("[CodeClock] Ending session:", {
      startedAt: new Date(this.activeSession.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      durationMs,
      durationSec: Math.round(durationMs / 1000)
    });

    if (durationMs > 0) {
      const session: Session = {
        id: crypto.randomUUID(),
        workspaceId: this.project.workspaceId,
        startedAt: this.activeSession.startedAt,
        endedAt,
        durationMs
      };

      this.project.sessions.push(session);
      this.project.totalMs += durationMs;

      console.log("[CodeClock] Session saved. Total sessions:", this.project.sessions.length);
    }

    this.activeSession = null;

    this.clock.reset();

    await this.persistProject();
  }

  async tryAutoStart() {
    const workspaceId = WorkspaceService.getCurrentWorkspaceId();
    if (!workspaceId) {
      console.log("[CodeClock] No workspace found for auto-start");
      return;
    }
    await this.switchWorkspace(workspaceId);
  }

  async switchWorkspace(newWorkspaceId: string) {
    if (this.currentWorkspaceId === newWorkspaceId) {
      console.log("[CodeClock] Already in this workspace");
      return;
    }

    if (this.currentWorkspaceId) {
      console.log("[CodeClock] Ending session in old workspace");
      await this.endSession();
    }

    this.currentWorkspaceId = newWorkspaceId;
    this.loadProject(newWorkspaceId);
    this.startSession();

    console.log("[CodeClock] Switched workspace to", newWorkspaceId);
  }

  async deactivateWorkspace() {
    if (!this.currentWorkspaceId) return;

    console.log("[CodeClock] Deactivating workspace");
    await this.endSession();

    this.currentWorkspaceId = null;
    this.project = null;
    this.idleService?.dispose();
    this.idleService = undefined;

    console.log("[CodeClock] Workspace deactivated");
  }

  private startIdleService() {
    this.idleService?.dispose();
    this.idleService = new IdleService(async () => {
      this.clock.pause();
      console.log("[CodeClock] Idle detected - timer paused");

      await Notifications.showInfo(
        "CodeClock: You've been inactive for a while. Are you still here?",
        {
          "I'm here": async () => {
            if (!this.hasWorkspace() || !this.activeSession) return;
            this.clock.start();
            this.startIdleService();
            console.log("[CodeClock] User returned - timer resumed");
          }
        }
      );
    }, this.idleMinutes);
  }

  start() {
    if (!this.hasWorkspace() || !this.activeSession) {
      Notifications.showInfo("CodeClock works only inside an opened workspace", {
        OK: () => {}
      });
      return;
    }

    if (!this.clock.isRunning()) {
      this.clock.start();
      this.startIdleService();
    }
  }

  stop() {
    if (!this.hasWorkspace()) return;
    this.clock.pause();
  }

  toggle() {
    if (!this.hasWorkspace()) return;
    if (this.clock.isRunning()) {
      this.stop();
    } else {
      this.start();
    }
  }

  async persist() {
    await this.persistProject();
  }

  isRunning(): boolean {
    return this.clock.isRunning();
  }

  getTotalMs(): number {
    return this.clock.getTotalMs();
  }

  getProjectTotalMs(): number {
    const sessionTime = this.clock.getTotalMs();
    return (this.project?.totalMs ?? 0) + sessionTime;
  }

  getSessions(): Session[] {
    return this.project?.sessions ?? [];
  }
}
