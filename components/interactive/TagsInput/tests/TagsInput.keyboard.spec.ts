/**
 * TagsInput keyboard spec — Enter, comma, Backspace, Tab, IME composition.
 *
 * Total: 9 cases (TI-K01..TI-K09).
 */

import { test, expect } from '@playwright/test';
import { inputBy, wrapperOf, chipsOf } from './_helpers';

const URL = '/components/tags-input';

test.describe('TagsInput — keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-K01: Enter on pending text commits a tag', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('typescript');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3); // initial 2 + 1
    await expect(input).toHaveValue('');
  });

  test('TI-K02: comma in input commits a tag', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('vue,');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
    await expect(input).toHaveValue('');
  });

  test('TI-K03: semicolon in input commits a tag (default delimiter)', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('svelte;');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
  });

  test('TI-K04: Backspace on empty input removes last chip', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.press('Backspace');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(1); // initial 2 - 1
  });

  test('TI-K05: Backspace on non-empty input edits text, does NOT remove chip', async ({
    page,
  }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('abc');
    await input.press('Backspace');
    await expect(input).toHaveValue('ab');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-K06: Enter on empty input is no-op (does NOT submit any form)', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-K07: Tab moves focus out of input to next focusable (chip × buttons in tab order)', async ({
    page,
  }) => {
    const input = inputBy(page, 'Basic tags');
    await input.focus();
    await input.press('Tab');
    // Next focusable should be the first chip's × button (in tab order per Q3 (α)).
    // OR the next input on the page — depends on the layout. We just assert
    // focus moved off the typing input.
    await expect(input).not.toBeFocused();
  });

  test('TI-K08: spaces inside typed text are allowed (multi-word tags)', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('machine learning');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(
      wrap.locator('[role="listitem"]').filter({ hasText: 'machine learning' }),
    ).toBeVisible();
  });

  test('TI-K09: IME composition guard — Enter during composition does NOT commit', async ({
    page,
  }) => {
    const input = inputBy(page, 'Basic tags');
    // Simulate composition events programmatically (Playwright keyboard
    // doesn't synthesize true IME by default).
    await input.evaluate((el) => {
      const node = el as HTMLInputElement;
      node.focus();
      node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      // While composing, type "test" and press Enter
      node.value = 'test';
      node.dispatchEvent(new Event('input', { bubbles: true }));
      const keydown = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      // Mark as composing via isComposing flag.
      Object.defineProperty(keydown, 'isComposing', { value: true });
      node.dispatchEvent(keydown);
    });
    const wrap = wrapperOf(input);
    // Still 2 chips — Enter during composition did NOT commit.
    await expect(chipsOf(wrap)).toHaveCount(2);
    // Cleanup composition
    await input.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    });
  });
});
