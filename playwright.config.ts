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
 *
 * E148: `BASE_URL` env var overrides the default (:3000) — use when another
 * project already owns :3000 and you want to run bleizlabs-ui tests against
 * a secondary port (e.g., `BASE_URL=http://localhost:3100 npx playwright test`).
 * Skips the bundled webServer when set so callers manage the server lifecycle.
 */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const SKIP_WEB_SERVER = !!process.env.BASE_URL;

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
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Disable keyframe animations during tests. Every Phase 10 component ships
    // a `prefers-reduced-motion: reduce` block that flattens its entrance
    // animation; emulating it globally eliminates animation-induced
    // actionability stability delays that race short timers like the
    // HoverCard 300ms closeDelay window. Best practice for hover-/pointer-heavy
    // suites — no test logic change required.
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Smoke runs against the PRODUCTION build (`next build` + `next start`), not
  // `next dev`. Rationale: Next.js dev emits React hydration-mismatch warnings
  // via `pageerror` for Slot/Turbopack edge cases that never reach consumers
  // of a published tarball. Production-built HTML matches consumer reality.
  // Local re-runs skip the build when a server is already up on :3000.
  webServer: SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
