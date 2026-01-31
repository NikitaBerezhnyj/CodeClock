import { Session } from "./Session";

export interface ProjectTime {
  workspaceId: string;
  totalMs: number;
  sessions: Session[];
}
