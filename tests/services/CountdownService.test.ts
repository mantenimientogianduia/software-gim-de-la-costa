import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownService } from '@/services/CountdownService';

describe('CountdownService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with set time', () => {
    const service = new CountdownService(60000); // 1 min
    expect(service.getState().timeLeftMs).toBe(60000);
  });

  it('should countdown towards zero', () => {
    const service = new CountdownService(1000);
    service.start();
    
    vi.advanceTimersByTime(500);
    expect(service.getState().timeLeftMs).toBe(500);
  });

  it('should stop at zero and mark as finished', () => {
    const service = new CountdownService(1000);
    service.start();
    
    vi.advanceTimersByTime(1100);
    const state = service.getState();
    expect(state.timeLeftMs).toBe(0);
    expect(state.isFinished).toBe(true);
    expect(state.isRunning).toBe(false);
  });

  it('should allow resetting', () => {
    const service = new CountdownService(1000);
    service.start();
    vi.advanceTimersByTime(500);
    service.reset();
    
    expect(service.getState().timeLeftMs).toBe(1000);
    expect(service.getState().isRunning).toBe(false);
  });

  it('should call playFinish on audio service when it ends', () => {
    const mockAudio = { playFinish: vi.fn(), playBeep: vi.fn(), playTransition: vi.fn() };
    const service = new CountdownService(1000, undefined, mockAudio);
    service.start();
    vi.advanceTimersByTime(1000);
    expect(mockAudio.playFinish).toHaveBeenCalled();
  });
});
