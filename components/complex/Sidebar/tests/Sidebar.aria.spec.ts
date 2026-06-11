/**
 * Sidebar ARIA semantics spec — landmark + disclosure + dialog (E142 L3c).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Sidebar — ARIA (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/sidebar');
  });

  test('SB-R07 — desktop renders <aside> with labeled <nav>', async ({ page }) => {
    const basicSidebar = page.locator('aside[aria-label="Basic sidebar"]');
    await expect(basicSidebar).toBeVisible();
    const nav = basicSidebar.locator('nav').first();
    const navLabel = await nav.getAttribute('aria-label');
    expect(navLabel).toBeTruthy();
    expect(navLabel).toBe('Primary navigation');
  });

  test('SB-R09 — SidebarTrigger aria-expanded + aria-controls wiring', async ({ page }) => {
    const basicSidebar = page.locator('aside[aria-label="Basic sidebar"]');
    const sidebarId = await basicSidebar.getAttribute('id');
    const trigger = page.getByRole('button', { name: /toggle sidebar/i }).first();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', sidebarId!);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('SB-R15 — SidebarSeparator has role=separator', async ({ page }) => {
    const groupedSidebar = page.locator('aside[aria-label="Grouped sidebar"]');
    const separator = groupedSidebar.locator('[role="separator"]').first();
    await expect(separator).toBeAttached();
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  test('SidebarGroup has role=group + aria-labelledby when labeled', async ({ page }) => {
    const groupedSidebar = page.locator('aside[aria-label="Grouped sidebar"]');
    const groups = groupedSidebar.locator('[role="group"]');
    const first = groups.first();
    const labelledBy = await first.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const labelEl = page.locator(`#${labelledBy}`);
    await expect(labelEl).toContainText('Recent');
  });

  test('aria snapshot exposes complementary + navigation roles', async ({ page }) => {
    const basicSidebar = page.locator('aside[aria-label="Basic sidebar"]');
    const snapshot = await basicSidebar.ariaSnapshot();
    // <aside> → complementary landmark
    expect(snapshot).toContain('complementary');
    expect(snapshot).toContain('navigation');
  });

  test('axe-core zero violations — desktop view', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test.skip('SB-R10 — SidebarGroup disclosure [PLAYGROUND-DEP: no ?groupDisclosure=1 demo]', async () => {
    // SidebarGroup does not expose an expandable toggle by default in the
    // current library API. Playground does not demo collapsible groups.
  });
});

test.describe('Sidebar — ARIA (mobile drawer)', () => {
  // E02: the old NOTE-FOR-LIB deferral was disproven — viewport-BEFORE-goto
  // makes useMatchMedia mobile from hydration (no reliance on the matchMedia
  // change event), and the bounded Escape dismiss-loop clears the auto-opened
  // demo drawers (Basic, Groups, Shortcut, SideRight — all defaultOpen).
  // Mechanic established by SB-R13/SB-R14/SB-ES01.

  async function openFixtureDrawer(page: import('@playwright/test').Page) {
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
    return drawer;
  }

  test('SB-R08 — drawer has role=dialog + aria-modal=true', async ({ page }) => {
    const drawer = await openFixtureDrawer(page);
    await expect(drawer).toHaveAttribute('aria-modal', 'true');
  });

  test('drawer has aria-label for accessible name', async ({ page }) => {
    const drawer = await openFixtureDrawer(page);
    await expect(drawer).toHaveAttribute('aria-label', 'Drawer dialog sidebar');
  });

  test('axe-core zero violations — drawer open', async ({ page }) => {
    await openFixtureDrawer(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
