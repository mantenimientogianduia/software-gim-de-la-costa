import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerService } from '@/services/TimerService';

describe('TimerService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start at zero', () => {
    const timer = new TimerService();
    expect(timer.getElapsed()).toBe(0);
  });

  it('should track elapsed time after starting', () => {
    const timer = new TimerService();
    timer.start();
    
    vi.advanceTimersByTime(1500);
    expect(timer.getElapsed()).toBe(1500);
  });

  it('should pause and resume correctly', () => {
    const timer = new TimerService();
    timer.start();
    
    vi.advanceTimersByTime(1000);
    timer.pause();
    
    vi.advanceTimersByTime(500); // Should not count
    expect(timer.getElapsed()).toBe(1000);
    
    timer.start();
    vi.advanceTimersByTime(500);
    expect(timer.getElapsed()).toBe(1500);
  });

  it('should reset correctly', () => {
    const timer = new TimerService();
    timer.start();
    vi.advanceTimersByTime(1000);
    timer.reset();
    
    expect(timer.getElapsed()).toBe(0);
    expect(timer.getStatus().isRunning).toBe(false);
  });
});
