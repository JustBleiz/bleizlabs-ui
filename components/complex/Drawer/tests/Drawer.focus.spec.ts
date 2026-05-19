/**
 * Drawer focus management spec — APG `/dialog-modal/` compliance (E17).
 *
 * Coverage:
 * - Initial focus on first tabbable (Dialog parity, NOT least-destructive)
 * - Focus trap prevents escape to background
 * - Focus restores to trigger on close (Radix #1891 fix via rAF)
 * - Multi-trigger: focus returns to the specific trigger that opened drawer
 * - Content container focusable (tabIndex=-1) when no tabbables inside
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — focus management (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  test('Initial focus lands on first tabbable element', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    // Filters drawer first tabbable = first checkbox (In stock). Checkbox is
    // rendered as a native <input type="checkbox"> so role='checkbox' locates it.
    const firstCheckbox = page.getByRole('dialog').getByRole('checkbox').first();
    await expect(firstCheckbox).toBeFocused();
  });

  test('Focus trap prevents Tab escape to background', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(page.getByRole('button', { name: /open basic drawer/i })).not.toBeFocused();
  });

  test('Focus restores to trigger on close (Radix #1891)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic drawer/i });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('Multi-trigger: focus returns to specific trigger (Radix #2270)', async ({ page }) => {
    const t1 = page.getByRole('button', { name: /open basic drawer/i });
    const t2 = page.getByRole('button', { name: /open filters drawer/i });

    await t2.click();
    await page.keyboard.press('Escape');
    await expect(t2).toBeFocused();

    await t1.click();
    await page.keyboard.press('Escape');
    await expect(t1).toBeFocused();
  });

  test('Content container focusable when no internal tabbables', async ({ page }) => {
    await page.getByRole('button', { name: /open text-only drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeFocused();
  });
});
