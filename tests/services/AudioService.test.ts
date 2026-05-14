import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioService } from '@/services/AudioService';

describe('AudioService', () => {
  let audioService: AudioService;
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
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
});
