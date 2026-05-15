import { IAudioService } from './AudioService';

export enum WorkoutPhase {
  PREPARE = 'PREPARE',
  WORK = 'WORK',
  REST = 'REST',
  FINISHED = 'FINISHED'
}

export interface IntervalConfig {
  rounds: number;
  workMs: number;
  restMs: number;
  prepareMs?: number;
}

export interface IntervalState {
  phase: WorkoutPhase;
  currentRound: number;
  timeLeftMs: number;
  isRunning: boolean;
}

export class IntervalService {
  private config: IntervalConfig;
  private phase: WorkoutPhase = WorkoutPhase.PREPARE;
  private currentRound: number = 1;
  private timeLeftMs: number;
  private isRunning: boolean = false;
  private intervalId: any = null;
  private onUpdate?: (state: IntervalState) => void;
  private audioService?: IAudioService;

  constructor(config: IntervalConfig, onUpdate?: (state: IntervalState) => void, audioService?: IAudioService) {
    this.config = config;
    this.timeLeftMs = config.prepareMs ?? 5000;
    this.onUpdate = onUpdate;
    this.audioService = audioService;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 100);
    this.notify();
  }

  pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    this.notify();
  }

  reset(): void {
    this.pause();
    this.phase = WorkoutPhase.PREPARE;
    this.currentRound = 1;
    this.timeLeftMs = this.config.prepareMs ?? 5000;
    this.notify();
  }

  private tick(): void {
    const oldSeconds = Math.floor(this.timeLeftMs / 1000);
    this.timeLeftMs -= 100;
    const newSeconds = Math.floor(this.timeLeftMs / 1000);
    
    // Warning beeps in the last 3 seconds of a phase
    if (newSeconds < oldSeconds && newSeconds > 0 && newSeconds <= 3) {
      this.audioService?.playCountdownBeep();
    }

    if (this.timeLeftMs <= 0) {
      this.transition();
    }
    this.notify();
  }

  private transition(): void {
    switch (this.phase) {
      case WorkoutPhase.PREPARE:
        this.phase = WorkoutPhase.WORK;
        this.timeLeftMs = this.config.workMs;
        this.audioService?.playTransition();
        break;
      
      case WorkoutPhase.WORK:
        this.phase = WorkoutPhase.REST;
        this.timeLeftMs = this.config.restMs;
        this.audioService?.playTransition();
        break;

      case WorkoutPhase.REST:
        if (this.currentRound < this.config.rounds) {
          this.currentRound++;
          this.phase = WorkoutPhase.WORK;
          this.timeLeftMs = this.config.workMs;
          this.audioService?.playTransition();
        } else {
          this.phase = WorkoutPhase.FINISHED;
          this.timeLeftMs = 0;
          this.pause();
          this.audioService?.playFinish();
        }
        break;
      
      default:
        break;
    }
  }

  private notify(): void {
    if (this.onUpdate) {
      this.onUpdate(this.getState());
    }
  }

  getState(): IntervalState {
    return {
      phase: this.phase,
      currentRound: this.currentRound,
      timeLeftMs: Math.max(0, this.timeLeftMs),
      isRunning: this.isRunning
    };
  }

  cleanup(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
