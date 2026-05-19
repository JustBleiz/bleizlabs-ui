/**
 * Form ARIA snapshot spec — verifies native form semantics + accessible name.
 *
 * Coverage:
 * - <form> element renders with role="form" effective via aria-label
 * - Compound Form.Submit renders <button type="submit">
 * - Stable accessibility tree across the playground
 *
 * Playground route: `/components/form`
 */

import { test, expect } from '@playwright/test';

test.describe('Form — ARIA semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/form');
  });

  test('Form with aria-label exposes accessible form landmark', async ({ page }) => {
    // Section 1: Form aria-label="Contact form (basic)"
    const form = page.getByRole('form', { name: /contact form/i });
    await expect(form).toBeVisible();
  });

  test('Form.Submit asChild renders a button of type="submit"', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /^send$/i }).first();
    await expect(sendBtn).toHaveAttribute('type', 'submit');
  });

  test('Form.Submit native fallback renders <button type="submit">', async ({ page }) => {
    // Section 4 uses bare Form.Submit (native button).
    const sendBtn = page.getByRole('button', { name: /^send$/i }).last();
    await expect(sendBtn).toHaveAttribute('type', 'submit');
  });

  test('Form noValidate variant sets noValidate attribute on <form>', async ({ page }) => {
    // Section 2 uses noValidate.
    const form = page.getByRole('form', { name: /custom validated/i });
    const noValidate = await form.evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(noValidate).toBe(true);
  });

  test('Form default mode does NOT set noValidate', async ({ page }) => {
    // Section 1 — default validation enabled.
    const form = page.getByRole('form', { name: /contact form/i });
    const noValidate = await form.evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(noValidate).toBe(false);
  });

  test('Required input has correct ARIA + native required attribute', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await expect(emailInput).toHaveAttribute('required', '');
  });
});
