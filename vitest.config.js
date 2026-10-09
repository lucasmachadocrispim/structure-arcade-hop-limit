import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.js'],
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/core/**/*.js'],
      exclude: ['src/core/concepts.js', 'src/core/features.js'],
      thresholds: {
        'src/core/**/*.js': { lines: 70, functions: 70, statements: 70, branches: 60 },
      },
    },
  },
});