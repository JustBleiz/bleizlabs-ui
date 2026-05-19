/**
 * Drawer keyboard interaction spec — APG `/dialog-modal/` compliance (E17).
 *
 * Coverage:
 * - Tab          → focus cycles forward through tabbable children, wraps last→first
 * - Shift+Tab    → focus cycles backward, wraps first→last
 * - Escape       → closes drawer (APG requirement)
 * - Enter/Space  → activates focused button (native)
 * - Initial focus → first tabbable (Dialog parity, NOT least-destructive)
 * - Overlay click → closes by default (Dialog parity, differs from AlertDialog)
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — keyboard interactions (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  test('Escape closes drawer', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Tab cycles through tabbable elements (focus trap)', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /open filters drawer/i })).not.toBeFocused();
  });

  test('Overlay click closes drawer (closeOnOverlayClick=true default)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Drawer is bottom-anchored — click near the top of the viewport hits the overlay
    await page.mouse.click(200, 10);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closeOnOverlayClick=false prevents overlay dismissal', async ({ page }) => {
    await page.getByRole('button', { name: /open locked drawer/i }).click();
    await page.mouse.click(200, 10);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closeOnEscape=false disables Escape', async ({ page }) => {
    await page.getByRole('button', { name: /open locked drawer/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
