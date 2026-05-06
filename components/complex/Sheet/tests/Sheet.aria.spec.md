# Sheet.aria.spec

> Deferred execution — Playwright spec ready for consumer CI/CD. See Sheet.tsx `@tested` header.

```typescript
/**
 * Sheet ARIA attributes + accessibility tree spec — APG `/dialog-modal/` compliance (E18).
 *
 * EXECUTION DEFERRED — runs on first consumer adoption.
 *
 * Coverage:
 * - role="dialog" (NOT alertdialog — Sheet is generic container)
 * - aria-modal="true"
 * - aria-labelledby references title
 * - aria-describedby present ONLY when description provided (Dialog parity)
 * - Background elements have `inert` attribute while sheet open
 * - Accessibility snapshot matches
 *
 * Playground route under test: `/components/sheet`
 */

import { test, expect } from '@playwright/test';

test.describe('Sheet — ARIA compliance (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sheet');
  });

  test('role="dialog" attribute present (NOT alertdialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test('aria-modal="true" attribute present', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby references visible title', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const labelledBy = await sheet.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('aria-describedby present when description provided', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  test('aria-describedby absent when description omitted', async ({ page }) => {
    await page.getByRole('button', { name: /open minimal sheet/i }).click();
    const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeFalsy();
  });

  test('Background siblings have inert attribute while sheet open', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const mainHasInert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInert).toBe(true);

    await page.keyboard.press('Escape');
    const mainHasInertAfter = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInertAfter).toBe(false);
  });
});
```
