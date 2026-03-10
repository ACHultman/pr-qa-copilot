import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  use: {
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
});
