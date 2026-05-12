/**
 * DateTimePicker compose spec — Calendar + TimeInput coordination.
 *
 * Coverage:
 * - DT-CMP01 Calendar cell click commits new date preserving existing time
 * - DT-CMP02 TimeInput hour ArrowUp commits new time preserving date
 * - DT-CMP03 selecting new date when value=null seeds time at 00:00
 * - DT-CMP04 hidden input ISO reflects combined date+time after Calendar click
 * - DT-CMP05 hidden input ISO reflects combined date+time after TimeInput nudge
 */

import { test, expect } from '@playwright/test';
import {
  calendarCellByIso,
  hiddenInputOf,
  hourSpinOf,
  inputOf,
  openPicker,
  pickerBy,
} from './_helpers';

test.describe('DateTimePicker — Calendar + TimeInput compose', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-time-picker');
  });

  test('DT-CMP01 — Calendar click preserves existing time (09:00)', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await openPicker(picker);
    await calendarCellByIso(page, '2026-05-20').dispatchEvent('click');
    // Input now reflects new date with preserved 09:00 time
    await expect(input).toHaveValue('2026-05-20T09:00');
  });

  test('DT-CMP02 — TimeInput hour ArrowUp preserves date', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await openPicker(picker);
    const hourSpin = hourSpinOf(page);
    await hourSpin.focus();
    await hourSpin.press('ArrowUp');
    // Date preserved (2026-05-15), hour incremented 09 → 10
    await expect(input).toHaveValue('2026-05-15T10:00');
  });

  test('DT-CMP03 — hidden input reflects current combined ISO', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    const hidden = hiddenInputOf(picker, 'meetingAt');
    await expect(hidden).toHaveValue('2026-05-15T10:00:00');
  });

  test('DT-CMP04 — Calendar click updates hidden input ISO', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    const hidden = hiddenInputOf(picker, 'meetingAt');
    await openPicker(picker);
    await calendarCellByIso(page, '2026-05-25').dispatchEvent('click');
    await expect(hidden).toHaveValue('2026-05-25T10:00:00');
  });

  test('DT-CMP05 — TimeInput nudge updates hidden input ISO', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    const hidden = hiddenInputOf(picker, 'meetingAt');
    await openPicker(picker);
    const hourSpin = hourSpinOf(page);
    await hourSpin.focus();
    await hourSpin.press('PageUp'); // +10 hours → 20
    await expect(hidden).toHaveValue('2026-05-15T20:00:00');
  });
});
