export interface SerializedClock {
  accumulatedMs: number;
  lastStartedAt: number | null;
}

export class Clock {
  private lastStartedAt: number | null = null;
  private accumulatedMs = 0;

  start() {
    if (this.lastStartedAt !== null) return;
    this.lastStartedAt = Date.now();
  }

  pause() {
    if (this.lastStartedAt === null) return;

    this.accumulatedMs += Date.now() - this.lastStartedAt;
    this.lastStartedAt = null;
  }

  isRunning(): boolean {
    return this.lastStartedAt !== null;
  }

  getTotalMs(): number {
    if (this.lastStartedAt !== null) {
      return this.accumulatedMs + (Date.now() - this.lastStartedAt);
    }
    return this.accumulatedMs;
  }

  restore(accumulatedMs: number, lastStartedAt?: number) {
    this.accumulatedMs = accumulatedMs;
    this.lastStartedAt = lastStartedAt ?? null;
  }

  serialize(): SerializedClock {
    return {
      accumulatedMs: this.accumulatedMs,
      lastStartedAt: this.lastStartedAt
    };
  }
}
