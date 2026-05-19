/**
 * DatePicker focus behavior spec (E142 L3d1).
 *
 * Coverage:
 * - DP-R05 focus transitions input → Calendar cell on open
 * - DP-R06 clicking Calendar day commits + closes + returns focus to input
 * - DP-R07 typing without Alt+ArrowDown keeps focus on input (no auto-move)
 */

import { test, expect } from '@playwright/test';

test.describe('DatePicker — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-picker');
  });

  test('DP-R05 — input → Calendar cell focus transition on open', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1); // defaultValue 2026-04-20
    const ctrlInput = controlled.getByRole('combobox');
    await ctrlInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    // Selected cell's button is auto-focused
    const selectedButton = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await expect(selectedButton).toBeFocused();
  });

  test('DP-R06 — clicking Calendar day commits + closes + returns focus to input', async ({
    page,
  }) => {
    // Use section 1 — controlled demo with defaultValue 2026-04-20 → initial
    // focused cell is a known valid enabled day.
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const input = controlled.getByRole('combobox');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    const day20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await expect(day20).toBeFocused();
    await day20.click();
    await expect(grid).toHaveCount(0);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('2026-04-20');
  });

  test('DP-R07 — typing without Alt+ArrowDown keeps focus on input', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.type('2026');
    await expect(input).toBeFocused();
    await expect(page.getByRole('grid')).toHaveCount(0);
  });
});
