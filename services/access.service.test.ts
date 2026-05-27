import { describe, expect, it } from 'vitest';
import { normalizeAccessIdentifier, shouldIgnoreRepeatedAccess } from './access.service';

describe('normalizeAccessIdentifier', () => {
  it('trims and removes spaces from DNI input', () => {
    expect(normalizeAccessIdentifier(' 42 769 468 ')).toBe('42769468');
  });
});

describe('shouldIgnoreRepeatedAccess', () => {
  it('ignores the same identifier inside the duplicate scan window', () => {
    expect(shouldIgnoreRepeatedAccess({
      identifier: '42769468',
      lastIdentifier: '42769468',
      nowMs: 10_000,
      lastProcessedAtMs: 4_500,
      windowMs: 8_000,
    })).toBe(true);
  });

  it('allows the same identifier after the duplicate scan window', () => {
    expect(shouldIgnoreRepeatedAccess({
      identifier: '42769468',
      lastIdentifier: '42769468',
      nowMs: 15_000,
      lastProcessedAtMs: 4_500,
      windowMs: 8_000,
    })).toBe(false);
  });

  it('allows a different identifier immediately', () => {
    expect(shouldIgnoreRepeatedAccess({
      identifier: '11111111',
      lastIdentifier: '42769468',
      nowMs: 10_000,
      lastProcessedAtMs: 9_500,
      windowMs: 8_000,
    })).toBe(false);
  });
});
