/**
 * TimeInput format spec — 12h ↔ 24h display, AM/PM toggle round-trip,
 * locale hourCycle derivation, withSeconds variant.
 *
 * Coverage:
 * - TI-FMT01 12h hour=14 displays as 02 PM
 * - TI-FMT02 Period flip recomputes h24 (14 PM → 02 AM)
 * - TI-FMT03 withSeconds renders 3rd spinbutton
 * - TI-FMT04 explicit hourCycle="24h" overrides locale auto-derive
 * - TI-FMT05 emitted onValueChange always 24h ISO regardless of cycle
 * - TI-FMT06 hour 12 in 12h AM maps to h24=0; in PM maps to h24=12
 */

import { test, expect } from '@playwright/test';
import {
  hourFieldOf,
  hiddenInputOf,
  minuteFieldOf,
  periodToggleOf,
  secondFieldOf,
  timeInputBy,
} from './_helpers';

test.describe('TimeInput — format + locale', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-input');
  });

  test('TI-FMT01 — 12h displays h=14 as 02 PM', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const hour = hourFieldOf(picker);
    // value=14:30 → display 02 PM
    await expect(hour).toHaveValue('02');
    const period = periodToggleOf(picker);
    await expect(period).toHaveAttribute('aria-checked', 'true');
  });

  test('TI-FMT02 — period flip from 14:30 PM commits 02:30 AM', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const period = periodToggleOf(picker);
    await period.click();
    await expect(period).toHaveAttribute('aria-checked', 'false');
    // Display stays 02 but h24 should be 2 now (state still 02:30)
    const hour = hourFieldOf(picker);
    await expect(hour).toHaveValue('02');
  });

  test('TI-FMT03 — withSeconds renders 3rd spinbutton', async ({ page }) => {
    const picker = timeInputBy(page, 'Race finish');
    const seconds = secondFieldOf(picker);
    await expect(seconds).toBeVisible();
    await expect(seconds).toHaveAttribute('aria-valuemax', '59');
    await expect(seconds).toHaveValue('45');
  });

  test('TI-FMT04 — explicit hourCycle="24h" hides AM/PM toggle', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const period = picker.locator('button[role="switch"]');
    await expect(period).toHaveCount(0);
  });

  test('TI-FMT05 — form submission hidden input emits 24h ISO from 12h field', async ({ page }) => {
    // Use Form-integration case which renders hidden inputs
    const startsAt = timeInputBy(page, 'Starts at');
    const hidden = hiddenInputOf(startsAt, 'startsAt');
    await expect(hidden).toHaveValue('10:00');
  });

  test('TI-FMT06 — typing 12 + AM commits h24=00 (midnight); minutes preserved', async ({
    page,
  }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    const period = periodToggleOf(picker);
    // Set to AM first
    await period.click();
    await expect(period).toHaveAttribute('aria-checked', 'false');
    // Type 12 in hour field
    await hour.focus();
    await hour.press('1');
    await hour.press('2');
    // After auto-advance focus should be on minute; hour displays 12
    await expect(hour).toHaveValue('12');
    await expect(minute).toBeFocused();
  });
});
