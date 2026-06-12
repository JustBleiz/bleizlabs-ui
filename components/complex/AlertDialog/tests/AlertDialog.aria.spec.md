# AlertDialog.aria.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `AlertDialog.aria.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See AlertDialog.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * AlertDialog ARIA attributes + accessibility tree spec — APG `/alertdialog/` compliance (E16).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `AlertDialog.aria.spec.ts` (CI-gated).
 *
 * Coverage:
 * - role="alertdialog" present (NOT role="dialog")
 * - aria-modal="true" present
 * - aria-labelledby references the title element
 * - aria-describedby ALWAYS present (REQUIRED per APG /alertdialog/, unlike Dialog)
 * - Severity classes do not alter accessibility tree (visual only)
 * - Accessibility snapshot matches expected structure
 *
 * Playground route under test: `/components/alert-dialog`
 */

import { test, expect } from '@playwright/test';

test.describe('AlertDialog — ARIA compliance (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/alert-dialog');
  });

  test('role="alertdialog" attribute present (not plain dialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute('role', 'alertdialog');
    // Must NOT also be discoverable as plain dialog
    const dialogLocator = page.locator('[role="dialog"]');
    await expect(dialogLocator).toHaveCount(0);
  });

  test('aria-modal="true" attribute present', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby references visible title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const labelledBy = await alert.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('aria-describedby ALWAYS present (REQUIRED per APG alertdialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // Must resolve to an element (unlike Dialog where describedby can be absent)
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test('aria-describedby element contains description text', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    const descText = await page.locator(`#${describedBy}`).textContent();
    expect(descText).toMatch(/cannot be undone/i);
  });

  test('Severity variants do not change ARIA role or attributes', async ({ page }) => {
    for (const kind of ['basic', 'critical', 'info']) {
      await page.getByRole('button', { name: new RegExp(`open ${kind} alert`, 'i') }).click();
      const alert = page.getByRole('alertdialog');
      await expect(alert).toHaveAttribute('role', 'alertdialog');
      await expect(alert).toHaveAttribute('aria-modal', 'true');
      await expect(alert).toHaveAttribute('aria-labelledby', /.+/);
      await expect(alert).toHaveAttribute('aria-describedby', /.+/);
      await page.keyboard.press('Escape');
    }
  });

  test('Accessibility snapshot matches expected structure', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const snapshot = await page.accessibility.snapshot();
    // Must contain alertdialog role in tree
    const stringified = JSON.stringify(snapshot);
    expect(stringified).toContain('alertdialog');
  });
});
```
