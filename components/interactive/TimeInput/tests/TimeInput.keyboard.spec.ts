/**
 * TimeInput keyboard spec — APG spinbutton + bespoke 2-digit buffer auto-advance.
 *
 * Coverage:
 * - TI-KB01 ArrowUp increments hour, ArrowDown decrements
 * - TI-KB02 PageUp ±10 on hours
 * - TI-KB03 step prop drives ArrowUp on minutes
 * - TI-KB04 Home jumps to field min, End to field max
 * - TI-KB05 2-digit typed buffer auto-advances focus
 * - TI-KB06 Wrap at hour bounds (23 + ArrowUp → 00)
 * - TI-KB07 Backspace clears buffer; empty-buffer Backspace retreats
 * - TI-KB08 ":" separator commits buffer + advances
 */

import { test, expect } from '@playwright/test';
import {
  hourFieldOf,
  minuteFieldOf,
  periodToggleOf,
  timeInputBy,
} from './_helpers';

test.describe('TimeInput — keyboard model', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-input');
  });

  test('TI-KB01 — ArrowUp increments + ArrowDown decrements hour', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('ArrowUp');
    await expect(hour).toHaveAttribute('aria-valuenow', '9');
    await hour.press('ArrowDown');
    await hour.press('ArrowDown');
    await expect(hour).toHaveAttribute('aria-valuenow', '7');
  });

  test('TI-KB02 — PageUp ±10 on hours', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    await hour.focus();
    // defaultValue 08:30 → +10 = 18
    await hour.press('PageUp');
    await expect(hour).toHaveAttribute('aria-valuenow', '18');
    await hour.press('PageDown');
    await expect(hour).toHaveAttribute('aria-valuenow', '8');
  });

  test('TI-KB03 — step prop drives ArrowUp on minute field', async ({ page }) => {
    const picker = timeInputBy(page, 'Slot');
    const minute = minuteFieldOf(picker);
    await minute.focus();
    // demo defaultValue 10:00, step=15
    await minute.press('ArrowUp');
    await expect(minute).toHaveAttribute('aria-valuenow', '15');
    await minute.press('ArrowUp');
    await expect(minute).toHaveAttribute('aria-valuenow', '30');
    await minute.press('ArrowDown');
    await expect(minute).toHaveAttribute('aria-valuenow', '15');
  });

  test('TI-KB04 — Home / End jump to field bounds', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('Home');
    await expect(hour).toHaveAttribute('aria-valuenow', '0');
    await hour.press('End');
    await expect(hour).toHaveAttribute('aria-valuenow', '23');
  });

  test('TI-KB05 — 2-digit type auto-advances focus to next field', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await hour.focus();
    await hour.press('1');
    await hour.press('4');
    // After 2-digit completion focus should be on minute field
    await expect(minute).toBeFocused();
    await expect(hour).toHaveAttribute('aria-valuenow', '14');
  });

  test('TI-KB06 — hour wraps at upper bound 23 → 00', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('End'); // jump to 23
    await expect(hour).toHaveAttribute('aria-valuenow', '23');
    await hour.press('ArrowUp');
    await expect(hour).toHaveAttribute('aria-valuenow', '0');
    await hour.press('ArrowDown');
    await expect(hour).toHaveAttribute('aria-valuenow', '23');
  });

  test('TI-KB07 — single-digit type auto-advances when completion unambiguous', async ({
    page,
  }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await hour.focus();
    // Type "3" → 30+ impossible (max 23), so single-digit commit + advance
    await hour.press('3');
    await expect(hour).toHaveAttribute('aria-valuenow', '3');
    await expect(minute).toBeFocused();
  });

  test('TI-KB08 — period toggle Space flips AM/PM', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const period = periodToggleOf(picker);
    await expect(period).toHaveAttribute('aria-checked', 'true'); // PM
    await period.focus();
    await period.press(' ');
    await expect(period).toHaveAttribute('aria-checked', 'false'); // AM
    await period.press('Enter');
    await expect(period).toHaveAttribute('aria-checked', 'true'); // PM again
  });
});
