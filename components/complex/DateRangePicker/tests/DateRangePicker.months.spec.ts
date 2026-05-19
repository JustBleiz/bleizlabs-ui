/**
 * DateRangePicker numberOfMonths layout spec.
 *
 * Coverage:
 * - DR-MTH01 numberOfMonths={1} renders single Calendar
 * - DR-MTH02 numberOfMonths={2} renders 2 side-by-side Calendars
 * - DR-MTH03 numberOfMonths={3} renders 3 Calendars
 * - DR-MTH04 single sync'd header shows month range label
 * - DR-MTH05 chevron prev shifts all Calendars together
 */

import { test, expect } from '@playwright/test';
import { rangeBy, openPicker, dialogOf } from './_helpers';

test.describe('DateRangePicker — numberOfMonths layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-range-picker');
  });

  test('DR-MTH01 — numberOfMonths=1 renders single Calendar', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const grids = dialog.locator('table[role="grid"]');
    await expect(grids).toHaveCount(1);
  });

  test('DR-MTH02 — numberOfMonths=2 renders two side-by-side Calendars', async ({ page }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const grids = dialog.locator('table[role="grid"]');
    await expect(grids).toHaveCount(2);
  });

  test('DR-MTH03 — numberOfMonths=3 renders three Calendars', async ({ page }) => {
    const picker = rangeBy(page, 'Three-month wide');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const grids = dialog.locator('table[role="grid"]');
    await expect(grids).toHaveCount(3);
  });

  test('DR-MTH04 — single sync header label spans first to last month', async ({ page }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const headerLabel = dialog.locator('div[aria-live="polite"]').first();
    const text = await headerLabel.textContent();
    // Two months → "Month1 — Month2" format
    expect(text).toMatch(/—/);
  });

  test('DR-MTH05 — chevron Next shifts displayMonth for both Calendars', async ({ page }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const headerLabel = dialog.locator('div[aria-live="polite"]').first();
    const beforeLabel = await headerLabel.textContent();
    const nextBtn = dialog.locator('button[aria-label="Next month"]').first();
    await nextBtn.dispatchEvent('click');
    const afterLabel = await headerLabel.textContent();
    expect(afterLabel).not.toBe(beforeLabel);
  });
});
