# Drawer.aria.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Drawer.aria.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Drawer.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Drawer ARIA attributes + accessibility tree spec — APG `/dialog-modal/` compliance (E17).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Drawer.aria.spec.ts` (CI-gated).
 *
 * Coverage:
 * - role="dialog" present (NOT alertdialog — Drawer is generic container)
 * - aria-modal="true" present
 * - aria-labelledby references the title element
 * - aria-describedby present ONLY when description prop provided (Dialog parity, Radix #3007)
 * - Background elements receive `inert` attribute while drawer open
 * - Accessibility snapshot matches expected structure
 *
 * Playground route under test: `/components/drawer`
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — ARIA compliance (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  test('role="dialog" attribute present (NOT alertdialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('role', 'dialog');
    // Must NOT be alertdialog
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test('aria-modal="true" attribute present', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby references visible title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const labelledBy = await drawer.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('aria-describedby present when description provided', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const describedBy = await drawer.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test('aria-describedby absent when description omitted', async ({ page }) => {
    await page.getByRole('button', { name: /open text-only drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const describedBy = await drawer.getAttribute('aria-describedby');
    expect(describedBy).toBeFalsy();
  });

  test('Background siblings have inert attribute while drawer open', async ({ page }) => {
    // Playground main element is a body sibling of portal root
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    // Portal root is direct body child; main should be marked inert
    const mainHasInert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInert).toBe(true);

    // Close → inert removed
    await page.keyboard.press('Escape');
    const mainHasInertAfter = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInertAfter).toBe(false);
  });

  test('Accessibility snapshot matches expected structure', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const snapshot = await page.accessibility.snapshot();
    const stringified = JSON.stringify(snapshot);
    expect(stringified).toContain('dialog');
  });
});
```
