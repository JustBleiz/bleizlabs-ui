# Drawer.focus.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Drawer.focus.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Drawer.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Drawer focus management spec — APG `/dialog-modal/` compliance (E17).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Drawer.focus.spec.ts` (CI-gated).
 *
 * Coverage:
 * - Initial focus on first tabbable (Dialog parity, NOT least-destructive)
 * - Focus trap prevents escape to background
 * - Focus restores to trigger on close (Radix #1891 fix via rAF)
 * - Multi-trigger: focus returns to the specific trigger that opened drawer
 * - Content container focusable (tabIndex=-1) when no tabbables inside
 *
 * Playground route under test: `/components/drawer`
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — focus management (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  test('Initial focus lands on first tabbable element', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    // First button inside drawer should be focused
    const firstBtn = page.getByRole('dialog').getByRole('button').first();
    await expect(firstBtn).toBeFocused();
  });

  test('Focus trap prevents Tab escape to background', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    // Tab through all tabbables multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    // Background trigger should never receive focus
    await expect(page.getByRole('button', { name: /open basic drawer/i })).not.toBeFocused();
  });

  test('Focus restores to trigger on close (Radix #1891)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic drawer/i });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('Multi-trigger: focus returns to specific trigger (Radix #2270)', async ({ page }) => {
    const t1 = page.getByRole('button', { name: /open basic drawer/i });
    const t2 = page.getByRole('button', { name: /open filters drawer/i });

    await t2.click();
    await page.keyboard.press('Escape');
    await expect(t2).toBeFocused();

    await t1.click();
    await page.keyboard.press('Escape');
    await expect(t1).toBeFocused();
  });

  test('Content container focusable when no internal tabbables', async ({ page }) => {
    await page.getByRole('button', { name: /open text-only drawer/i }).click();
    // Drawer with no interactive content — container receives focus
    await expect(page.getByRole('dialog')).toBeFocused();
  });
});
```
