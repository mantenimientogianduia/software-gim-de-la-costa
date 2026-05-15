import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioService } from '@/services/AudioService';

describe('AudioService', () => {
  let audioService: AudioService;
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: '',
      frequency: {
        setValueAtTime: vi.fn(),
      },
    };

    mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      currentTime: 0,
      destination: {},
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
    };

    // Mock global AudioContext
    (global as any).AudioContext = vi.fn().mockImplementation(function() {
      return mockAudioContext;
    });
    
    // Also mock for webkit
    (global as any).webkitAudioContext = (global as any).AudioContext;
    
    audioService = new AudioService();
  });

  it('should create an oscillator and gain node when playing a beep', () => {
    audioService.playBeep(440, 0.5);
    
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('should set frequency correctly', () => {
    audioService.playBeep(880, 0.5);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0);
  });

  it('should play traditional alarm by default', () => {
    const playBeepSpy = vi.spyOn(audioService, 'playBeep');
    audioService.playFinish();
    expect(playBeepSpy).toHaveBeenCalled();
    expect(audioService.getAlarmType()).toBe('traditional');
  });

  it('should respect selected alarm type', () => {
    const playBeepSpy = vi.spyOn(audioService, 'playBeep');
    audioService.setAlarmType('sustained' as any);
    audioService.playFinish();
    // Sustained uses triangle wave
    expect(playBeepSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 'triangle', expect.any(Number));
  });

  it('should support alarm_clock type', () => {
    const playBeepSpy = vi.spyOn(audioService, 'playBeep');
    audioService.setAlarmType('alarm_clock' as any);
    audioService.playFinish();
    
    // Advance timers to trigger the first beep
    vi.advanceTimersByTime(0);
    
    // Alarm clock uses sawtooth wave
    expect(playBeepSpy).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 'sawtooth', expect.any(Number));
  });

  it('should play countdown beep', () => {
    const playBeepSpy = vi.spyOn(audioService, 'playBeep');
    audioService.playCountdownBeep();
    expect(playBeepSpy).toHaveBeenCalledWith(440, 0.1, 'sine', 0.3);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
