/**
 * TimePicker ARIA spec — APG `/combobox/` + `/listbox/` compliance.
 *
 * Coverage:
 * - TP-A01 input role=combobox + aria-haspopup=listbox
 * - TP-A02 dialog role + aria-label + aria-modal=false
 * - TP-A03 listboxes present per field (24h: h+m; 12h: h+m+p)
 * - TP-A04 listbox options carry role=option + aria-selected
 * - TP-A05 withSeconds adds 3rd listbox
 * - TP-A06 axe-core zero violations
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { dialogOf, listboxOf, openPicker, pickerBy } from './_helpers';

test.describe('TimePicker — ARIA semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-picker');
  });

  test('TP-A01 — input role=combobox + aria-haspopup=listbox', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = picker.locator('input[role="combobox"]');
    await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('TP-A02 — open popover renders dialog + label + aria-modal=false', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const dialog = dialogOf(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'false');
    await expect(dialog).toHaveAttribute('aria-label', /time picker/i);
  });

  test('TP-A03 — 24h mode renders hours + minutes listboxes only', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    await expect(listboxOf(page, 'h')).toBeVisible();
    await expect(listboxOf(page, 'm')).toBeVisible();
    await expect(listboxOf(page, 'p')).toHaveCount(0);
    await expect(listboxOf(page, 's')).toHaveCount(0);
  });

  test('TP-A04 — listbox options have role=option + aria-selected', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    // demo default 08:30 → hour option 8 selected
    const eightOption = page.locator('ul[data-listbox="h"] li[data-option-value="8"]');
    await expect(eightOption).toHaveAttribute('role', 'option');
    await expect(eightOption).toHaveAttribute('aria-selected', 'true');
  });

  test('TP-A05 — withSeconds renders 3rd listbox', async ({ page }) => {
    const picker = pickerBy(page, 'Race finish');
    await openPicker(picker);
    await expect(listboxOf(page, 's')).toBeVisible();
  });

  test('TP-A06 — 12h mode renders AM/PM listbox at logical end', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting time');
    await openPicker(picker);
    await expect(listboxOf(page, 'p')).toBeVisible();
    await expect(listboxOf(page, 'p')).toHaveAttribute('aria-label', 'AM or PM');
  });

  test('TP-A07 — axe-core zero violations', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(results.violations).toEqual([]);
  });
});
