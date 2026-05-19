/**
 * NavigationMenu focus behavior spec — APG `/menubar/` (E142 L3c).
 *
 * Coverage:
 * - Focus on trigger opens submenu instantly (SC 2.1.1 parity)
 * - Blur with relatedTarget inside content keeps open (focus-within)
 * - Roving tabindex: active item tabindex=0, others -1
 * - Standalone link focus + activation
 * - aria-disabled item does not block focus but blocks click state change
 *
 * Skipped tests target scenarios the playground does not expose (e.g. disabled
 * menubar item).
 */

import { test, expect } from '@playwright/test';

test.describe('NavigationMenu — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/navigation-menu');
  });

  test('NM-R16 — focus on trigger does NOT open submenu (F5, docblock corrected)', async ({
    page,
  }) => {
    // E142 L4 F5 resolved by docblock correction (option B): NavigationMenu
    // deliberately does NOT open on focus because that pattern pops every
    // submenu during Tab-through and breaks the Escape-restore flow (focus
    // returns to the parent trigger → submenu re-opens immediately, user
    // never escapes). Keyboard opens are via Enter/Space/ArrowDown.
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await trigger.focus();
    // No submenu open yet — focus is only supposed to update roving tabindex.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('NM-R17 — blur with relatedTarget inside content keeps open (via click-open path)', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await trigger.click();
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    const firstLink = submenu.getByRole('menuitem').first();
    await firstLink.focus();
    // Focus inside content — submenu stays visible.
    await expect(submenu).toBeVisible();
  });

  test('roving tabindex: first menubar item has tabindex=0 on mount', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    await expect(first).toHaveAttribute('tabindex', '0');
  });

  test('roving tabindex: focusing another menubar item updates tabindex', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    const second = menubar.getByRole('menuitem', { name: 'Solutions' });
    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(second).toHaveAttribute('tabindex', '0');
    await expect(first).toHaveAttribute('tabindex', '-1');
  });

  test('standalone menubar link is focusable and navigable via arrow keys', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const pricing = menubar.getByRole('menuitem', { name: 'Pricing', exact: true });
    await pricing.focus();
    await expect(pricing).toBeFocused();
    await expect(pricing).toHaveAttribute('tabindex', '0');
  });

  test('standalone active link exposes aria-current=page', async ({ page }) => {
    // Section 2 "Footer" menubar has About marked active
    const footerMenubar = page.getByRole('menubar', { name: 'Footer' });
    const about = footerMenubar.getByRole('menuitem', { name: 'About', exact: true });
    await expect(about).toHaveAttribute('aria-current', 'page');
  });

  test.skip('NM-R11 — click on disabled item: no focus steal, no state change [PLAYGROUND-DEP: no disabled menubar item in demo]', async () => {
    // Playground has no scenario with a disabled menubar item (aria-disabled="true").
    // Component supports it via the `disabled` prop on NavigationMenuTrigger;
    // when a demo adds it, unskip + assert aria-disabled + no state change on click.
  });

  test('Escape in submenu restores focus to parent menubar trigger (focus-restore path)', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const trigger = menubar.getByRole('menuitem', { name: 'Products' });
    await trigger.click();
    await page.getByRole('menu').getByRole('menuitem').first().focus();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
});
