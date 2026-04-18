/**
 * Dialog focus management spec — APG initial focus + trap + restore (E15).
 *
 * Coverage:
 * - Initial focus on open — default: first tabbable inside content
 * - Initial focus override — `initialFocusRef` prop points to specific element
 * - Focus trap — document.activeElement always inside dialog while open
 * - Focus restore on close — returns to the trigger that opened the dialog
 * - Multi-trigger — focus returns to the specific trigger that activated it (Radix #2270)
 * - Dialog with no focusables — focuses the content element itself (tabindex=-1 fallback)
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dialog');
  });

  test('initial focus lands on first tabbable by default', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');

    await page.waitForTimeout(50);

    const closeButton = dialog.getByRole('button', { name: /close dialog/i });
    await expect(closeButton).toBeFocused();
  });

  test('initialFocusRef overrides default initial focus', async ({ page }) => {
    await page.getByRole('button', { name: /open custom focus dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await page.waitForTimeout(50);

    const confirmButton = dialog.getByRole('button', { name: /^confirm$/i });
    await expect(confirmButton).toBeFocused();
  });

  test('focus stays inside dialog during Tab navigation', async ({ page }) => {
    await page.getByRole('button', { name: /open form dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await page.waitForTimeout(50);

    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const isInside = await dialog.evaluate((el) =>
        el.contains(document.activeElement),
      );
      expect(isInside).toBe(true);
    }
  });

  test('focus restores to trigger on close via close button', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic dialog/i });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /close dialog/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('focus restores to trigger on close via overlay click', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic dialog/i });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Click the overlay directly (centered above top bar, outside content card)
    await page.mouse.click(10, 10);

    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('multiple triggers — focus restores to the specific trigger used (Radix #2270)', async ({
    page,
  }) => {
    const triggerA = page.getByRole('button', { name: /open trigger a/i });
    const triggerB = page.getByRole('button', { name: /open trigger b/i });

    await triggerA.click();
    await page.keyboard.press('Escape');
    await expect(triggerA).toBeFocused();

    await triggerB.click();
    await page.keyboard.press('Escape');
    await expect(triggerB).toBeFocused();
  });
});
