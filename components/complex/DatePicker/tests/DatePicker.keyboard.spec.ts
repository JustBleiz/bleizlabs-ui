/**
 * DatePicker keyboard interaction spec (E142 L3d1).
 *
 * Coverage:
 * - DP-R01 Alt+ArrowDown opens popup
 * - DP-R02 Escape closes popup without losing input focus
 * - DP-R03 Enter in input commits typed ISO date
 * - DP-R04 Calendar grid APG /grid/ inheritance (Arrow keys navigate days)
 * - ArrowDown (no modifier) on closed input opens + focuses Calendar
 * - Alt+ArrowUp closes popup
 *
 * Playground: /components/date-picker
 */

import { test, expect } from '@playwright/test';

test.describe('DatePicker — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-picker');
  });

  test('DP-R01 — Alt+ArrowDown opens Calendar popup from input', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(page.getByRole('grid')).toBeVisible();
  });

  test('ArrowDown (no modifier) on closed input opens popup', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('grid')).toBeVisible();
  });

  test('DP-R02 — Escape closes popup + keeps focus on input', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('grid')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('grid')).toHaveCount(0);
    await expect(input).toBeFocused();
  });

  test('Alt+ArrowUp closes popup when open', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('grid')).toBeVisible();
    await input.focus();
    await page.keyboard.press('Alt+ArrowUp');
    await expect(page.getByRole('grid')).toHaveCount(0);
    await expect(input).toBeFocused();
  });

  test('DP-R03 — Enter commits typed ISO date', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('2026-05-15');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('2026-05-15');
  });

  test('DP-R04 — Calendar grid ArrowRight advances focused day by 1', async ({
    page,
  }) => {
    // idx 1 — controlled with defaultValue 2026-04-20
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const ctrlInput = controlled.getByRole('combobox');
    await ctrlInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    // Selected cell 2026-04-20 is auto-focused by DatePicker on open
    const day20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await expect(day20).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const day21 = grid.locator('button[data-calendar-cell="2026-04-21"]');
    await expect(day21).toBeFocused();
  });

  test('Calendar ArrowDown advances focused day by 7', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const ctrlInput = controlled.getByRole('combobox');
    await ctrlInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    const day20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await expect(day20).toBeFocused();
    await page.keyboard.press('ArrowDown');
    const day27 = grid.locator('button[data-calendar-cell="2026-04-27"]');
    await expect(day27).toBeFocused();
  });

  test('Invalid ISO revert: typed garbage reverts on Enter (no value committed)', async ({
    page,
  }) => {
    // idx 1 — controlled with defaultValue 2026-04-20
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const input = controlled.getByRole('combobox');
    await input.focus();
    await input.fill('not-a-date');
    await page.keyboard.press('Enter');
    // Value reverts to committed ISO (2026-04-20)
    await expect(input).toHaveValue('2026-04-20');
  });
});
