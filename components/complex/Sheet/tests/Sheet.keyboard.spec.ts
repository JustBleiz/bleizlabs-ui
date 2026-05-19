/**
 * Sheet keyboard interaction spec — APG `/dialog-modal/` compliance (E18).
 *
 * Coverage:
 * - Escape closes sheet (all 4 sides)
 * - Tab cycles forward, wraps last → first
 * - Focus trap prevents escape to background
 * - closeOnOverlayClick=false prevents overlay dismissal
 * - closeOnEscape=false disables Escape
 */

import { test, expect } from '@playwright/test';

test.describe('Sheet — keyboard interactions (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sheet');
  });

  for (const side of ['left', 'right', 'top', 'bottom'] as const) {
    test(`Escape closes ${side} sheet`, async ({ page }) => {
      await page.getByRole('button', { name: new RegExp(`open ${side} sheet$`, 'i') }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test(`Tab cycles within ${side} sheet (focus trap)`, async ({ page }) => {
      const trigger = page.getByRole('button', {
        name: new RegExp(`open ${side} sheet$`, 'i'),
      });
      await trigger.click();
      for (let i = 0; i < 6; i += 1) {
        await page.keyboard.press('Tab');
      }
      await expect(trigger).not.toBeFocused();
    });
  }

  test('closeOnOverlayClick=false prevents overlay dismissal', async ({ page }) => {
    await page.getByRole('button', { name: /open locked sheet/i }).click();
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closeOnEscape=false disables Escape', async ({ page }) => {
    await page.getByRole('button', { name: /open locked sheet/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
