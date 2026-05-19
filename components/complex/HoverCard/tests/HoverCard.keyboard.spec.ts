/**
 * HoverCard keyboard interaction spec (E23).
 *
 * Focus opens instantly (no warm-up delay; SC 2.1.1 explicit intent).
 * Escape dismisses without losing trigger focus.
 */

import { test, expect } from '@playwright/test';

test.describe('HoverCard — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/hover-card');
  });

  test('HC-R03 — focus on trigger opens instantly (SC 2.1.1 keyboard parity)', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    // Focus path bypasses openDelay — content appears immediately
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('HC-R05 — Escape closes without losing trigger focus (SC 1.4.13 dismissable)', async ({
    page,
  }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // Focus remains on trigger after Escape dismiss
    await expect(trigger).toBeFocused();
  });
});
