/**
 * AlertDialog focus management spec — APG `/alertdialog/` compliance (E16).
 *
 * Coverage:
 * - Initial focus defaults to Cancel button (least destructive per APG safety)
 * - Focus trap prevents escape to background page
 * - Focus restores to trigger element on close (Radix #1891, #2270 fix)
 * - Multiple triggers: focus returns to the specific trigger that opened dialog
 */

import { test, expect } from '@playwright/test';

test.describe('AlertDialog — focus management (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/alert-dialog');
  });

  test('Initial focus lands on Cancel (least destructive per APG)', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeFocused();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  test.skip('initialFocusRef override focuses custom target', async () => {
    // initialFocusRef targets DOM refs attached by consumer externally.
    // Base playground does not wire a custom-focus scenario.
  });

  test('Focus trap — Tab on Confirm wraps to Cancel (not to background)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    // useFocusTrap defers initial focus via requestAnimationFrame — wait for
    // the trap to finish setting up before issuing Tab presses, otherwise
    // under heavy parallel load Tab can fire before focus lands on Cancel.
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expect(page.getByRole('button', { name: /open basic alert/i })).not.toBeFocused();
  });

  test('Focus restores to trigger element on close', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic alert/i });
    await trigger.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('Multiple triggers — focus returns to correct trigger (Radix #2270)', async ({ page }) => {
    const triggerA = page.getByRole('button', { name: /open basic alert/i });
    const triggerB = page.getByRole('button', { name: /open critical alert/i });

    await triggerA.click();
    await page.keyboard.press('Escape');
    await expect(triggerA).toBeFocused();

    await triggerB.click();
    await page.keyboard.press('Escape');
    await expect(triggerB).toBeFocused();
  });

  test('Focus does not get stuck on unmount (Radix #1891)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'BODY']).toContain(activeElement);
  });
});
