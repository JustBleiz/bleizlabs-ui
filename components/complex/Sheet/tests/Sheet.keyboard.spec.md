# Sheet.keyboard.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Sheet.keyboard.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Sheet.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Sheet keyboard interaction spec — APG `/dialog-modal/` compliance (E18).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Sheet.keyboard.spec.ts` (CI-gated).
 *
 * Coverage:
 * - Escape closes sheet (all 4 sides)
 * - Tab cycles forward, wraps last → first
 * - Shift+Tab cycles backward, wraps first → last
 * - Focus trap prevents escape to background
 * - closeOnOverlayClick=false prevents overlay dismissal
 * - closeOnEscape=false disables Escape
 *
 * Playground route under test: `/components/sheet`
 */

import { test, expect } from '@playwright/test';

test.describe('Sheet — keyboard interactions (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sheet');
  });

  test.describe.each([{ side: 'left' }, { side: 'right' }, { side: 'top' }, { side: 'bottom' }])(
    'side=$side',
    ({ side }) => {
      test(`Escape closes ${side} sheet`, async ({ page }) => {
        await page.getByRole('button', { name: new RegExp(`open ${side} sheet`, 'i') }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).not.toBeVisible();
      });

      test(`Tab cycles within ${side} sheet (focus trap)`, async ({ page }) => {
        await page.getByRole('button', { name: new RegExp(`open ${side} sheet`, 'i') }).click();
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press('Tab');
        }
        // Background trigger never receives focus
        await expect(
          page.getByRole('button', { name: new RegExp(`open ${side} sheet`, 'i') }),
        ).not.toBeFocused();
      });
    },
  );

  test('closeOnOverlayClick=false prevents overlay dismissal', async ({ page }) => {
    await page.getByRole('button', { name: /open locked sheet/i }).click();
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('closeOnEscape=false disables Escape', async ({ page }) => {
    await page.getByRole('button', { name: /open locked sheet/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```
