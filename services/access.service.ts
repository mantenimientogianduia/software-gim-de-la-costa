export const DUPLICATE_ACCESS_WINDOW_MS = 8_000;

export function normalizeAccessIdentifier(identifier: string): string {
  return identifier.trim().replace(/\s+/g, '');
}

export function shouldIgnoreRepeatedAccess({
  identifier,
  lastIdentifier,
  nowMs,
  lastProcessedAtMs,
  windowMs = DUPLICATE_ACCESS_WINDOW_MS,
}: {
  identifier: string;
  lastIdentifier: string | null;
  nowMs: number;
  lastProcessedAtMs: number;
  windowMs?: number;
}): boolean {
  if (!identifier || !lastIdentifier) return false;
  return identifier === lastIdentifier && nowMs - lastProcessedAtMs < windowMs;
}
