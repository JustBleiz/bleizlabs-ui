/**
 * Tooltip keyboard interaction spec — APG `/tooltip/` compliance (E19).
 *
 * Coverage (SC 1.4.13 — content-on-hover-or-focus):
 * - Focus shows tooltip instantly (no delay — explicit intent)
 * - Blur hides
 * - Escape dismisses WITHOUT losing trigger focus
 * - Hover delay (default 700ms) honored
 * - Hover persists when pointer enters tooltip body (grace area)
 * - Click/Enter does NOT dismiss tooltip (Radix #1077 / #2029)
 * - Tab navigation not interrupted
 */

import { test, expect } from '@playwright/test';

test.describe('Tooltip — keyboard interactions (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tooltip');
  });

  test('show on focus — keyboard parity with hover (SC 1.4.13)', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('hide on blur', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    await save.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    // Move focus to another button — tooltip on Save should hide
    await page.getByRole('button', { name: 'Undo' }).focus();
    await expect(page.getByRole('tooltip', { name: 'Save file (Ctrl+S)' })).not.toBeVisible();
  });

  test('Escape hides without losing focus (SC 1.4.13 dismissable)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip', { name: 'Save file (Ctrl+S)' })).not.toBeVisible();
    // CRITICAL: focus must remain on the trigger after Escape
    await expect(trigger).toBeFocused();
  });

  test.skip('Escape scoped to tooltip, not parent modal [PLAYGROUND-DEP: Dialog+Tooltip nesting]', async () => {
    // Requires Dialog + Tooltip nested playground scenario.
  });

  test('hover shows after delayDuration', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.hover();
    // Tooltip should NOT be visible immediately
    await expect(page.getByRole('tooltip', { name: 'Save file (Ctrl+S)' })).not.toBeVisible();
    // Default delayDuration is 700ms — wait past it
    await page.waitForTimeout(800);
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('hover persists when pointer enters tooltip content (SC 1.4.13 hoverable)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'APG reference' });
    await trigger.hover();
    await page.waitForTimeout(800);
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await tooltip.hover();
    await page.waitForTimeout(200);
    await expect(tooltip).toBeVisible();
  });

  test('click does not close tooltip [Radix #1077 / #2029]', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('Tab navigation not interrupted — blur+focus next element hides prior', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    await save.focus();
    const firstTooltip = page.getByRole('tooltip', { name: 'Save file (Ctrl+S)' });
    await expect(firstTooltip).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(firstTooltip).not.toBeVisible();
  });
});
