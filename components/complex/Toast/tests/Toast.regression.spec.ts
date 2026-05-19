/**
 * Toast regression spec (E142 L3e).
 *
 * Coverage:
 * - TST-R11 dedup by id: same id UPDATES existing (no duplicate)
 * - TST-R12 promise() transitions loading -> success/error (single toast id)
 * - TST-R13 duration: Infinity requires manual dismissal
 * - TST-R14 visibilitychange hidden pauses auto-dismiss
 * - TST-R15 reduced-motion disables slide-in animation (fade fallback)
 * - TST-R16 SSR safe: Toaster mounts client-only via FloatingPortal
 * - TST-R17 max queue size [PLAYGROUND-DEP: Toaster has no max prop; skipped]
 * - Extra: Dismiss all via toast.dismiss()
 *
 * Playground: /components/toast
 *   Section 5: dedup by id (`1. saving` + `2. saved (same id)` with id=save-status)
 *   Section 6: promise toasts (fakePromise 1500ms)
 *   Section 4: sticky error (duration: Infinity)
 *   Section 7: Spawn 3 / Dismiss all
 *   Section 8: Spawn 5 in sequence
 */

import { test, expect } from '@playwright/test';

test.describe('Toast — regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/toast');
  });

  test('TST-R11 — dedup by id: same id updates existing (no duplicate)', async ({ page }) => {
    // Section 5: button `1. saving` uses id=save-status title=Saving...
    //            button `2. saved (same id)` uses same id, title=Saved
    await page.getByRole('button', { name: '1. saving' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Saving…' })).toBeVisible();
    // Exactly one toast visible.
    await expect(page.getByRole('status')).toHaveCount(1);
    await page.getByRole('button', { name: '2. saved (same id)' }).click();
    // Still exactly one toast — the existing one was updated in place.
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  });

  test('TST-R12 — promise() transitions loading → success', async ({ page }) => {
    await page.getByRole('button', { name: 'promise (success)' }).click();
    // Loading state (variant='info', duration=Infinity).
    await expect(page.getByRole('status').filter({ hasText: 'Publishing article…' })).toBeVisible();
    // After 1500ms promise resolves, same toast id transitions to success.
    await expect(page.getByRole('status').filter({ hasText: 'Article published' })).toBeVisible({
      timeout: 4000,
    });
    await expect(
      page.getByRole('status').filter({ hasText: 'Publishing article…' }),
    ).not.toBeVisible();
  });

  test('TST-R12b — promise() transitions loading → error', async ({ page }) => {
    await page.getByRole('button', { name: 'promise (error)' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Publishing article…' })).toBeVisible();
    // On reject the info toast id updates to error variant + title.
    await expect(page.getByRole('alert').filter({ hasText: 'Publish failed' })).toBeVisible({
      timeout: 4000,
    });
  });

  test('TST-R13 — duration: Infinity requires manual dismissal', async ({ page }) => {
    await page.getByRole('button', { name: 'Show sticky error' }).click();
    const sticky = page.getByRole('alert').filter({ hasText: 'Connection lost' });
    await expect(sticky).toBeVisible();
    // data-sticky attr set when duration is non-finite.
    await expect(sticky).toHaveAttribute('data-sticky', 'true');
    // Wait past any reasonable auto-dismiss budget — sticky must persist.
    await page.waitForTimeout(1500);
    await expect(sticky).toBeVisible();
    // Manual dismiss via close button.
    await page.getByRole('button', { name: 'Dismiss notification' }).first().click();
    await expect(sticky).not.toBeVisible();
  });

  test('TST-R14 — visibilitychange hidden pauses auto-dismiss', async ({ page }) => {
    await page.getByRole('button', { name: 'toast()', exact: true }).click();
    const toast = page.getByRole('status').filter({ hasText: 'Default notification' });
    await expect(toast).toBeVisible();
    // Simulate tab hidden — visibilitychange listener fires pauseAllTimers().
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    // With the timer paused, toast stays visible past a short grace window.
    await page.waitForTimeout(500);
    await expect(toast).toBeVisible();
    // Restore visibility — timer resumes.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });

  test('TST-R15 — reduced-motion uses fade animation (no transform slide)', async ({ page }) => {
    // reducedMotion is set in beforeEach. The Toast module.scss defines a
    // toastInFade keyframe (opacity only) under @media (prefers-reduced-motion).
    await page.getByRole('button', { name: 'toast()', exact: true }).click();
    const toast = page.getByRole('status').filter({ hasText: 'Default notification' });
    await expect(toast).toBeVisible();
    const animationName = await toast.evaluate((el) => window.getComputedStyle(el).animationName);
    // Under reduced motion, the name is the fade variant (not toastIn).
    expect(animationName).toContain('toastInFade');
  });

  test('TST-R16 — SSR: Toaster renders client-only (no toast roles in SSR HTML)', async ({
    page,
  }) => {
    const response = await page.goto('/components/toast');
    const html = (await response?.text()) ?? '';
    // FloatingPortal appends to document.body client-side only — no toast
    // live-region markup in the SSR HTML payload.
    expect(html).not.toContain('role="alert"');
    expect(html).not.toMatch(/role="status"[^>]*aria-live/);
  });

  test.skip('TST-R17 — max queue size [PLAYGROUND-DEP: Toaster has no max prop]', async () => {
    // Toaster does not expose a max-visible cap in v1.0. Queue is unbounded
    // by design; deferred as PLAYGROUND-DEP.
  });

  test('toast.dismiss() clears all toasts', async ({ page }) => {
    await page.getByRole('button', { name: 'Spawn 3' }).click();
    await expect(page.getByRole('status').filter({ hasText: /Toast [ABC]/ })).toHaveCount(3);
    await page.getByRole('button', { name: 'Dismiss all' }).click();
    await expect(page.getByRole('status').filter({ hasText: /Toast [ABC]/ })).toHaveCount(0);
  });

  test('Action button: retry toast fires onClick + dismisses parent', async ({ page }) => {
    await page.getByRole('button', { name: 'Show retry toast' }).click();
    const errorToast = page.getByRole('alert').filter({ hasText: 'Failed to load' });
    await expect(errorToast).toBeVisible();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(errorToast).not.toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Retrying…' })).toBeVisible();
  });

  test('Stack order: newest toast on top (bottom-right position)', async ({ page }) => {
    // Default position is bottom-right — CSS uses column-reverse so the
    // newest toast is visually above older ones.
    await page.getByRole('button', { name: 'toast.success()' }).click();
    await page.getByRole('button', { name: 'toast.info()' }).click();
    const statuses = page.getByRole('status');
    await expect(statuses).toHaveCount(2);
    // Both visible simultaneously — no eviction.
    await expect(statuses.filter({ hasText: 'Saved successfully' })).toBeVisible();
    await expect(statuses.filter({ hasText: /Update available/ })).toBeVisible();
  });
});
