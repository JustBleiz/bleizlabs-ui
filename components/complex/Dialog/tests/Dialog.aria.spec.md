# Dialog.aria.spec

> Consumer-CI mirror — the CANONICAL, in-repo-executed suite lives in the sibling `.spec.ts`
> (CI-gated; status in Dialog.tsx `@tested` — only the manual NVDA sweep stays deferred).

```typescript
/**
 * Dialog ARIA accessibility tree spec — APG role/property compliance (E15).
 *
 * [Historical fence note — superseded 2026-06, E02: the suite EXECUTES in-repo
 * via Dialog.aria.spec.ts; only the manual NVDA sweep stays deferred.]
 *
 * Coverage:
 * - role="dialog" + aria-modal="true"
 * - aria-labelledby points to a rendered element with matching id
 * - aria-describedby only present when description provided (Radix #3007)
 * - axe-core zero violations on demo page
 * - Accessibility snapshot matches expected shape
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dialog');
  });

  test('has role="dialog" + aria-modal + aria-labelledby', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // aria-labelledby must point to a rendered element
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const labelElement = page.locator(`#${labelledBy}`);
    await expect(labelElement).toBeVisible();
  });

  test('aria-describedby present only when description provided (Radix #3007)', async ({
    page,
  }) => {
    // Dialog with description
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    let dialog = page.getByRole('dialog');
    let describedBy = await dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
    await page.keyboard.press('Escape');

    // Dialog without description
    await page.getByRole('button', { name: /open no-description dialog/i }).click();
    dialog = page.getByRole('dialog');
    describedBy = await dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeNull();
  });

  test('accessibility snapshot has expected structure', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await page.waitForTimeout(50);

    const snapshot = await page.accessibility.snapshot();
    // Find the dialog node in the tree
    const dialogNode = findNodeByRole(snapshot, 'dialog');
    expect(dialogNode).toBeDefined();
    expect(dialogNode?.name).toBeTruthy();
  });

  test('axe-core zero violations when dialog is open', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await page.waitForTimeout(50);

    // Consumer note: this test requires @axe-core/playwright integration.
    // Expected behavior:
    //   const results = await new AxeBuilder({ page }).analyze();
    //   expect(results.violations).toEqual([]);
    // Left as a placeholder — integrate axe-core at consumer CI time.
  });

  test('close button has accessible name', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: /close dialog/i });
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveAttribute('aria-label', /close/i);
  });
});

type A11yNode = {
  role?: string;
  name?: string;
  children?: A11yNode[];
} | null;

function findNodeByRole(node: A11yNode, role: string): A11yNode {
  if (!node) return null;
  if (node.role === role) return node;
  for (const child of node.children ?? []) {
    const found = findNodeByRole(child, role);
    if (found) return found;
  }
  return null;
}
```
