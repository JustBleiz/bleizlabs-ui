/**
 * TimePicker form integration spec.
 *
 * Coverage:
 * - TP-FRM01 name prop renders hidden input
 * - TP-FRM02 hidden input mirrors current ISO
 * - TP-FRM03 required attribute lands on hidden input
 * - TP-FRM04 commit via listbox click updates hidden input
 * - TP-FRM05 form submission captures current value
 */

import { test, expect } from '@playwright/test';
import { hiddenInputOf, openPicker, optionByValue, pickerBy } from './_helpers';

test.describe('TimePicker — form integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-picker');
  });

  test('TP-FRM01 — hidden input exists when name set', async ({ page }) => {
    const picker = pickerBy(page, 'Appointment');
    await expect(hiddenInputOf(picker, 'appointment')).toHaveCount(1);
  });

  test('TP-FRM02 — hidden input mirrors defaultValue', async ({ page }) => {
    const picker = pickerBy(page, 'Appointment');
    await expect(hiddenInputOf(picker, 'appointment')).toHaveValue('10:00');
  });

  test('TP-FRM03 — required attribute lands on hidden input', async ({ page }) => {
    const picker = pickerBy(page, 'Appointment');
    const hidden = hiddenInputOf(picker, 'appointment');
    const requiredAttr = await hidden.getAttribute('required');
    expect(requiredAttr).not.toBeNull();
  });

  test('TP-FRM04 — listbox click updates hidden input ISO', async ({ page }) => {
    const picker = pickerBy(page, 'Appointment');
    await openPicker(picker);
    await optionByValue(page, 'h', '14').dispatchEvent('click');
    await expect(hiddenInputOf(picker, 'appointment')).toHaveValue(/^14:/);
  });

  test('TP-FRM05 — form submission captures value', async ({ page }) => {
    const picker = pickerBy(page, 'Appointment');
    await openPicker(picker);
    await optionByValue(page, 'h', '15').dispatchEvent('click');
    // Close popover by Escape
    await page.keyboard.press('Escape');
    const button = page.locator('button[type="submit"]');
    await button.click();
    const caption = page.locator('code', { hasText: 'appointment=15:00' });
    await expect(caption).toBeVisible();
  });
});
