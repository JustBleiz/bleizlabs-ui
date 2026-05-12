/**
 * TimePicker format spec — 12h/24h, step filter, hidden ISO emission.
 *
 * Coverage:
 * - TP-FMT01 24h displays "14:30"
 * - TP-FMT02 12h displays "02:30 PM" for value=14:30
 * - TP-FMT03 step=15 filters minute listbox to 4 options
 * - TP-FMT04 step=1 (default) renders 60 minute options
 * - TP-FMT05 withSeconds renders 60 seconds options
 * - TP-FMT06 24h mode hides AM/PM listbox
 */

import { test, expect } from '@playwright/test';
import { inputOf, listboxOf, openPicker, pickerBy } from './_helpers';

test.describe('TimePicker — format + step', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-picker');
  });

  test('TP-FMT01 — 24h mode shows "HH:MM"', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await expect(input).toHaveValue('08:30');
  });

  test('TP-FMT02 — 12h mode shows "HH:MM PM" for h24=14', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting time');
    const input = inputOf(picker);
    await expect(input).toHaveValue('02:30 PM');
  });

  test('TP-FMT03 — step=15 filters minute listbox to 4 options', async ({ page }) => {
    const picker = pickerBy(page, 'Slot');
    await openPicker(picker);
    const minuteListbox = listboxOf(page, 'm');
    const options = minuteListbox.locator('li[role="option"]');
    await expect(options).toHaveCount(4);
  });

  test('TP-FMT04 — step=1 (default) renders 60 minute options', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const minuteListbox = listboxOf(page, 'm');
    const options = minuteListbox.locator('li[role="option"]');
    await expect(options).toHaveCount(60);
  });

  test('TP-FMT05 — withSeconds renders 60 seconds options', async ({ page }) => {
    const picker = pickerBy(page, 'Race finish');
    await openPicker(picker);
    const secondsListbox = listboxOf(page, 's');
    const options = secondsListbox.locator('li[role="option"]');
    await expect(options).toHaveCount(60);
  });

  test('TP-FMT06 — 24h mode does NOT render AM/PM listbox', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    await expect(listboxOf(page, 'p')).toHaveCount(0);
  });
});
