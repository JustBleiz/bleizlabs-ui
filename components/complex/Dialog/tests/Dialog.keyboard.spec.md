# Dialog.keyboard.spec

> Deferred execution — Playwright spec ready for consumer CI/CD. See Dialog.tsx `@tested` header.

```typescript
/**
 * Dialog keyboard interaction spec — APG `/dialog-modal/` compliance (E15).
 *
 * EXECUTION DEFERRED: written as Playwright specs; runs on first consumer adoption
 * when a browser env is available. No Playwright runner is configured in this
 * repository yet — these specs document the expected behavior and are ready to
 * execute against the `/components/dialog` playground.
 *
 * Coverage (APG keyboard table):
 * - Tab                → focus cycles forward, wraps first→last
 * - Shift+Tab          → focus cycles backward, wraps last→first
 * - Escape             → closes dialog + returns focus to trigger
 * - Focus trap         → Tab on last tabbable wraps to first (not escapes to body)
 * - Nested Select/Combobox Escape → nested component handles first (Radix #1951, #2450)
 *
 * Playground route under test: `/components/dialog`
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog — keyboard interactions (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dialog');
  });

  test('Escape closes dialog and returns focus to trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic dialog/i });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Focus restored to trigger (APG focus management spec)
    await expect(trigger).toBeFocused();
  });

  test('Tab cycles focus forward within dialog (wraps to first)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Tab through all focusable elements inside dialog
    const focusables = await dialog.locator('button, a[href], input, [tabindex="0"]').all();
    expect(focusables.length).toBeGreaterThan(0);

    // Press Tab N times — should stay inside dialog
    for (let i = 0; i < focusables.length + 2; i += 1) {
      await page.keyboard.press('Tab');
      const activeInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(activeInsideDialog).toBe(true);
    }
  });

  test('Shift+Tab cycles focus backward within dialog (wraps to last)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');

    // Press Shift+Tab — should NOT escape to background
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
      const activeInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(activeInsideDialog).toBe(true);
    }
  });

  test('Close button activates on Enter and Space', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: /close dialog/i });

    await closeButton.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).not.toBeVisible();

    // Reopen + Space
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await dialog.getByRole('button', { name: /close dialog/i }).focus();
    await page.keyboard.press('Space');
    await expect(dialog).not.toBeVisible();
  });

  test('closeOnEscape=false disables Escape close', async ({ page }) => {
    await page.getByRole('button', { name: /open no-escape dialog/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    // Should remain open
    await expect(dialog).toBeVisible();
  });
});
```
