import { describe, expect, it } from 'vitest';
import { canUseDevTools, getDevToolsEmail, isDevToolsEnabled } from './app-config';

describe('app config helpers', () => {
  it('keeps development tools disabled unless explicitly enabled outside production', () => {
    expect(isDevToolsEnabled({ NODE_ENV: 'development' })).toBe(false);
    expect(isDevToolsEnabled({ NODE_ENV: 'production', NEXT_PUBLIC_ENABLE_DEV_TOOLS: 'true' })).toBe(false);
    expect(isDevToolsEnabled({ NODE_ENV: 'development', NEXT_PUBLIC_ENABLE_DEV_TOOLS: 'true' })).toBe(true);
  });

  it('requires an explicit matching email to use development tools', () => {
    const env = {
      NODE_ENV: 'development',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: 'true',
      NEXT_PUBLIC_DEV_TOOLS_EMAIL: 'admin@gym.test',
    };

    expect(getDevToolsEmail(env)).toBe('admin@gym.test');
    expect(canUseDevTools('admin@gym.test', env)).toBe(true);
    expect(canUseDevTools('other@gym.test', env)).toBe(false);
    expect(canUseDevTools(null, env)).toBe(false);
  });
});
