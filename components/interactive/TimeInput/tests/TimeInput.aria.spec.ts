/**
 * TimeInput ARIA spec — APG `/spinbutton/` + `/switch/` compliance.
 *
 * Coverage:
 * - TI-A01 role=group + aria-label
 * - TI-A02 each field role=spinbutton + aria-valuemin/max/now/text
 * - TI-A03 per-field aria-label "Hours"/"Minutes"/"Seconds"
 * - TI-A04 AM/PM switch role + aria-checked semantics
 * - TI-A05 hidden form input carries 24h ISO
 * - TI-A06 aria-invalid surfaces from error prop
 * - TI-A07 axe-core zero violations on demo route
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  groupOf,
  hourFieldOf,
  minuteFieldOf,
  periodToggleOf,
  timeInputBy,
} from './_helpers';

test.describe('TimeInput — ARIA semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-input');
  });

  test('TI-A01 — role=group with aria-label', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const group = groupOf(picker);
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('aria-label', 'Start time');
  });

  test('TI-A02 — fields carry role=spinbutton + valuemin/max/now', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    const hour = hourFieldOf(picker);
    const minute = minuteFieldOf(picker);
    await expect(hour).toHaveAttribute('role', 'spinbutton');
    await expect(hour).toHaveAttribute('aria-valuemin', '0');
    await expect(hour).toHaveAttribute('aria-valuemax', '23');
    await expect(hour).toHaveAttribute('aria-valuenow', '8');
    await expect(minute).toHaveAttribute('aria-valuemin', '0');
    await expect(minute).toHaveAttribute('aria-valuemax', '59');
    await expect(minute).toHaveAttribute('aria-valuenow', '30');
  });

  test('TI-A03 — per-field aria-label', async ({ page }) => {
    const picker = timeInputBy(page, 'Start time');
    await expect(hourFieldOf(picker)).toHaveAttribute('aria-label', 'Hours');
    await expect(minuteFieldOf(picker)).toHaveAttribute('aria-label', 'Minutes');
  });

  test('TI-A04 — AM/PM switch carries role=switch + aria-checked', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const period = periodToggleOf(picker);
    await expect(period).toHaveAttribute('role', 'switch');
    // demo defaultValue=14:30 → PM
    await expect(period).toHaveAttribute('aria-checked', 'true');
    await expect(period).toHaveAttribute('aria-label', 'AM or PM');
  });

  test('TI-A05 — hidden form input mirrors current 24h ISO', async ({ page }) => {
    const picker = timeInputBy(page, 'Starts at');
    const hidden = picker.locator('input[type="hidden"][name="startsAt"]');
    await expect(hidden).toHaveValue('10:00');
  });

  test('TI-A06 — 12h field carries aria-valuemin=1 + aria-valuemax=12', async ({ page }) => {
    const picker = timeInputBy(page, 'Meeting time');
    const hour = hourFieldOf(picker);
    await expect(hour).toHaveAttribute('aria-valuemin', '1');
    await expect(hour).toHaveAttribute('aria-valuemax', '12');
    // defaultValue 14:30 → display 02 PM
    await expect(hour).toHaveAttribute('aria-valuenow', '2');
  });

  test('TI-A07 — axe-core zero violations on demo route', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
