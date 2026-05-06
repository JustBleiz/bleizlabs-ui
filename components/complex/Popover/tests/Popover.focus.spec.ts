/**
 * Popover focus management spec (E20).
 *
 * Focus contract:
 * - On open: focus moves INTO content (first tabbable or content element)
 * - On close: focus restores to trigger
 * - Modal mode: background has `inert`, removed after close
 */

import { test, expect } from '@playwright/test';

test.describe('Popover — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/popover');
  });

  test('on open: focus moves to first tabbable inside content', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Quick filter' });
    await trigger.click();
    const firstInput = page.getByRole('dialog').getByRole('textbox').first();
    await expect(firstInput).toBeFocused();
  });

  test.skip('on open with initialFocusRef: focus moves to specified element [PLAYGROUND-DEP: initialFocusRef demo]', async () => {
    // Playground has no initialFocusRef scenario — unskip when added.
  });

  test.skip('on open with no tabbable content: focus moves to dialog element [PLAYGROUND-DEP: text-only popover without close affordance]', async () => {
    // All playground popovers have either form inputs or interactive content —
    // no demo of "text-only, no tabbable" scenario to reliably assert dialog-itself focus.
  });

  test('on close: focus restored to trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test.skip('on close with restoreFocusOnClose=false: focus NOT restored [PLAYGROUND-DEP: restoreFocusOnClose demo]', async () => {
    // Playground has no restoreFocusOnClose=false scenario — unskip when added.
  });

  test('modal mode: background has inert attribute while open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open modal' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const hasInert = await page.evaluate(() => {
      const candidates = Array.from(document.body.children);
      return candidates.some((el) => el.hasAttribute('inert'));
    });
    expect(hasInert).toBe(true);
  });

  test('modal mode: inert removed after close', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open modal' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const anyInert = await page.evaluate(() =>
      Array.from(document.body.children).some((el) => el.hasAttribute('inert')),
    );
    expect(anyInert).toBe(false);
  });

  test.skip('on close when trigger unmounted: no error [PLAYGROUND-DEP: dynamic trigger demo]', async () => {
    // Requires a playground where trigger is conditionally rendered.
  });
});
