/**
 * TagsInput regression — TI-R01..TI-R24, derived from react-tag-input +
 * react-tag-autocomplete closed issues + browser quirks documented in spec.
 *
 * Many cases functionally exercised by aria/keyboard/validate/paste/form
 * specs; this file consolidates the TI-R numbering + the cases that don't
 * naturally fit elsewhere.
 */

import { test, expect } from '@playwright/test';
import { inputBy, wrapperOf, chipsOf, liveRegionOf } from './_helpers';

const URL = '/components/tags-input';

test.describe('TagsInput — regression TI-R01..TI-R24', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-R01: empty submit on whitespace-only does NOT add chip', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('   ');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-R02: trailing comma in paste does not create empty chip', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await input.evaluate((el) => {
      const node = el as HTMLInputElement;
      const dt = new DataTransfer();
      dt.setData('text/plain', 'x,y,');
      node.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
      );
    });
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-R03: Backspace cascade — two Backspaces remove two chips', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.press('Backspace');
    await input.press('Backspace');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(0);
  });

  test('TI-R04: duplicate check is case-insensitive by default', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('REACT');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2); // not added
  });

  test('TI-R05: validate error message surfaces in onReject', async ({ page }) => {
    const input = inputBy(page, 'Lowercase tags');
    await input.click();
    await input.pressSequentially('Foo');
    await input.press('Enter');
    // Both visible badge AND live region carry the message (Phase 5 fix #4).
    await expect(page.getByText('Must be lowercase').first()).toBeVisible();
  });

  test('TI-R06: IME composition guard prevents commit on isComposing Enter', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.evaluate((el) => {
      const node = el as HTMLInputElement;
      node.focus();
      node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      node.value = 'kanji';
      node.dispatchEvent(new Event('input', { bubbles: true }));
      const kd = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      Object.defineProperty(kd, 'isComposing', { value: true });
      node.dispatchEvent(kd);
      node.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    });
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2); // unchanged
  });

  test('TI-R07: chip × button focus returns to typing input after removal', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const removeBtn = wrap.locator('button[aria-label="Remove react"]');
    await removeBtn.click();
    await expect(input).toBeFocused();
  });

  test('TI-R08: wrapper click focuses typing input (skips chip × clicks)', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    await wrap.click({ position: { x: 5, y: 5 } });
    await expect(input).toBeFocused();
  });

  test('TI-R09: tab into input then Backspace edits text, does NOT delete chip', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('foo');
    await input.press('Backspace');
    await expect(input).toHaveValue('fo');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-R10: addOnBlur commits pending text', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('committed');
    // Blur input by clicking elsewhere.
    await input.page().locator('h1').click();
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
  });

  test('TI-R11: pasting single word (no delimiter) leaves text pending', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.evaluate((el) => {
      const node = el as HTMLInputElement;
      const dt = new DataTransfer();
      dt.setData('text/plain', 'singleword');
      node.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
      );
    });
    // Pending text stays in input — not committed automatically.
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-R12: maxTags boundary inclusive (5 means 5 accepted)', async ({ page }) => {
    const input = inputBy(page, 'Limited tags');
    await input.click();
    // Start with 2, add 3 more.
    for (const t of ['three', 'four', 'five']) {
      await input.pressSequentially(t);
      await input.press('Enter');
    }
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(5);
  });

  test('TI-R13: disabled wrapper blocks typing', async ({ page }) => {
    const input = inputBy(page, 'Disabled tags');
    await expect(input).toBeDisabled();
  });

  test('TI-R14: disabled chip × buttons reject click', async ({ page }) => {
    const input = inputBy(page, 'Disabled tags');
    const wrap = wrapperOf(input);
    const removeBtn = wrap.locator('button[aria-label="Remove readonly"]');
    await expect(removeBtn).toBeDisabled();
  });

  test('TI-R15: live region announces tag added', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const live = liveRegionOf(wrap);
    await input.click();
    await input.pressSequentially('hello');
    await input.press('Enter');
    await expect(live).toContainText('Added: hello');
  });

  test('TI-R16: live region announces tag removed', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const live = liveRegionOf(wrap);
    const removeBtn = wrap.locator('button[aria-label="Remove react"]');
    await removeBtn.click();
    await expect(live).toContainText('Removed: react');
  });

  test('TI-R17: allowDuplicates with identical tags renders both chips', async ({ page }) => {
    const input = inputBy(page, 'Allow duplicate tags');
    await input.click();
    await input.pressSequentially('dup');
    await input.press('Enter');
    await input.pressSequentially('dup');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-R18: paste with newlines splits per line', async ({ page }) => {
    const input = inputBy(page, 'Paste split tags');
    await input.evaluate((el) => {
      const node = el as HTMLInputElement;
      const dt = new DataTransfer();
      dt.setData('text/plain', 'a\nb\nc');
      node.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
      );
    });
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(3);
  });

  test('TI-R19: SSR hydration — no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    expect(
      errors.filter((e) => /hydrat|window is not defined/i.test(e)),
    ).toHaveLength(0);
  });

  test('TI-R20: removing chip preserves chip order', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    // Add 3 more so we have: react, next.js, a, b, c
    await input.click();
    for (const t of ['a', 'b', 'c']) {
      await input.pressSequentially(t);
      await input.press('Enter');
    }
    // Remove "next.js" (index 1).
    const removeBtn = wrap.locator('button[aria-label="Remove next.js"]');
    await removeBtn.click();
    // Order should be: react, a, b, c.
    const chips = await chipsOf(wrap).allTextContents();
    expect(chips.join('|')).toMatch(/react.*a.*b.*c/);
  });

  test('TI-R21: typing comma inline commits without form submit', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('inline,');
    const wrap = wrapperOf(input);
    await expect(
      wrap.locator('[role="listitem"]').filter({ hasText: 'inline' }),
    ).toBeVisible();
  });

  test('TI-R22: empty Enter does not crash form submit when not in form', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.press('Enter');
    // Page still loaded.
    await expect(input.page().locator('h1')).toBeVisible();
  });

  test('TI-R23: trim default removes leading + trailing spaces', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('  spaced  ');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(wrap.getByText('spaced', { exact: true })).toBeVisible();
  });

  test('TI-R24: Backspace twice in a row removes two consecutive chips', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.press('Backspace');
    await input.press('Backspace');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(0);
  });

  test('TI-R25: live region announces consumer validate message, not enum code', async ({ page }) => {
    // Phase 4 Evaluator IMPORTANT #4 — was announcing "Tag rejected:
    // validate-failed" (enum) instead of consumer-supplied message ("Must
    // be lowercase"). Fix: prefer `rejection.message ?? rejection.reasons[0]`.
    const input = inputBy(page, 'Lowercase tags');
    const wrap = wrapperOf(input);
    const live = liveRegionOf(wrap);
    await input.click();
    await input.pressSequentially('UpperCase');
    await input.press('Enter');
    await expect(live).toContainText('Must be lowercase');
    await expect(live).not.toContainText('validate-failed');
  });
});
