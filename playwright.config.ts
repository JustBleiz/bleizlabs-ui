import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for @bleizlabs/ui library testing.
 *
 * E142 L1 — runtime testing pipeline per D25 + a11y-pipeline.md step 5-7.
 *
 * Two test tiers:
 * 1. `tests/smoke.spec.ts` — library-wide safety net (51 demo routes × axe-core).
 *    Runs on every push + PR. Exec time target ≤3 min.
 * 2. `components/*&#47;*&#47;tests/*.spec.ts` — per-component APG verification
 *    (keyboard + focus + aria + regression). Runs on push to main + on tag.
 *    Exec time target ≤15 min for full 23-component suite.
 *
 * Chromium-only per D-E142.7 (cross-browser matrix explicit out-of-scope).
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.ts', 'components/**/tests/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
