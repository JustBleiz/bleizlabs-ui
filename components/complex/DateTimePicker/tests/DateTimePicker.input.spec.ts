/**
 * DateTimePicker input keyboard spec.
 *
 * Coverage:
 * - DT-IN01 Alt+ArrowDown opens dialog
 * - DT-IN02 Alt+ArrowUp closes dialog
 * - DT-IN03 Escape closes dialog
 * - DT-IN04 Click on input opens dialog
 * - DT-IN05 Typed "YYYY-MM-DDTHH:MM" + Enter commits
 * - DT-IN06 Invalid typed value sets aria-invalid
 * - DT-IN07 Empty + Enter clears value (when not required)
 */

import { test, expect } from '@playwright/test';
import { dialogOf, inputOf, pickerBy } from './_helpers';

test.describe('DateTimePicker — input keyboard model', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-time-picker');
  });

  test('DT-IN01 — Alt+ArrowDown opens dialog', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  test('DT-IN02 — Alt+ArrowUp closes dialog', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.press('Alt+ArrowUp');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('DT-IN03 — Escape closes dialog', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await input.focus();
    await input.press('Escape');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('DT-IN04 — Click on input opens dialog', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.click();
    await expect(dialogOf(page)).toBeVisible();
  });

  test('DT-IN05 — Typed ISO + Enter commits + closes', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('2026-06-01T14:30');
    await input.press('Enter');
    // Parser accepts ISO T input; display normalizes to space separator (0.24.0)
    await expect(input).toHaveValue('2026-06-01 14:30');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('DT-IN06 — Invalid ISO sets aria-invalid', async ({ page }) => {
    const picker = pickerBy(page, 'Start datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('not-a-date');
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('DT-IN07 — Empty + Enter clears value (when not required)', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting datetime');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('');
    await input.press('Enter');
    await expect(input).toHaveValue('');
  });
});
