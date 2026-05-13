import { describe, it, expect } from 'vitest';
import { formatMs } from '@/lib/utils/time';

describe('formatMs', () => {
  it('should format milliseconds to MM:SS', () => {
    expect(formatMs(1000)).toBe('00:01');
    expect(formatMs(60000)).toBe('01:00');
    expect(formatMs(0)).toBe('00:00');
  });

  it('should format with milliseconds MM:SS.CC', () => {
    expect(formatMs(1500, true)).toBe('00:01.50');
    expect(formatMs(61230, true)).toBe('01:01.23');
  });

  it('should handle hours HH:MM:SS', () => {
    expect(formatMs(3600000)).toBe('01:00:00');
    expect(formatMs(3661000)).toBe('01:01:01');
  });
});
