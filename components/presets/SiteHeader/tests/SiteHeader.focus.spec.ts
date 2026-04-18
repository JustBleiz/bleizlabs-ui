/**
 * SiteHeader focus management spec — Sheet composition (E142 L3c).
 *
 * Covers FC-01..FC-05. Sheet uses useFocusTrap (Dialog primitive); focus
 * restores to the MobileToggle on Escape / overlay click / close X.
 */

import { test, expect } from '@playwright/test';

test.describe('SiteHeader — focus management', () => {
  test('FC-01 — SiteHeader does not hijack initial focus on mount', async ({ page }) => {
    await page.goto('/components/site-header');
    const active = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(['BODY', 'HTML']).toContain(active);
  });

  test('FC-02 — Opening Sheet moves focus into dialog', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    // Gate — wait for focus trap rAF to land initial focus
    await page.waitForTimeout(100);
    const insideDialog = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg?.contains(document.activeElement) ?? false;
    });
    expect(insideDialog).toBe(true);
  });

  test('FC-03 — Escape closes Sheet + restores focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    // After close, label flips back to "Open navigation"
    await expect(
      page.getByRole('button', { name: 'Open navigation' }).first(),
    ).toBeFocused();
  });

  test('FC-04 — Overlay click returns focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.waitForTimeout(100);
    // Click overlay at far-right edge of viewport (drawer is left-anchored)
    await page.mouse.click(350, 400);
    await expect(page.getByRole('dialog').first()).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Open navigation' }).first(),
    ).toBeFocused();
  });

  test('FC-05 — Close (X) button returns focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(100);
    // Sheet renders interpolated close-button label "Close ${title}" (L3a lesson)
    const closeBtn = dialog.getByRole('button', { name: /^Close/i });
    await closeBtn.click();
    await expect(
      page.getByRole('button', { name: 'Open navigation' }).first(),
    ).toBeFocused();
  });
});
