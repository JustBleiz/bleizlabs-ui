/**
 * Toolbar ARIA accessibility spec — APG `/toolbar/` role/property compliance.
 *
 * Coverage:
 * - role=toolbar
 * - aria-label required + present
 * - aria-orientation reflects orientation prop
 * - dir="rtl" attribute reflected
 * - axe-core zero violations on demo page
 * - data-orientation attribute matches aria-orientation
 * - Separator children remain aria-hidden (decorative pass-through)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Toolbar — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/toolbar');
  });

  test('toolbar has role + aria-label + aria-orientation (horizontal)', async ({
    page,
  }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveAttribute('aria-label', 'Formatting');
    await expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
  });

  test('vertical toolbar has aria-orientation="vertical"', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Tools' });
    await expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('data-orientation attribute mirrors aria-orientation', async ({ page }) => {
    const horizontal = page.getByRole('toolbar', { name: 'Formatting' });
    const vertical = page.getByRole('toolbar', { name: 'Tools' });
    await expect(horizontal).toHaveAttribute('data-orientation', 'horizontal');
    await expect(vertical).toHaveAttribute('data-orientation', 'vertical');
  });

  test('dir="rtl" is reflected on the toolbar element', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Editor (RTL)' });
    await expect(toolbar).toHaveAttribute('dir', 'rtl');
  });

  test('Separator children remain decorative (aria-hidden)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    // Vertical separators inside the toolbar are aria-hidden by default
    // (Lib Separator decorative=true default). They should not appear as
    // separator role nodes in the accessibility tree.
    const separators = toolbar.locator('[role="separator"]');
    // None should appear — Lib Separator strips role when decorative.
    const count = await separators.count();
    expect(count).toBe(0);
  });

  test('axe-core: zero violations on toolbar demo page', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('main')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('child Buttons keep their role="button" semantics', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const saveBtn = toolbar.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeVisible();
  });

  test('child Toggle keeps role + aria-pressed', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    const bold = toolbar.getByRole('button', { name: 'Bold' });
    // Toggle in lib uses aria-pressed for two-state toggle. Initial state
    // 'bold' is in the controlled value array (see playground).
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
  });
});
