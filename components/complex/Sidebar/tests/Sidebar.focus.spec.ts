/**
 * Sidebar focus behavior spec — disclosure + dialog composition (E142 L3c).
 */

import { test, expect } from '@playwright/test';

test.describe('Sidebar — focus management (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/sidebar');
  });

  test('SB-R06 — disabled item kept in Tab order (aria-disabled only)', async ({
    page,
  }) => {
    // Section 2 "Grouped sidebar" has a disabled "Permission denied" item
    const groupedSidebar = page.locator('aside[aria-label="Grouped sidebar"]');
    const disabled = groupedSidebar.getByRole('link', { name: 'Permission denied' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    // Focusable (AT discovery)
    await disabled.focus();
    await expect(disabled).toBeFocused();
  });

  test('disabled item: Enter does not trigger navigation (preventDefault)', async ({
    page,
  }) => {
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

  test('SidebarTrigger: aria-expanded + aria-controls reflect state', async ({
    page,
  }) => {
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
  // NOTE-FOR-LIB: See Sidebar.aria.spec.ts "Sidebar — ARIA (mobile drawer)"
  // comment block for the matchMedia + Playwright resize limitation. Mobile
  // drawer tests deferred until playground adds a dedicated mobile route or
  // library adds a test-only breakpoint override.

  test.skip('SB-R05 — useFocusTrap keeps focus inside open drawer [PLAYGROUND-DEP: matchMedia resize]', async () => {
    // Drawer uses useFocusTrap hook (Dialog E15 primitive). Verified manually.
  });

  test.skip('Escape closes top-most drawer [PLAYGROUND-DEP: matchMedia resize]', async () => {
    // Sidebar.tsx:386-395 document-level Escape listener closes drawer.
  });
});
