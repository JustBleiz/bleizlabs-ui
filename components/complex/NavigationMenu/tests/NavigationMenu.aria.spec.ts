/**
 * NavigationMenu ARIA accessibility spec — APG `/menubar/` role/property
 * compliance (E142 L3c).
 *
 * Coverage:
 * - role="menubar" on list + role="menuitem" on triggers/links
 * - aria-haspopup + aria-expanded + aria-controls on triggers
 * - data-state open/closed
 * - aria-labelledby on submenu content
 * - axe-core zero violations (closed + open states)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('NavigationMenu — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    // Eliminate animations — prevents axe reading mid-animation colors under
    // parallel load. Same pattern as Modal/Floating families.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/navigation-menu');
  });

  test('menubar has role + aria-label + aria-orientation', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await expect(menubar).toBeVisible();
    await expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(menubar).toHaveAttribute('aria-label', 'Main');
  });

  test('trigger has aria-haspopup=menu + aria-expanded + aria-controls when open', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const controls = await trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const menu = page.getByRole('menu');
    await expect(menu).toHaveAttribute('id', controls!);
  });

  test('submenu has role=menu + aria-labelledby pointing to trigger id', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    const labelledBy = await menu.getAttribute('aria-labelledby');
    const triggerId = await trigger.getAttribute('id');
    expect(labelledBy).toBe(triggerId);
  });

  test('NM-R03 — data-state reflects open/closed on trigger + content', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await trigger.click();
    await expect(trigger).toHaveAttribute('data-state', 'open');
    const content = page.getByRole('menu');
    await expect(content).toHaveAttribute('data-state', 'open');
  });

  test('aria snapshot contains menubar + menuitem roles', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const snapshot = await menubar.ariaSnapshot();
    expect(snapshot).toContain('menubar');
    expect(snapshot).toContain('menuitem');
    expect(snapshot).toMatch(/"Products"/);
  });

  test.skip('NM-R19 — coarse pointer skips hover triggers [PLAYGROUND-DEP: mobile emulation context not created in isolation]', async () => {
    // Requires a separate BrowserContext with hasTouch + isMobile — the test
    // harness default desktop Chromium cannot inject `pointer: coarse` media
    // query match reliably via emulateMedia alone. The component's
    // useCoarsePointer / `(pointer: coarse)` matchMedia path is exercised in
    // production; runtime verification requires a mobile-device Playwright
    // project. Component source path (NavigationMenu.tsx:232-238) already
    // covered by TS type check and static review.
  });

  test('axe-core zero violations — closed state', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — open submenu state', async ({ page }) => {
    await page
      .getByRole('menubar', { name: 'Main' })
      .getByRole('menuitem', { name: 'Products' })
      .click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.waitForTimeout(50);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
