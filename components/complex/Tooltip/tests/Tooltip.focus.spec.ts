/**
 * Tooltip focus management spec — modeless contract (E19).
 *
 * Focus contract:
 * - Tooltip is MODELESS — trigger retains focus at all times
 * - Tooltip does NOT own focus, does NOT trap focus, does NOT move focus into content
 */

import { test, expect } from '@playwright/test';

test.describe('Tooltip — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tooltip');
  });

  test('trigger retains focus after tooltip shows (modeless contract)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(trigger).toBeFocused();
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).toBe('BUTTON');
  });

  test('no focus move into tooltip body', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    // Next Tab must advance to another real control, never into tooltip body
    await page.keyboard.press('Tab');
    const activeRole = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    expect(activeRole).not.toBe('tooltip');
  });

  test.skip('disabled native button — no tooltip [PLAYGROUND-DEP: disabled-button demo]', async () => {
    // Playground has no disabled-button demo. Native disabled suppresses events
    // → tooltip never shows. Unskip if a disabled-button tooltip scenario lands.
  });

  test.skip('aria-disabled button — tooltip shows [PLAYGROUND-DEP: aria-disabled demo]', async () => {
    // Playground has no aria-disabled demo. aria-disabled='true' does NOT stop
    // events; tooltip should show. Unskip if a dedicated scenario lands.
  });

  test.skip('programmatic focus restore from Dialog does not re-show [PLAYGROUND-DEP: Dialog E15]', async () => {
    // Dialog closes → focus restored to tooltip trigger → tooltip should NOT
    // immediately re-show (Radix #617). Requires nested Dialog + Tooltip.
  });

  test('tooltip hides on document visibilitychange (Radix #705 / #2665)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });

  test('tooltip hides on window blur', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });
});
