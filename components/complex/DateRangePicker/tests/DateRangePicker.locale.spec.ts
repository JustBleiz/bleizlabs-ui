/**
 * DateRangePicker locale spec.
 *
 * Coverage:
 * - DR-LOC01 pl-PL locale: weekday header starts with Monday
 * - DR-LOC02 pl-PL locale: month name in Polish
 * - DR-LOC03 en-US locale: weekday header starts with Sunday
 * - DR-LOC04 locale propagates to ALL embedded Calendars in numberOfMonths=2
 */

import { test, expect } from '@playwright/test';
import { rangeBy, openPicker, dialogOf } from './_helpers';

test.describe('DateRangePicker — locale propagation', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-range-picker');
  });

  test('DR-LOC01 — pl-PL: weekday header starts with Mon', async ({ page }) => {
    const picker = rangeBy(page, 'Polish locale range picker');
    await openPicker(picker);
    const firstGrid = dialogOf(page).locator('table[role="grid"]').first();
    const firstWeekdayCell = firstGrid.locator('thead th').first();
    const text = await firstWeekdayCell.textContent();
    // pl-PL "Mon" short form is "pon"
    expect(text?.toLowerCase()).toContain('pon');
  });

  test('DR-LOC02 — pl-PL: month name in Polish', async ({ page }) => {
    const picker = rangeBy(page, 'Polish locale range picker');
    await openPicker(picker);
    const headerLabel = dialogOf(page).locator('div[aria-live="polite"]').first();
    const text = await headerLabel.textContent();
    // pl-PL month names contain "ń" or "ó" or end with "ja"/"iec"/"sień" etc.
    // Generic test: not English month
    expect(text).not.toMatch(
      /January|February|March|April|May|June|July|August|September|October|November|December/,
    );
  });

  test('DR-LOC03 — en-US: weekday header starts with Sun', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    await openPicker(picker);
    const firstGrid = dialogOf(page).locator('table[role="grid"]').first();
    const firstWeekdayCell = firstGrid.locator('thead th').first();
    const text = await firstWeekdayCell.textContent();
    expect(text?.toLowerCase()).toContain('sun');
  });

  test('DR-LOC04 — locale propagates to both Calendars in 2-month layout', async ({ page }) => {
    const picker = rangeBy(page, 'Polish locale range picker');
    await openPicker(picker);
    const grids = dialogOf(page).locator('table[role="grid"]');
    // Both calendars must show Polish weekday short forms
    for (let i = 0; i < 2; i++) {
      const first = grids.nth(i).locator('thead th').first();
      const text = await first.textContent();
      expect(text?.toLowerCase()).toContain('pon');
    }
  });
});
