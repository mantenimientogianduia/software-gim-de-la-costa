export interface TimerStatus {
  isRunning: boolean;
  elapsedMs: number;
}

export class TimerService {
  private startTime: number | null = null;
  private accumulatedMs: number = 0;
  private isRunning: boolean = false;

  start(): void {
    if (this.isRunning) return;
    this.startTime = Date.now();
    this.isRunning = true;
  }

  pause(): void {
    if (!this.isRunning || this.startTime === null) return;
    this.accumulatedMs += Date.now() - this.startTime;
    this.startTime = null;
    this.isRunning = false;
  }

  reset(): void {
    this.startTime = null;
    this.accumulatedMs = 0;
    this.isRunning = false;
  }

  getElapsed(): number {
    if (!this.isRunning || this.startTime === null) {
      return this.accumulatedMs;
    }
    return this.accumulatedMs + (Date.now() - this.startTime);
  }

  getStatus(): TimerStatus {
    return {
      isRunning: this.isRunning,
      elapsedMs: this.getElapsed(),
    };
  }
}
