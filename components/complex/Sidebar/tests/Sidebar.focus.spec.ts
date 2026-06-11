/**
 * Sidebar focus behavior spec — disclosure + dialog composition (E142 L3c).
 */

import { test, expect } from '@playwright/test';

test.describe('Sidebar — focus management (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/sidebar');
  });

  test('SB-R06 — disabled item kept in Tab order (aria-disabled only)', async ({ page }) => {
    // Section 2 "Grouped sidebar" has a disabled "Permission denied" item
    const groupedSidebar = page.locator('aside[aria-label="Grouped sidebar"]');
    const disabled = groupedSidebar.getByRole('link', { name: 'Permission denied' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    // Focusable (AT discovery)
    await disabled.focus();
    await expect(disabled).toBeFocused();
  });

  test('disabled item: Enter does not trigger navigation (preventDefault)', async ({ page }) => {
    const groupedSidebar = page.locator('aside[aria-label="Grouped sidebar"]');
    const disabled = groupedSidebar.getByRole('link', { name: 'Permission denied' });
    await disabled.focus();
    // Track URL - should not change
    const urlBefore = page.url();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);
    expect(page.url()).toBe(urlBefore);
  });

  test('active item exposes aria-current=page + data-active', async ({ page }) => {
    const basicSidebar = page.locator('aside[aria-label="Basic sidebar"]');
    const dashboard = basicSidebar.getByRole('link', { name: 'Dashboard' });
    await expect(dashboard).toHaveAttribute('aria-current', 'page');
    await expect(dashboard).toHaveAttribute('data-active', 'true');
  });

  test('SidebarTrigger: aria-expanded + aria-controls reflect state', async ({ page }) => {
    const basicSidebar = page.locator('aside[aria-label="Basic sidebar"]');
    const sidebarId = await basicSidebar.getAttribute('id');
    expect(sidebarId).toBeTruthy();
    const trigger = page.getByRole('button', { name: /toggle sidebar/i }).first();
    await expect(trigger).toHaveAttribute('aria-controls', sidebarId!);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Sidebar — focus management (mobile drawer)', () => {
  // E02: old matchMedia deferral disproven — viewport-BEFORE-goto + Escape
  // dismiss-loop mechanic (see Sidebar.aria.spec.ts mobile describe).

  test('SB-R05 — useFocusTrap keeps focus inside open drawer', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/components/sidebar');
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 6 && (await page.locator('[role="dialog"]').count()) > 0; i += 1) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
    }
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await page.getByTestId('open-drawer-sidebar').click();
    const drawer = page.getByRole('dialog', { name: 'Drawer dialog sidebar' });
    await expect(drawer).toBeVisible();
    // Walk a full Tab cycle — focus must stay inside the drawer every step.
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.contains(document.activeElement) : false;
      });
      expect(inside).toBe(true);
    }
  });

  test.skip('Escape closes top-most drawer [COVERED: SB-ES01 in Sidebar.regression.spec.ts + SB-R03 in Sidebar.keyboard.spec.ts]', async () => {
    // Escape stacking (drawer + Dialog) is pinned by SB-ES01; plain Escape
    // close by SB-R03. Kept as a pointer, not re-duplicated here.
  });
});
