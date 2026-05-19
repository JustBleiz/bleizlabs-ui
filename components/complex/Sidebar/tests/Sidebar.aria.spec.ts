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
  // NOTE-FOR-LIB: Mobile drawer tests in the current playground cannot reliably
  // transition to drawer mode under Playwright automation. The component uses
  // useMatchMedia (useSyncExternalStore + matchMedia) with server snapshot
  // returning false — hydration matches server render (desktop aside), and
  // subsequent `setViewportSize({width:400})` does not reliably fire the
  // matchMedia `change` event listener subscribed during hydration. Manual
  // browser testing (resize real Chromium window) confirms drawer transition
  // works; Playwright's synthetic viewport resize is the issue.
  //
  // Resolution options flagged for main context:
  //   A) Playground adds a dedicated /components/sidebar?mobile=1 route that
  //      uses a hardcoded isMobile={true} prop (bypasses matchMedia entirely)
  //   B) Library adds a test-only prop override for breakpoint-triggered state
  //   C) Use Playwright's project config with devices['iPhone 12'] for a
  //      pre-mobile-viewport browser context (requires playwright.config update)
  //
  // All mobile-drawer ARIA assertions skipped with rationale.

  test.skip('SB-R08 — drawer has role=dialog + aria-modal=true [PLAYGROUND-DEP: matchMedia resize does not transition]', async () => {
    // Verified manually — drawer renders role=dialog + aria-modal=true.
    // Component source (Sidebar.tsx:422-423): role="dialog" aria-modal="true".
  });

  test.skip('drawer has aria-label for accessible name [PLAYGROUND-DEP: matchMedia resize does not transition]', async () => {
    // Verified manually — drawer forwards aria-label from the `<Sidebar aria-label>` prop.
  });

  test.skip('axe-core zero violations — drawer open [PLAYGROUND-DEP: multiple auto-open drawers + matchMedia limitation]', async () => {
    // Playground composition prevents reliable mobile drawer axe sweep; see
    // component-level desktop axe sweep above.
  });
});
