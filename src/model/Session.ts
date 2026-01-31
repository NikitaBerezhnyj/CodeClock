export interface Session {
  id: string;
  workspaceId: string;

  startedAt: number; // Date.now()
  endedAt: number; // Date.now()

  durationMs: number;
}
