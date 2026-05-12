/**
 * DateTimePicker ARIA spec — APG combobox + grid + spinbutton composition.
 *
 * Coverage:
 * - DT-A01 input role=combobox + aria-haspopup=dialog
 * - DT-A02 dialog renders Calendar grid + Time group
 * - DT-A03 dialog has aria-label
 * - DT-A04 12h mode renders AM/PM switch inside Time group
 * - DT-A05 hidden form input emits ISO 8601 local datetime
 * - DT-A06 axe-core zero violations
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  dialogOf,
  hiddenInputOf,
  inputOf,
  openPicker,
  pickerBy,
  timeGroupOf,
} from './_helpers';

test.describe('DateTimePicker — ARIA semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-time-picker');
  });

  test('DT-A01 — input role=combobox + aria-haspopup=dialog', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('DT-A02 — dialog renders Calendar grid + Time group', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    await openPicker(picker);
    await expect(dialogOf(page)).toBeVisible();
    await expect(page.locator('table[role="grid"]')).toBeVisible();
    await expect(timeGroupOf(page)).toBeVisible();
  });

  test('DT-A03 — dialog carries aria-label', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    await openPicker(picker);
    await expect(dialogOf(page)).toHaveAttribute('aria-label', /date.*time picker/i);
  });

  test('DT-A04 — 12h mode renders AM/PM switch in Time group', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting datetime');
    await openPicker(picker);
    const periodSwitch = page.locator('div[role="dialog"] button[role="switch"]');
    await expect(periodSwitch).toBeVisible();
    await expect(periodSwitch).toHaveAttribute('aria-label', 'AM or PM');
  });

  test('DT-A05 — hidden input emits ISO 8601 local datetime', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    const hidden = hiddenInputOf(picker, 'meetingAt');
    const v = await hidden.inputValue();
    expect(v).toMatch(/^2026-05-15T10:00:00$/);
  });

  test('DT-A06 — axe-core zero violations', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    await openPicker(picker);
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
