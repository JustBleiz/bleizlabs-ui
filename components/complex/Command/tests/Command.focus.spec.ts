/**
 * Command focus behavior spec (E142 L3d1).
 *
 * Coverage:
 * - CMD-R07 initial focus on input (not first option)
 * - CMD-R06 Tab cycles within palette (focus trap)
 * - CMD-R08 body siblings get aria-hidden (own inert implementation)
 * - Escape returns focus to opener
 */

import { test, expect } from '@playwright/test';

test.describe('Command — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/command');
  });

  test('CMD-R07 — initial focus lands on input (not first option)', async ({ page }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const input = page.getByRole('combobox');
    await expect(input).toBeFocused();
  });

  test('CMD-R08 — sibling body children get aria-hidden while palette open', async ({ page }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    // All direct body children except the portal root should have aria-hidden
    const allSiblingsHidden = await page.evaluate(() => {
      const portalRoot = document.querySelector('[data-cmd-portal]');
      const children = Array.from(document.body.children).filter((c) => c !== portalRoot);
      return children.every((c) => c.getAttribute('aria-hidden') === 'true');
    });
    expect(allSiblingsHidden).toBe(true);
  });

  test('Escape returns focus to opener button', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Open palette' });
    await opener.click();
    await expect(page.getByRole('combobox')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  });

  test('CMD-R06 — Tab inside palette stays on focusable controls (no escape)', async ({ page }) => {
    // Palette has input + option buttons. Tab should cycle focus inside the
    // dialog (useFocusTrap from Dialog E15).
    await page.getByRole('button', { name: 'Open palette' }).click();
    const input = page.getByRole('combobox');
    await expect(input).toBeFocused();
    // Tab once — focus moves to something inside the dialog
    await page.keyboard.press('Tab');
    const activeInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(document.activeElement) ?? false;
    });
    expect(activeInsideDialog).toBe(true);
  });
});
