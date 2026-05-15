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
    const mockAudio = { playFinish: vi.fn(), playBeep: vi.fn(), playTransition: vi.fn(), playCountdownBeep: vi.fn(), setAlarmType: vi.fn(), getAlarmType: vi.fn() as any };
    const service = new CountdownService(1000, undefined, mockAudio);
    service.start();
    vi.advanceTimersByTime(1000);
    expect(mockAudio.playFinish).toHaveBeenCalled();
  });

  it('should call playCountdownBeep in the last 3 seconds', () => {
    const mockAudio = { playFinish: vi.fn(), playBeep: vi.fn(), playTransition: vi.fn(), playCountdownBeep: vi.fn(), setAlarmType: vi.fn(), getAlarmType: vi.fn() as any };
    const service = new CountdownService(5000, undefined, mockAudio);
    service.start();
    
    // T = 5s
    vi.advanceTimersByTime(1000); // T -> 4s
    expect(mockAudio.playCountdownBeep).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // T -> 3s. Tick triggers beep for newSeconds=3
    expect(mockAudio.playCountdownBeep).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000); // T -> 2s
    expect(mockAudio.playCountdownBeep).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000); // T -> 1s
    expect(mockAudio.playCountdownBeep).toHaveBeenCalledTimes(3);

    vi.advanceTimersByTime(1000); // T -> 0s. Finish should trigger playFinish, not countdown beep for 0
    expect(mockAudio.playCountdownBeep).toHaveBeenCalledTimes(3);
    expect(mockAudio.playFinish).toHaveBeenCalled();
  });
});
