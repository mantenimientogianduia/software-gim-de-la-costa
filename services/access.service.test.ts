import { describe, expect, it } from 'vitest';
import {
  ACCESS_SESSION_LIMIT_MS,
  formatAccessError,
  isSessionOverLimit,
  normalizeAccessIdentifier,
  shouldIgnoreRepeatedAccess,
} from './access.service';

describe('normalizeAccessIdentifier', () => {
  it('trims and removes spaces from DNI input', () => {
    expect(normalizeAccessIdentifier(' 44 162 364 ')).toBe('44162364');
  });
});

describe('shouldIgnoreRepeatedAccess', () => {
  it('ignores the same identifier inside the duplicate scan window', () => {
    expect(shouldIgnoreRepeatedAccess({
      identifier: '44162364',
      lastIdentifier: '44162364',
      nowMs: 10_000,
      lastProcessedAtMs: 4_500,
      windowMs: 8_000,
    })).toBe(true);
  });

  it('allows a different identifier immediately', () => {
    expect(shouldIgnoreRepeatedAccess({
      identifier: '11111111',
      lastIdentifier: '44162364',
      nowMs: 10_000,
      lastProcessedAtMs: 9_500,
      windowMs: 8_000,
    })).toBe(false);
  });
});

describe('isSessionOverLimit', () => {
  it('detects sessions longer than the configured limit', () => {
    expect(isSessionOverLimit({
      checkInAt: new Date('2026-05-27T10:00:00'),
      now: new Date('2026-05-27T13:01:00'),
      limitMs: ACCESS_SESSION_LIMIT_MS,
    })).toBe(true);
  });

  it('does not flag shorter sessions', () => {
    expect(isSessionOverLimit({
      checkInAt: new Date('2026-05-27T10:00:00'),
      now: new Date('2026-05-27T12:59:00'),
      limitMs: ACCESS_SESSION_LIMIT_MS,
    })).toBe(false);
  });
});

describe('formatAccessError', () => {
  it('returns a specific message for missing Firestore permissions', () => {
    expect(formatAccessError(new Error('Missing or insufficient permissions.'))).toContain('permisos');
  });
});
