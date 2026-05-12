import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimerServiceImpl } from '../services/TimerService';

describe('TimerService', () => {
  let timerService: TimerServiceImpl;

  beforeEach(() => {
    timerService = new TimerServiceImpl();
  });

  it('should format milliseconds to MM:SS:CC', () => {
    expect(timerService.formatTime(0)).toBe('00:00:00');
    expect(timerService.formatTime(1000)).toBe('00:01:00');
    expect(timerService.formatTime(60000)).toBe('01:00:00');
    expect(timerService.formatTime(61550)).toBe('01:01:55');
  });

  it('should manage intervals for different modes', () => {
    // This is more of a logic check for state
    expect(timerService.getPresets()).toContainEqual(expect.objectContaining({ name: 'Tabata Standar' }));
  });
});
