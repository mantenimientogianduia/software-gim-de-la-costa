import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IntervalService, WorkoutPhase } from '@/services/IntervalService';

describe('IntervalService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct config', () => {
    const config = { rounds: 2, workMs: 1000, restMs: 500 };
    const service = new IntervalService(config);
    const state = service.getState();
    
    expect(state.phase).toBe(WorkoutPhase.PREPARE);
    expect(state.currentRound).toBe(1);
    expect(state.timeLeftMs).toBe(5000); // 5s prep by default
  });

  it('should transition from PREPARE to WORK', () => {
    const service = new IntervalService({ rounds: 1, workMs: 1000, restMs: 500 });
    service.start();
    
    vi.advanceTimersByTime(5000);
    const state = service.getState();
    expect(state.phase).toBe(WorkoutPhase.WORK);
    expect(state.timeLeftMs).toBe(1000);
  });

  it('should transition from WORK to REST', () => {
    const service = new IntervalService({ rounds: 2, workMs: 1000, restMs: 500 });
    service.start();
    vi.advanceTimersByTime(5000); // Prep
    vi.advanceTimersByTime(1000); // Work
    
    const state = service.getState();
    expect(state.phase).toBe(WorkoutPhase.REST);
    expect(state.timeLeftMs).toBe(500);
    expect(state.currentRound).toBe(1);
  });

  it('should increment round after REST', () => {
    const service = new IntervalService({ rounds: 2, workMs: 1000, restMs: 500 });
    service.start();
    vi.advanceTimersByTime(5000); // Prep
    vi.advanceTimersByTime(1000); // Work 1
    vi.advanceTimersByTime(500);  // Rest 1
    
    const state = service.getState();
    expect(state.phase).toBe(WorkoutPhase.WORK);
    expect(state.currentRound).toBe(2);
  });

  it('should finish after last round', () => {
    const service = new IntervalService({ rounds: 1, workMs: 1000, restMs: 500 });
    service.start();
    vi.advanceTimersByTime(5000); // Prep
    vi.advanceTimersByTime(1000); // Work
    vi.advanceTimersByTime(500);  // Rest
    
    const state = service.getState();
    expect(state.phase).toBe(WorkoutPhase.FINISHED);
  });
});
