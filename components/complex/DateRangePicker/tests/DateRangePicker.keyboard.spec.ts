/**
 * DateRangePicker keyboard interaction spec.
 *
 * Coverage:
 * - DR-KB01 Alt+ArrowDown opens popup + focuses Calendar
 * - DR-KB02 Alt+ArrowUp closes popup
 * - DR-KB03 ArrowDown (no modifier) opens popup
 * - DR-KB04 Escape on input closes popup (when open)
 * - DR-KB05 Enter commits typed search + closes popup
 * - DR-KB06 ArrowKey at Calendar boundary is HARD STOP (no cross-grid jump)
 */

import { test, expect } from '@playwright/test';
import { rangeBy, inputOf, dialogOf } from './_helpers';

test.describe('DateRangePicker — keyboard interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-range-picker');
  });

  test('DR-KB01 — Alt+ArrowDown opens popup and focuses Calendar', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    // Focused cell has tabindex=0
    const focusedCell = page.locator('button[data-calendar-cell][tabindex="0"]').first();
    await expect(focusedCell).toBeVisible();
  });

  test('DR-KB02 — Alt+ArrowUp closes popup', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.press('Alt+ArrowUp');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('DR-KB03 — ArrowDown (no modifier) opens popup', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await input.focus();
    await input.press('ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
  });

  test('DR-KB04 — Escape on input closes popup', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await input.focus();
    await input.press('ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.press('Escape');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('DR-KB05 — Enter commits typed search + closes popup', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await input.click();
    await input.press('ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.fill('2026-06-01 → 2026-06-10');
    await input.press('Enter');
    await expect(dialogOf(page)).not.toBeVisible();
    expect(await input.inputValue()).toContain('2026-06-01');
    expect(await input.inputValue()).toContain('2026-06-10');
  });

  test('DR-KB06 — ArrowKey within Calendar does NOT jump grids (hard stop boundary)', async ({
    page,
  }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await inputOf(picker).focus();
    await inputOf(picker).press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    // First Calendar gets focus; check that arrows stay within it.
    // Press ArrowRight many times — focused cell must stay in same <table>.
    const beforeTable = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement | null;
      return focused?.closest('table')?.getAttribute('aria-labelledby') ?? null;
    });
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('ArrowRight');
    }
    const afterTable = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement | null;
      return focused?.closest('table')?.getAttribute('aria-labelledby') ?? null;
    });
    expect(afterTable).toBe(beforeTable);
  });
});
