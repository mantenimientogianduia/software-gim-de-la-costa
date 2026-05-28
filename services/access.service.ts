export const DUPLICATE_ACCESS_WINDOW_MS = 8_000;
export const ACCESS_SESSION_LIMIT_MS = 3 * 60 * 60 * 1000;

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

export function toAccessDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return null;
}

export function isSessionOverLimit({
  checkInAt,
  now = new Date(),
  limitMs = ACCESS_SESSION_LIMIT_MS,
}: {
  checkInAt: any;
  now?: Date;
  limitMs?: number;
}): boolean {
  const checkInDate = toAccessDate(checkInAt);
  if (!checkInDate) return false;
  return now.getTime() - checkInDate.getTime() > limitMs;
}

export function formatAccessError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  const lower = message.toLowerCase();

  if (lower.includes('permission') || lower.includes('permis')) {
    return 'Error de permisos en Firebase. Revisa que el usuario tenga rol admin/profesor y email verificado.';
  }

  if (lower.includes('index')) {
    return 'Falta un indice de Firestore para consultar asistencias. Revisa la consola de Firebase.';
  }

  return 'Error al procesar acceso. Revisa consola o permisos de Firebase.';
}
