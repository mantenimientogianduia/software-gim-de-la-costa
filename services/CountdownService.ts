import { IAudioService } from './AudioService';

export interface CountdownState {
  timeLeftMs: number;
  isRunning: boolean;
  isFinished: boolean;
  totalTimeMs: number;
}

export class CountdownService {
  private timeLeftMs: number;
  private totalTimeMs: number;
  private isRunning: boolean = false;
  private isFinished: boolean = false;
  private intervalId: any = null;
  private onUpdate?: (state: CountdownState) => void;
  private audioService?: IAudioService;

  constructor(initialMs: number, onUpdate?: (state: CountdownState) => void, audioService?: IAudioService) {
    this.timeLeftMs = initialMs;
    this.totalTimeMs = initialMs;
    this.onUpdate = onUpdate;
    this.audioService = audioService;
  }

  start(): void {
    if (this.isRunning || this.isFinished) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 100);
    this.notify();
  }

  pause(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  reset(): void {
    this.pause();
    this.timeLeftMs = this.totalTimeMs;
    this.isFinished = false;
    this.notify();
  }

  updateInitialTime(ms: number): void {
    this.totalTimeMs = ms;
    this.reset();
  }

  private tick(): void {
    this.timeLeftMs -= 100;
    
    if (this.timeLeftMs <= 0) {
      this.timeLeftMs = 0;
      this.isFinished = true;
      this.pause();
      this.audioService?.playFinish();
    }
    
    this.notify();
  }

  private notify(): void {
    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  getState(): CountdownState {
    return {
      timeLeftMs: Math.max(0, this.timeLeftMs),
      isRunning: this.isRunning,
      isFinished: this.isFinished,
      totalTimeMs: this.totalTimeMs
    };
  }

  cleanup(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
