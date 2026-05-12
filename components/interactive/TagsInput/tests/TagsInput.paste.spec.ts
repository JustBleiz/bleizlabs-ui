/**
 * TagsInput paste spec — paste-split on delimiters + edge cases.
 *
 * Total: 6 cases (TI-P01..TI-P06).
 */

import { test, expect } from '@playwright/test';
import { inputBy, wrapperOf, chipsOf } from './_helpers';

const URL = '/components/tags-input';

async function paste(locator: import('@playwright/test').Locator, text: string): Promise<void> {
  // Synthesize a paste event with text/plain payload.
  await locator.focus();
  await locator.evaluate((el, txt) => {
    const node = el as HTMLInputElement;
    const dt = new DataTransfer();
    dt.setData('text/plain', txt);
    const event = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    node.dispatchEvent(event);
  }, text);
}

test.describe('TagsInput — paste', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-P01: paste "a, b, c" splits into 3 chips', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'a, b, c');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
  });

  test('TI-P02: paste with newlines splits per line', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'red\ngreen\nblue');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
  });

  test('TI-P03: paste with mixed delimiters (comma + semicolon + newline)', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'one,two;three\nfour');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(4);
  });

  test('TI-P04: paste trims each part (default trim=true)', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'  alpha ,  beta  ');
    const wrap = wrapperOf(input);
    await expect(wrap.getByText('alpha', { exact: true })).toBeVisible();
    await expect(wrap.getByText('beta', { exact: true })).toBeVisible();
  });

  test('TI-P05: paste with empty parts (trailing comma) skips empties', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'x,,y,');
    const wrap = wrapperOf(input);
    // 'x' + 'y' — 2 chips, not 4 (empty between/trailing dropped).
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-P06: single-part paste (no delimiter) falls through to native input', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await paste(input,'singleword');
    const wrap = wrapperOf(input);
    // No chip created — text remains in input pending Enter / blur.
    await expect(chipsOf(wrap)).toHaveCount(0);
  });
});
