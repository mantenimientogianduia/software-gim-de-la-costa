import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // @ts-ignore
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': resolve(__dirname, './'),
    },
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
