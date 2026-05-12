import { describe, expect, it } from 'vitest';
import { createAccessPassPayload, parseAccessIdentifier } from './access-pass';

describe('access pass payloads', () => {
  it('creates a structured QR payload from a DNI', () => {
    expect(createAccessPassPayload(' 12.345.678 ')).toBe(
      '{"type":"gym-access","version":1,"dni":"12345678"}'
    );
  });

  it('parses structured QR payloads and legacy plain DNI values', () => {
    expect(parseAccessIdentifier('{"type":"gym-access","version":1,"dni":"12345678"}')).toBe('12345678');
    expect(parseAccessIdentifier(' 12.345.678 ')).toBe('12345678');
  });

  it('rejects malformed or unrelated payloads', () => {
    expect(parseAccessIdentifier('{"type":"other","version":1,"dni":"12345678"}')).toBeNull();
    expect(parseAccessIdentifier('abc')).toBeNull();
  });
});
