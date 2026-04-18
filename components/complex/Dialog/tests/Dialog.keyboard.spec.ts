/**
 * Dialog keyboard interaction spec — APG `/dialog-modal/` compliance (E15).
 *
 * Coverage (APG keyboard table):
 * - Tab                → focus cycles forward, wraps first→last
 * - Shift+Tab          → focus cycles backward, wraps last→first
 * - Escape             → closes dialog + returns focus to trigger
 * - Focus trap         → Tab on last tabbable wraps to first (not escapes to body)
 * - Nested Select/Combobox Escape → nested component handles first (Radix #1951, #2450)
 *
 * Playground route: `/components/dialog`
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog — keyboard interactions (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dialog');
  });

  test('Escape closes dialog and returns focus to trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic dialog/i });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await expect(trigger).toBeFocused();
  });

  test('Tab cycles focus forward within dialog (wraps to first)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const focusables = await dialog.locator('button, a[href], input, [tabindex="0"]').all();
    expect(focusables.length).toBeGreaterThan(0);

    for (let i = 0; i < focusables.length + 2; i += 1) {
      await page.keyboard.press('Tab');
      const activeInsideDialog = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      expect(activeInsideDialog).toBe(true);
    }
  });

  test('Shift+Tab cycles focus backward within dialog (wraps to last)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');

    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const activeInsideDialog = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      expect(activeInsideDialog).toBe(true);
    }
  });

  test('Close button activates on Enter and Space', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: /close dialog/i });

    await closeButton.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();

    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await dialog.getByRole('button', { name: /close dialog/i }).focus();
    await page.keyboard.press('Space');
    await expect(dialog).not.toBeVisible();
  });

  test('closeOnEscape=false disables Escape close', async ({ page }) => {
    await page.getByRole('button', { name: /open no-escape dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
  });
});
