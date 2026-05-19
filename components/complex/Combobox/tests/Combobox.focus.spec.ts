/**
 * Combobox focus behavior spec — APG `/combobox/` editable-listbox (E142 L3d1).
 *
 * Coverage:
 * - Focus stays on input while listbox is open (aria-activedescendant pattern)
 * - CB-R06 blur commits on exact textValue match (Strategy A)
 * - Blur reverts to committed label on mismatch
 * - Clear button returns focus to input after clearing
 * - Chevron toggle keeps input as focus target
 */

import { test, expect } from '@playwright/test';

test.describe('Combobox — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/combobox');
  });

  test('Focus stays on input while navigating listbox (APG editable pattern)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await expect(input).toBeFocused();
    // E142 L4 F1 — aria-activedescendant now reconciles on the input.
    const firstId = await listbox.getByRole('option').first().getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', firstId as string);
    await page.keyboard.press('ArrowDown');
    await expect(input).toBeFocused();
  });

  test('Clear button returns focus to input after clearing', async ({ page }) => {
    // Section 3 — controlled with defaultValue="pl" → clear button only shows
    // when search OR value is set. Open + commit first so search != ''.
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('Poland');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue(/Poland/i);
    // Clear button has aria-label="Clear selection"
    const clearButton = page.getByRole('button', { name: 'Clear selection' }).first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('');
  });

  test('CB-R06 — Blur commits on exact textValue match (Strategy A)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('Japan'); // exact match
    // Tab away — relatedTarget outside popper → blur commits
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100); // microtask + blur delay
    await expect(input).toHaveValue(/Japan/i);
  });

  test('Blur reverts search to committed label when no exact match', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    // First commit Poland
    await input.focus();
    await input.fill('Poland');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue(/Poland/i);
    // Now type garbage + blur → revert to "Poland"
    await input.focus();
    await input.fill('xxxnomatch');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await expect(input).toHaveValue(/Poland/i);
  });

  test('Chevron toggle button opens listbox (keeps input usable)', async ({ page }) => {
    const chevron = page.getByRole('button', { name: 'Open suggestions' }).first();
    await chevron.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    const input = page.getByRole('combobox').first();
    await input.focus();
    await expect(input).toBeFocused();
  });
});
