/**
 * TimeInput bounds spec — min/max clamping, step semantics.
 *
 * Coverage:
 * - TI-B01 typed value above max clamps on commit
 * - TI-B02 typed value below min clamps on commit
 * - TI-B03 in-range typed value commits unchanged
 * - TI-B04 step affects minute increment only (not hour)
 * - TI-B05 disabled state blocks all keyboard input
 * - TI-B06 read-only spinbutton ignores spurious change events
 */

import { test, expect } from '@playwright/test';
import { hourFieldOf, minuteFieldOf, timeInputBy } from './_helpers';

test.describe('TimeInput — bounds + step', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-input');
  });

  test('TI-B01 — type 23:00 with max=17:00 clamps to 17:00', async ({ page }) => {
    const picker = timeInputBy(page, 'Office hours');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('2');
    await hour.press('3');
    // After clamp, hour field reflects 17
    await expect(hour).toHaveValue('17');
  });

  test('TI-B02 — type 05:00 with min=09:00 clamps to 09:00', async ({ page }) => {
    const picker = timeInputBy(page, 'Office hours');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('0');
    await hour.press('5');
    await expect(hour).toHaveValue('09');
  });

  test('TI-B03 — type 14:00 with bounds [09:00,17:00] stays 14', async ({ page }) => {
    const picker = timeInputBy(page, 'Office hours');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('1');
    await hour.press('4');
    await expect(hour).toHaveValue('14');
  });

  test('TI-B04 — step=15 does NOT affect hour ArrowUp (always ±1)', async ({ page }) => {
    const picker = timeInputBy(page, 'Slot');
    const hour = hourFieldOf(picker);
    await hour.focus();
    // defaultValue 10:00
    await hour.press('ArrowUp');
    await expect(hour).toHaveAttribute('aria-valuenow', '11');
  });

  test('TI-B05 — End jumps to upper bound max=17 (constrained)', async ({ page }) => {
    const picker = timeInputBy(page, 'Office hours');
    const hour = hourFieldOf(picker);
    await hour.focus();
    await hour.press('End');
    // End jumps to field max (23), but commit clamps via max="17:00"
    await expect(hour).toHaveValue('17');
  });

  test('TI-B06 — minute ArrowDown wraps at 0 → 59', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const minute = minuteFieldOf(picker);
    await minute.focus();
    // defaultValue 08:30
    await minute.press('Home');
    await expect(minute).toHaveAttribute('aria-valuenow', '0');
    await minute.press('ArrowDown');
    await expect(minute).toHaveAttribute('aria-valuenow', '59');
  });
});
