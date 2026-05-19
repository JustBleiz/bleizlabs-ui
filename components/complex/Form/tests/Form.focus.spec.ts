/**
 * Form focus management spec — native form behavior.
 *
 * Form does not own focus management directly (no portal, no trap, no
 * autoFocus on first field by default — that's a consumer-policy choice
 * per APG). Tests assert that focus flows naturally through native form
 * semantics + that submit button is keyboard-reachable.
 *
 * Playground route: `/components/form`
 */

import { test, expect } from '@playwright/test';

test.describe('Form — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/form');
  });

  test('initial page focus is not stolen by Form', async ({ page }) => {
    // After page load, focus should be on body (or a skip-link if present),
    // NOT auto-pulled to a form field — Form is not a modal, no autofocus
    // imposed by the component.
    const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTagName).not.toBe('INPUT');
    expect(activeTagName).not.toBe('TEXTAREA');
  });

  test('submit button is keyboard-reachable via Tab traversal', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /^email$/i }).first();
    await emailInput.focus();
    await page.keyboard.press('Tab');
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await expect(submit).toBeFocused();
  });

  test('Form.Submit asChild forwards focus correctly', async ({ page }) => {
    // Section 1 uses Form.Submit asChild + lib Button. Verify it's still
    // a focusable button reachable by name.
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await submit.focus();
    await expect(submit).toBeFocused();
  });

  test('Form.Submit native button (no asChild) is focusable', async ({ page }) => {
    // Section 4 uses bare Form.Submit with no asChild — should render a
    // native <button type="submit"> with .submit class.
    const submit = page.getByRole('button', { name: /^send$/i }).last(); // last "Send" button on the page = section 4
    await submit.focus();
    await expect(submit).toBeFocused();
  });
});
