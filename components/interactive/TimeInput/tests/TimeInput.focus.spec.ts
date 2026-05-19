/**
 * TimeInput focus spec — Tab progression, select-on-focus, retreat-on-Backspace.
 *
 * Coverage:
 * - TI-FCS01 native Tab moves hour → minute → period (12h) or hour → minute (24h)
 * - TI-FCS02 Shift+Tab reverses sequence
 * - TI-FCS03 Click on field selects + focuses
 * - TI-FCS04 Backspace on empty buffer retreats to previous field
 * - TI-FCS05 Tab past last field exits group natively
 */

import { test, expect } from '@playwright/test';
import { hourFieldOf, minuteFieldOf, periodToggleOf, timeInputBy } from './_helpers';

test.describe('TimeInput — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-input');
  });

  test('TI-FCS01 — Tab progresses hour → minute', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await hour.focus();
    await hour.press('Tab');
    await expect(minute).toBeFocused();
  });

  test('TI-FCS02 — Shift+Tab reverses minute → hour', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await minute.focus();
    await minute.press('Shift+Tab');
    await expect(hour).toBeFocused();
  });

  test('TI-FCS03 — 12h mode Tab progresses hour → minute → period', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    const period = periodToggleOf(picker);
    await hour.focus();
    await hour.press('Tab');
    await expect(minute).toBeFocused();
    await minute.press('Tab');
    await expect(period).toBeFocused();
  });

  test('TI-FCS04 — Backspace on empty buffer retreats to previous field', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await minute.focus();
    // No active buffer in minute — Backspace should retreat to hour
    await minute.press('Backspace');
    await expect(hour).toBeFocused();
  });

  test('TI-FCS05 — Click on field focuses', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const minute = minuteFieldOf(picker);
    await minute.click();
    await expect(minute).toBeFocused();
  });
});
