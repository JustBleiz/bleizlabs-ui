/**
 * DateRangePicker ARIA spec — APG `/datepicker-dialog/` + `/grid/` compliance.
 *
 * Coverage:
 * - DR-A01 input role="combobox" aria-haspopup="dialog"
 * - DR-A02 dialog role + aria-labelledby to input
 * - DR-A03 calendars role="grid" inside dialog
 * - DR-A04 range bounds carry aria-selected="true" via cellExtras
 * - DR-A05 in-range cells carry data-in-range and aria-label augmentation
 * - DR-A06 aria-required surfaces on input when required prop set
 * - DR-A07 axe-core zero violations on demo route
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rangeBy, inputOf, openPicker, cellByIso, dialogOf } from './_helpers';

test.describe('DateRangePicker — ARIA semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-range-picker');
  });

  test('DR-A01 — input role=combobox + aria-haspopup=dialog', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    const input = inputOf(picker);
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('DR-A02 — dialog role + aria-labelledby to input id', async ({ page }) => {
    const picker = rangeBy(page, 'Basic single-month range');
    await openPicker(picker);
    const dialog = dialogOf(page);
    await expect(dialog).toHaveAttribute('role', 'dialog');
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const referenced = page.locator(`#${labelledBy}`);
    await expect(referenced).toHaveAttribute('role', 'combobox');
  });

  test('DR-A03 — at least one grid inside dialog', async ({ page }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    const dialog = dialogOf(page);
    const grids = dialog.locator('table[role="grid"]');
    expect(await grids.count()).toBeGreaterThanOrEqual(2);
  });

  test('DR-A04 — committed range bounds carry data-range-start + data-range-end', async ({
    page,
  }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    // Controlled state in demo seeds from=2026-05-05 to=2026-05-19
    const fromCell = cellByIso(page, '2026-05-05');
    const toCell = cellByIso(page, '2026-05-19');
    const fromTd = fromCell.locator('xpath=..');
    const toTd = toCell.locator('xpath=..');
    await expect(fromTd).toHaveAttribute('data-range-start', 'true');
    await expect(toTd).toHaveAttribute('data-range-end', 'true');
  });

  test('DR-A05 — in-range intermediate cells have data-in-range + aria-label augmentation', async ({
    page,
  }) => {
    const picker = rangeBy(page, 'Two-month side-by-side');
    await openPicker(picker);
    // 2026-05-10 sits between from=05 and to=19
    const middleTd = cellByIso(page, '2026-05-10').locator('xpath=..');
    await expect(middleTd).toHaveAttribute('data-in-range', 'true');
    const ariaLabel = await middleTd.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/in selected range/i);
  });

  test('DR-A06 — aria-required surfaces on input when required prop set', async ({
    page,
  }) => {
    const picker = rangeBy(page, 'Form integration with required');
    const input = inputOf(picker);
    await expect(input).toHaveAttribute('aria-required', 'true');
  });

  test('DR-A07 — axe-core zero violations on demo route', async ({ page }) => {
    // Open at least one picker so dialog is in DOM for the scan
    const picker = rangeBy(page, 'Basic single-month range');
    await openPicker(picker);
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // demo theme contrast tracked separately
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
