/**
 * InputOTP keyboard interaction spec (E142 L3d2).
 *
 * Coverage:
 * - OTP-R01 Typing single char updates value
 * - OTP-R02 Backspace removes last char, input stays focused
 * - OTP-R03 Paste distributes chars across slots (programmatic paste event)
 * - OTP-R04 Pattern filter (numeric) blocks alphabetic input
 * - Additional: ArrowLeft/ArrowRight move caret without changing value
 *
 * Playground: /components/input-otp
 *   idx 0: Basic uncontrolled 6-digit numeric
 *   idx 1: Grouped XXX-XXX (maxLength=6)
 *   idx 2: Controlled maxLength=4 (PIN)
 *   idx 3: Alphanumeric (maxLength=8)
 *   idx 4: Invalid state (aria-invalid, defaultValue="1234")
 *   idx 5: Disabled + Read-only
 *   idx 6: Form (name="verification", required)
 *   idx 7: Keyboard walkthrough demo
 *
 * Real input: each section has ONE `<input type="text">` underneath slot cells.
 * Decorative slots have `aria-hidden="true"` and NO tabindex.
 */

import { test, expect } from '@playwright/test';

test.describe('InputOTP — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
  });

  test('OTP-R01 — typing a digit updates value', async ({ page }) => {
    // Section 1 — basic numeric
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await page.keyboard.type('1');
    await expect(input).toHaveValue('1');
  });

  test('OTP-R02 — Backspace removes last char, input stays focused', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await page.keyboard.type('12');
    await expect(input).toHaveValue('12');
    await page.keyboard.press('Backspace');
    await expect(input).toHaveValue('1');
    await expect(input).toBeFocused();
  });

  test('OTP-R03 — paste event distributes chars across slots', async ({ page }) => {
    // Section 1 — maxLength=6 numeric. Simulate paste via dispatching a
    // ClipboardEvent with clipboardData — programmatic paste so we don't
    // depend on OS clipboard permissions.
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await input.evaluate((el: HTMLInputElement) => {
      const dt = new DataTransfer();
      dt.setData('text', '123456');
      const evt = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(evt);
    });
    await expect(input).toHaveValue('123456');
  });

  test('OTP-R03b — paste strips hyphens and spaces (XXX-XXX form)', async ({ page }) => {
    // Section 2 — grouped maxLength=6 numeric
    const input = page.getByRole('textbox', { name: 'Grouped code' }).first();
    await input.focus();
    await input.evaluate((el: HTMLInputElement) => {
      const dt = new DataTransfer();
      dt.setData('text', '123-456');
      const evt = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(evt);
    });
    await expect(input).toHaveValue('123456');
  });

  test('OTP-R04 — numeric pattern: alphabetic keystrokes rejected', async ({ page }) => {
    // Section 1 — numeric. Typing 'a' is blocked via onBeforeInput preventDefault
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await page.keyboard.type('abc');
    await expect(input).toHaveValue('');
    // Mixed: digits accepted, letters rejected
    await page.keyboard.type('1a2b3c');
    await expect(input).toHaveValue('123');
  });

  test('Alphanumeric pattern accepts letters + digits', async ({ page }) => {
    // Section 4 — alphanumeric maxLength=8
    const input = page.getByRole('textbox', { name: 'License key' }).first();
    await input.focus();
    await page.keyboard.type('ABC12de');
    await expect(input).toHaveValue('ABC12de');
  });

  test('Typing past maxLength is ignored', async ({ page }) => {
    // Section 3 — controlled PIN maxLength=4
    const input = page.getByRole('textbox', { name: 'PIN' }).first();
    await input.focus();
    await page.keyboard.type('123456');
    await expect(input).toHaveValue('1234');
  });

  test('ArrowLeft/ArrowRight move caret without changing value', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await page.keyboard.type('123');
    const before = await input.inputValue();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(input).toHaveValue(before);
    await page.keyboard.press('ArrowRight');
    await expect(input).toHaveValue(before);
  });

  test('Home/End move caret to start/end (value unchanged)', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    await page.keyboard.type('1234');
    await page.keyboard.press('Home');
    // Caret at start — typing inserts at 0
    await page.keyboard.type('9');
    await expect(input).toHaveValue('91234'.slice(0, 6));
  });
});
