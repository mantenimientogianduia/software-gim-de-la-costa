const ACCESS_PASS_TYPE = 'gym-access';
const ACCESS_PASS_VERSION = 1;

function normalizeDni(value: string): string {
  return value.replace(/\D/g, '');
}

export function createAccessPassPayload(dni: string): string {
  return JSON.stringify({
    type: ACCESS_PASS_TYPE,
    version: ACCESS_PASS_VERSION,
    dni: normalizeDni(dni),
  });
}

export function parseAccessIdentifier(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (
      parsed?.type === ACCESS_PASS_TYPE &&
      parsed?.version === ACCESS_PASS_VERSION &&
      typeof parsed?.dni === 'string'
    ) {
      const dni = normalizeDni(parsed.dni);
      return dni || null;
    }
  } catch {
    const dni = normalizeDni(trimmed);
    return dni || null;
  }

  return null;
}
