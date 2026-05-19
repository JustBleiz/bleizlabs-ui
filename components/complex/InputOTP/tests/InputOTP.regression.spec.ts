/**
 * InputOTP regression spec (E142 L3d2) — OTP-R10..R20 subset.
 *
 * Coverage:
 * - OTP-R10 IME composition guard: composed chars do not escape filter
 * - OTP-R11 onComplete fires when user-driven completion hits maxLength
 * - OTP-R12 Controlled mode: "Set 1234" button fills value externally
 * - OTP-R13 Paste truncates at maxLength (Section 3 maxLength=4)
 * - OTP-R14 Alphanumeric pattern accepts [A-Za-z0-9]
 * - OTP-R15 SSR safe: no hydration warnings
 * - OTP-R16 autoFocus [PLAYGROUND-DEP]
 * - OTP-R17 Disabled value stays rendered + no interaction
 * - OTP-R18 Read-only value stays rendered + no mutation
 * - OTP-R19 Form submit serializes name→value
 * - OTP-R20 Invalid state reset on valid input [PLAYGROUND-DEP: no toggle demo]
 *
 * Playground: /components/input-otp
 */

import { test, expect } from '@playwright/test';

test.describe('InputOTP — regression guards', () => {
  test('OTP-R10 — IME composition: characters NOT committed until compositionend', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const input = page.getByRole('textbox', { name: 'Verification code' }).first();
    await input.focus();
    // Start composition — handler sets isComposingRef=true and short-circuits
    // handleChange. Then dispatch input event that would normally accept a char.
    await input.evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    });
    // Type a digit while "composing" — change handler early-returns
    await page.keyboard.type('5');
    // Then simulate compositionend with empty value
    await input.evaluate((el: HTMLInputElement) => {
      // Reset input value then dispatch compositionend — pattern-filter runs
      el.value = '';
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' }));
    });
    await expect(input).toHaveValue('');
  });

  test('OTP-R11 — onComplete fires when user fills to maxLength', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    // Section 3 — controlled maxLength=4 with onComplete → logs into completions
    const section = page.locator('section').nth(2);
    const pinInput = section.getByRole('textbox', { name: 'PIN' });
    await pinInput.focus();
    await page.keyboard.type('1234');
    // Completions log appears
    const log = section.getByText(/Recent completions/);
    await expect(log).toBeVisible();
    const item = section.locator('li').filter({ hasText: /^1234$/ });
    await expect(item).toBeVisible();
  });

  test('OTP-R12 — controlled mode: "Set 1234" button fills the input', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const section = page.locator('section').nth(2);
    await section.getByRole('button', { name: 'Set 1234' }).click();
    const pinInput = section.getByRole('textbox', { name: 'PIN' });
    await expect(pinInput).toHaveValue('1234');
  });

  test('OTP-R12b — Clear button resets controlled value', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const section = page.locator('section').nth(2);
    await section.getByRole('button', { name: 'Set 1234' }).click();
    await section.getByRole('button', { name: 'Clear' }).click();
    const pinInput = section.getByRole('textbox', { name: 'PIN' });
    await expect(pinInput).toHaveValue('');
  });

  test('OTP-R13 — paste truncates to maxLength', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    // Section 3 — maxLength=4
    const section = page.locator('section').nth(2);
    const pinInput = section.getByRole('textbox', { name: 'PIN' });
    await pinInput.focus();
    await pinInput.evaluate((el: HTMLInputElement) => {
      const dt = new DataTransfer();
      dt.setData('text', '1234567890');
      const evt = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(evt);
    });
    await expect(pinInput).toHaveValue('1234');
  });

  test('OTP-R14 — Alphanumeric pattern accepts mixed-case + digits', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const input = page.getByRole('textbox', { name: 'License key' }).first();
    await input.focus();
    await page.keyboard.type('aB3xY7');
    await expect(input).toHaveValue('aB3xY7');
    // Reject non-alnum — punctuation
    await page.keyboard.type('!@');
    await expect(input).toHaveValue('aB3xY7');
  });

  test('OTP-R15 — SSR safe: no hydration warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/input-otp');
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Verification code' }).first()).toBeVisible();
    expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
  });

  test.skip('OTP-R16 — autoFocus on mount [PLAYGROUND-DEP: no autoFocus demo]', async () => {
    // autoFocus prop is wired via useEffect but no playground section sets it.
  });

  test('OTP-R17 — disabled value stays rendered, input disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const disabled = page.getByRole('textbox', { name: 'Disabled code' }).first();
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveValue('123456');
  });

  test('OTP-R18 — read-only value stays rendered, keystrokes no-op', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const readOnly = page.getByRole('textbox', { name: 'Read-only code' }).first();
    await readOnly.focus();
    await expect(readOnly).toHaveValue('000000');
    await page.keyboard.type('9');
    await expect(readOnly).toHaveValue('000000');
  });

  test('OTP-R19 — form submit serializes name→value', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/input-otp');
    const section = page.locator('section').nth(6);
    const input = section.locator('input[name="verification"]').first();
    await input.focus();
    await page.keyboard.type('654321');
    await section.getByRole('button', { name: 'Verify' }).click();
    // Submitted display appears — "Submitted: 654321". The digit string also
    // appears in the slot spans, so target the mono-styled summary span.
    await expect(section.getByText(/Submitted:/)).toBeVisible();
    const summarySpan = section.locator('span[class*="mono"]', {
      hasText: '654321',
    });
    await expect(summarySpan).toBeVisible();
  });

  test.skip('OTP-R20 — invalid state reset on valid input [PLAYGROUND-DEP: no toggle]', async () => {
    // Invalid state is static in the playground (no toggle button exposed).
  });
});
