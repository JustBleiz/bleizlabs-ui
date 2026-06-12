/**
 * NumberInput form-participation spec (E04 audit remediation).
 *
 * Coverage:
 * - NI-F01 `name` lives on a hidden input; the visible input carries NO name
 *   (pre-fix the visible input submitted the locale-formatted display string)
 * - NI-F02 Submit carries the CANONICAL numeric value (period decimal, no
 *   grouping) while the display stays locale-formatted
 * - NI-F03 disabled NumberInput does not submit (hidden mirrors disabled)
 * - NI-F04 Empty value submits as an empty string (key present)
 * - NI-F05 Blur-clamped value is what submits (hidden mirrors the model)
 * - NI-F06 Focus+blur without edit does not mutate the model (the previous
 *   focus display used toFixed(decimals), ROUNDING the model — e.g. 1.5
 *   with decimals=0 became 2 on mere click-in/click-out)
 *
 * Demo route: /components/input-production (section "NumberInput form
 * submission" — pl-PL locale, name="amount", min 0 / max 99999.99).
 */

import { test, expect } from '@playwright/test';

test.describe('NumberInput — form participation', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-production');
  });

  const form = (page: import('@playwright/test').Page) =>
    page.getByRole('form', { name: 'Number form' });

  test('NI-F01 — name lives on the hidden input, not the visible one', async ({ page }) => {
    const f = form(page);
    const hidden = f.locator('input[type="hidden"][name="amount"]');
    await expect(hidden).toHaveCount(1);
    const visible = f.getByLabel('Amount (PLN)');
    await expect(visible).not.toHaveAttribute('name', 'amount');
    expect(await visible.getAttribute('name')).toBeNull();
  });

  test('NI-F02 — submit carries the canonical numeric value', async ({ page }) => {
    const f = form(page);
    // defaultValue 1234.56 displays locale-formatted in pl-PL.
    const visible = f.getByLabel('Amount (PLN)');
    await expect(visible).not.toHaveValue('1234.56'); // display IS formatted
    await f.getByRole('button', { name: 'Submit number form' }).click();
    // Pre-fix: FormData carried the display string ("1234,56 zł"-style).
    await expect(page.getByTestId('number-form-echo')).toContainText('= "1234.56"');
  });

  test('NI-F03 — disabled NumberInput does not submit', async ({ page }) => {
    const f = form(page);
    await f.getByRole('button', { name: 'Submit number form' }).click();
    await expect(page.getByTestId('number-form-echo')).toBeVisible();
    // The disabled field's key must be absent from FormData entirely.
    const keys = await f.evaluate((el) => Array.from(new FormData(el as HTMLFormElement).keys()));
    expect(keys).not.toContain('disabled-amount');
    expect(keys).toContain('amount');
  });

  test('NI-F04 — empty value submits as empty string (key present)', async ({ page }) => {
    const f = form(page);
    const visible = f.getByLabel('Amount (PLN)');
    // Keyboard-driven (fill() races the focus-handler display rewrite on
    // this controlled formatted input — focus first, then clear).
    await visible.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('Delete');
    await visible.blur();
    const value = await f.evaluate((el) => new FormData(el as HTMLFormElement).get('amount'));
    expect(value).toBe('');
  });

  test('NI-F05 — blur-clamped value is what submits', async ({ page }) => {
    const f = form(page);
    const visible = f.getByLabel('Amount (PLN)');
    // Keyboard-driven (see NI-F04 note).
    await visible.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('123456789'); // above max 99999.99
    await visible.blur();
    const value = await f.evaluate((el) => new FormData(el as HTMLFormElement).get('amount'));
    expect(value).toBe('99999.99');
  });

  test('NI-F06 — focus+blur without edit does not mutate the model', async ({ page }) => {
    // Quantity demo: decimals={0} — display rounds, the MODEL must not.
    const qty = page.getByLabel('Quantity');
    const hidden = page.locator('input[type="hidden"][name="qty"]');
    await qty.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('1.5');
    await qty.blur();
    // Display shows "2" (decimals=0 formatting) but the model stays exact.
    await expect(hidden).toHaveValue('1.5');
    // Pre-fix: mere focus re-displayed toFixed(0)="2" and blur committed 2.
    await qty.click();
    await qty.blur();
    await expect(hidden).toHaveValue('1.5');
  });
});
