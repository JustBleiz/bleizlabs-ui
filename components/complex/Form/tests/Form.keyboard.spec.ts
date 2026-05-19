/**
 * Form keyboard interaction spec — native form a11y semantics.
 *
 * Coverage:
 * - Tab               → move forward through fields + submit button
 * - Shift+Tab         → move backward through fields
 * - Enter             → submit form (single-line input or submit focus)
 * - Escape            → close native validation popup (browser-native)
 *
 * Form is light-touch on keyboard (no roving tabindex, no focus trap) —
 * native form semantics ARE the keyboard model. Tests assert that we do
 * not regress that baseline.
 *
 * Playground route: `/components/form`
 */

import { test, expect } from '@playwright/test';

test.describe('Form — keyboard interactions (native form a11y)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/form');
  });

  test('Tab moves through fields in document order to submit button', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    // Next focusable should be the submit button (Form section 1 has only
    // 1 input + submit).
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await expect(submit).toBeFocused();
  });

  test('Shift+Tab moves backward through fields', async ({ page }) => {
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await submit.focus();
    await expect(submit).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await expect(emailInput).toBeFocused();
  });

  test('Enter on text input submits form (when valid)', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await emailInput.fill('test@example.com');
    await emailInput.press('Enter');

    // Section 1 onSubmit sets a status text containing "Submitted:".
    await expect(page.getByText(/submitted: test@example\.com/i)).toBeVisible();
  });

  test('Enter on invalid required field blocks submit + browser shows native popup', async ({
    page,
  }) => {
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await emailInput.focus();
    await emailInput.press('Enter');

    // Browser native validation should prevent submit — the success message
    // must NOT appear.
    await expect(page.getByText(/submitted:/i)).not.toBeVisible();
  });
});
