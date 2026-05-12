/**
 * DateTimePicker form integration spec.
 *
 * Coverage:
 * - DT-FRM01 name prop renders hidden input
 * - DT-FRM02 hidden input mirrors defaultValue as ISO 8601 local
 * - DT-FRM03 required attribute lands on hidden input
 * - DT-FRM04 form submission captures current ISO
 */

import { test, expect } from '@playwright/test';
import { hiddenInputOf, pickerBy } from './_helpers';

test.describe('DateTimePicker — form integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-time-picker');
  });

  test('DT-FRM01 — hidden input exists when name set', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    await expect(hiddenInputOf(picker, 'meetingAt')).toHaveCount(1);
  });

  test('DT-FRM02 — hidden input mirrors defaultValue as ISO 8601 local', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    await expect(hiddenInputOf(picker, 'meetingAt')).toHaveValue('2026-05-15T10:00:00');
  });

  test('DT-FRM03 — required attribute lands on hidden input', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting at');
    const hidden = hiddenInputOf(picker, 'meetingAt');
    const requiredAttr = await hidden.getAttribute('required');
    expect(requiredAttr).not.toBeNull();
  });

  test('DT-FRM04 — form submission captures value', async ({ page }) => {
    const button = page.locator('button[type="submit"]');
    await button.click();
    const caption = page.locator('code', { hasText: 'meetingAt=2026-05-15T10:00:00' });
    await expect(caption).toBeVisible();
  });
});
