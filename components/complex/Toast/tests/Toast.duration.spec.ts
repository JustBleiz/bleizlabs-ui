/**
 * Toast duration + pause-timing spec — TST-R18..R21 (E02 audit remediation).
 *
 * Pins the two store-level timing bugs fixed in E02:
 * - `<Toaster duration>` was destructured and voided (silent no-op) — the
 *   4000ms default in toastStore.upsert always won (TST-R18).
 * - A toast created/updated while globally paused (hover over the stack) got
 *   `remainingOnPause: null`; resumeAllTimers skipped null — the toast never
 *   auto-dismissed (TST-R19 — covers paused creates/updates with FINITE
 *   duration; NOTE: default string-form `toast.promise` resolution inherits
 *   `duration: Infinity` from its loading state (`partial ?? existing ?? global`
 *   chain — pre-existing semantic, untouched here), so promise toasts stay
 *   sticky regardless of pause — follow-up decision logged in the work-unit
 *   devlog).
 * Plus the per-toast override contract (TST-R20) and the new persistent
 * polite announcer (TST-R21).
 *
 * Timing strategy: real time with generous bounded windows (1s global vs
 * 2s upper bound) — never asserts "still visible at exactly X ms".
 */

import { test, expect } from '@playwright/test';

test.describe('Toast — duration + pause timing (E02)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/toast');
  });

  test('TST-R18 — global default duration is honored (pre-fix: silent no-op)', async ({ page }) => {
    await page.getByRole('button', { name: 'duration: 1000 ms' }).click();
    await page.getByRole('button', { name: 'toast.success()' }).click();
    // Role-scoped — getByText would also match the role-less announcer span.
    const toast = page.getByRole('status').filter({ hasText: 'Saved successfully' });
    await expect(toast).toBeVisible();
    // Pre-fix the toast lived 4000ms — this 2s upper bound failed.
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test('TST-R19 — toast created during pause auto-dismisses after resume', async ({ page }) => {
    await page.getByRole('button', { name: 'duration: 1000 ms' }).click();
    // Anchor = STICKY error toast (duration: Infinity) — hovering it pauses
    // all timers globally and the anchor itself can never expire, so the
    // pause window has no flake budget (a finite anchor could expire during
    // the click→hover gaps on slow CI).
    await page.getByRole('button', { name: 'Show sticky error' }).click();
    const anchor = page.getByRole('alert').filter({ hasText: 'Connection lost' });
    await expect(anchor).toBeVisible();
    await anchor.hover();
    // Schedule toast B to spawn in 1.5s while we keep hovering (paused).
    await page.getByRole('button', { name: 'Spawn delayed (1.5s)' }).hover();
    await page.getByRole('button', { name: 'Spawn delayed (1.5s)' }).click();
    await anchor.hover();
    const toastB = page.getByRole('status').filter({ hasText: 'Delayed toast' });
    await expect(toastB).toBeVisible({ timeout: 3000 });
    // Unhover — resume. Pre-fix toast B was permanently sticky
    // (remainingOnPause: null skipped by resumeAllTimers).
    await page.mouse.move(0, 0);
    await expect(toastB).not.toBeVisible({ timeout: 4000 });
    // The sticky anchor survives (Infinity — per-toast override intact).
    await expect(anchor).toBeVisible();
  });

  test('TST-R20 — per-toast duration still overrides the global default', async ({ page }) => {
    await page.getByRole('button', { name: 'duration: 1000 ms' }).click();
    // Sticky toast (duration: Infinity) must survive well past the 1s global.
    await page.getByRole('button', { name: 'Show sticky error' }).click();
    const sticky = page.locator('[data-sticky="true"]').first();
    await expect(sticky).toBeVisible();
    await page.waitForTimeout(2500);
    await expect(sticky).toBeVisible();
  });

  test('TST-R21 — persistent polite announcer mirrors latest non-error toast', async ({ page }) => {
    const announcer = page.locator('[data-toast-announcer]');
    // Exists BEFORE any toast (the whole point — live region pre-mounted).
    await expect(announcer).toBeAttached();
    await expect(announcer).toHaveAttribute('aria-live', 'polite');
    await expect(announcer).toHaveText('');

    await page.getByRole('button', { name: 'toast.success()' }).click();
    await expect(announcer).toContainText('Saved successfully');

    // Errors keep role="alert" on-insertion semantics — announcer unchanged.
    await page.getByRole('button', { name: 'toast.error()' }).click();
    await expect(announcer).toContainText('Saved successfully');
  });
});
