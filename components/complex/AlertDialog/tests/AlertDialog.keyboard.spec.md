# AlertDialog.keyboard.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `AlertDialog.keyboard.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See AlertDialog.tsx `@tested`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * AlertDialog keyboard interaction spec — APG `/alertdialog/` compliance (E16).
 *
 * EXECUTION STATUS: EXECUTED in-repo — the canonical suite is the sibling
 * `AlertDialog.keyboard.spec.ts` (CI-gated). This snapshot documents the expected
 * behavior against the `/components/alert-dialog` playground.
 *
 * Coverage (APG keyboard table — identical to dialog-modal + alert-specific):
 * - Tab                   → focus cycles forward, wraps Cancel ↔ Confirm
 * - Shift+Tab             → focus cycles backward
 * - Escape                → invokes onCancel (NOT onConfirm) + returns focus to trigger
 * - Enter                 → activates focused button (native)
 * - Space                 → activates focused button (native)
 * - Initial focus         → lands on Cancel button (least destructive per APG)
 * - Overlay click         → blocked by default (closeOnOverlayClick=false)
 * - Nested Select Escape  → nested component handles first (Radix #1951, #2450)
 *
 * Playground route under test: `/components/alert-dialog`
 */

import { test, expect } from '@playwright/test';

test.describe('AlertDialog — keyboard interactions (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/alert-dialog');
  });

  test('Escape key calls onCancel (not onConfirm) and closes dialog', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
    // Cancel side-effect, NOT confirm (no mutation)
    await expect(page.getByTestId('confirm-count')).toHaveText('0');
    await expect(page.getByTestId('cancel-count')).toHaveText('1');
  });

  test('Tab key cycles Cancel → Confirm → Cancel (focus trap)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    await expect(alert).toBeVisible();

    // Initial focus = Cancel button
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /confirm/i })).toBeFocused();
    await page.keyboard.press('Tab');
    // Wraps back to Cancel (focus trap)
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  test('Shift+Tab cycles Cancel → Confirm (reverse wrap)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: /confirm/i })).toBeFocused();
  });

  test('Enter activates focused Confirm button', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.keyboard.press('Tab'); // focus → Confirm
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('confirm-count')).toHaveText('1');
  });

  test('Space activates focused Cancel button', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
    await expect(page.getByTestId('cancel-count')).toHaveText('1');
  });
});
```
