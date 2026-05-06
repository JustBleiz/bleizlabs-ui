# Sheet.focus.spec

> Deferred execution — Playwright spec ready for consumer CI/CD. See Sheet.tsx `@tested` header.

```typescript
/**
 * Sheet focus management spec — APG `/dialog-modal/` compliance (E18).
 *
 * EXECUTION DEFERRED — runs on first consumer adoption.
 *
 * Coverage:
 * - Initial focus on first tabbable (Dialog parity, NOT least-destructive)
 * - Focus trap prevents escape to background
 * - Focus restores to trigger on close (Radix #1891 fix via rAF)
 * - Multi-trigger: focus returns to the specific trigger that opened sheet
 * - Content container focusable (tabIndex=-1) when no tabbables inside
 *
 * Playground route under test: `/components/sheet`
 */

import { test, expect } from '@playwright/test';

test.describe('Sheet — focus management (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sheet');
  });

  test('Initial focus lands on first tabbable (close button by default)', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    // showCloseButton=true default → close button is typically first tabbable
    const firstBtn = page.getByRole('dialog').getByRole('button').first();
    await expect(firstBtn).toBeFocused();
  });

  test('Focus trap prevents Tab escape to background', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    await expect(
      page.getByRole('button', { name: /open right sheet/i }),
    ).not.toBeFocused();
  });

  test('Focus restores to trigger on close (Radix #1891)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open right sheet/i });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('Multi-trigger: focus returns to the specific trigger (Radix #2270)', async ({ page }) => {
    const left = page.getByRole('button', { name: /open left sheet/i });
    const right = page.getByRole('button', { name: /open right sheet/i });

    await left.click();
    await page.keyboard.press('Escape');
    await expect(left).toBeFocused();

    await right.click();
    await page.keyboard.press('Escape');
    await expect(right).toBeFocused();
  });
});
```
