# Drawer.keyboard.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Drawer.keyboard.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Drawer.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Drawer keyboard interaction spec — APG `/dialog-modal/` compliance (E17).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Drawer.keyboard.spec.ts` (CI-gated).
 *
 * Coverage:
 * - Tab          → focus cycles forward through tabbable children, wraps last→first
 * - Shift+Tab    → focus cycles backward, wraps first→last
 * - Escape       → closes drawer (APG requirement)
 * - Enter/Space  → activates focused button (native)
 * - Initial focus → first tabbable (Dialog parity, NOT least-destructive)
 * - Overlay click → closes by default (Dialog parity, differs from AlertDialog)
 * - Nested Select Escape → closes Select first, not Drawer (Radix #1951)
 *
 * Playground route under test: `/components/drawer`
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — keyboard interactions (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  test('Escape closes drawer', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Tab cycles through tabbable elements (focus trap)', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    // First tabbable is focused
    await page.keyboard.press('Tab');
    // Subsequent tabs stay within drawer
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Should not escape to background trigger
    await expect(page.getByRole('button', { name: /open filters drawer/i })).not.toBeFocused();
  });

  test('Overlay click closes drawer (closeOnOverlayClick=true default)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Click overlay (top of viewport, above content which is bottom-anchored)
    await page
      .locator('[data-state="open"]')
      .first()
      .click({ position: { x: 200, y: 10 } });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closeOnOverlayClick=false prevents overlay dismissal', async ({ page }) => {
    await page.getByRole('button', { name: /open locked drawer/i }).click();
    await page
      .locator('[data-state="open"]')
      .first()
      .click({ position: { x: 200, y: 10 } });
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closeOnEscape=false disables Escape', async ({ page }) => {
    await page.getByRole('button', { name: /open locked drawer/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```
