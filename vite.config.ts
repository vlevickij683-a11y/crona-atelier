import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, '.', 'VITE_').VITE_BASE_PATH || '/',
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'] },
}));
