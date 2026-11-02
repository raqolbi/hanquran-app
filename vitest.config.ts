import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Default node (cepat). Test yang butuh DOM menandai diri dengan
    // `// @vitest-environment jsdom` di baris pertama.
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
