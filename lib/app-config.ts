type EnvLike = Record<string, string | undefined>;

export function isDevToolsEnabled(env: EnvLike = process.env): boolean {
  return env.NODE_ENV !== 'production' && env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
}

export function getDevToolsEmail(env: EnvLike = process.env): string | null {
  const email = env.NEXT_PUBLIC_DEV_TOOLS_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function canUseDevTools(email: string | null | undefined, env: EnvLike = process.env): boolean {
  const configuredEmail = getDevToolsEmail(env);
  return isDevToolsEnabled(env) && Boolean(email) && email?.toLowerCase() === configuredEmail;
}
