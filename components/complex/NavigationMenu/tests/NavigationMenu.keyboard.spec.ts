/**
 * NavigationMenu keyboard interaction spec — APG `/menubar/` compliance (E142 L3c).
 *
 * Coverage:
 * - Right/Left arrow navigation across menubar items with wraparound
 * - Down/Enter/Space opens submenu focusing first item
 * - Up opens submenu focusing last item
 * - Escape inside submenu closes + restores focus to parent menubar item
 * - Typeahead (printable char)
 * - Home/End scope-aware (menubar vs submenu)
 * - Rapid arrow bounce stability
 * - Tab closes submenu + lets browser propagate
 */

import { test, expect } from '@playwright/test';

test.describe('NavigationMenu — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/navigation-menu');
  });

  test('Right arrow moves focus to next menubar item', async ({ page }) => {
    // Scope to first menubar (demo has several — section 1 uses "Main" label).
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const products = menubar.getByRole('menuitem', { name: 'Products' });
    const solutions = menubar.getByRole('menuitem', { name: 'Solutions' });
    await products.focus();
    await page.keyboard.press('ArrowRight');
    await expect(solutions).toBeFocused();
  });

  test('Left arrow wraps from first to last item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    const last = menubar.getByRole('menuitem', { name: 'Pricing', exact: true });
    await first.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(last).toBeFocused();
  });

  test('Right arrow wraps from last to first item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    const last = menubar.getByRole('menuitem', { name: 'Pricing', exact: true });
    await last.focus();
    await page.keyboard.press('ArrowRight');
    await expect(first).toBeFocused();
  });

  test('Enter on trigger opens submenu + focuses first submenu item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const products = menubar.getByRole('menuitem', { name: 'Products' });
    await products.focus();
    await page.keyboard.press('Enter');
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    const firstItem = submenu.getByRole('menuitem', { name: 'Web Apps' });
    await expect(firstItem).toBeFocused();
  });

  test('Space on trigger opens submenu + focuses first submenu item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const products = menubar.getByRole('menuitem', { name: 'Products' });
    await products.focus();
    await page.keyboard.press(' ');
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole('menuitem', { name: 'Web Apps' })).toBeFocused();
  });

  test('ArrowDown on trigger opens submenu + focuses first item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const products = menubar.getByRole('menuitem', { name: 'Products' });
    await products.focus();
    await page.keyboard.press('ArrowDown');
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole('menuitem', { name: 'Web Apps' })).toBeFocused();
  });

  test('ArrowUp on trigger opens submenu + focuses LAST item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const products = menubar.getByRole('menuitem', { name: 'Products' });
    await products.focus();
    await page.keyboard.press('ArrowUp');
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    // Products has 4 links; last is "CLI Tools"
    await expect(submenu.getByRole('menuitem', { name: 'CLI Tools' })).toBeFocused();
  });

  test('ArrowDown/ArrowUp inside submenu cycles items (wraparound)', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await menubar.getByRole('menuitem', { name: 'Products' }).click();
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    // Products has 4 links: Web Apps, Mobile Apps, Desktop Apps, CLI Tools.
    const firstLink = submenu.getByRole('menuitem', { name: 'Web Apps' });
    const lastLink = submenu.getByRole('menuitem', { name: 'CLI Tools' });
    // useFloatingFocus auto-focuses first link on open
    await expect(firstLink).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(lastLink).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(firstLink).toBeFocused();
  });

  test('NM-R09 — typeahead jumps to next item starting with char', async ({ page }) => {
    // Keyboard demo (section 7) has items starting with unique letters
    // Alpine / Boreal / Coastal / Desert
    const menubar = page.getByRole('menubar', { name: 'Keyboard demo' });
    const alpine = menubar.getByRole('menuitem', { name: 'Alpine' });
    const boreal = menubar.getByRole('menuitem', { name: 'Boreal' });
    await alpine.focus();
    await page.keyboard.press('b');
    await expect(boreal).toBeFocused();
  });

  test('NM-R10 — Escape in submenu returns focus to parent menubar item', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const productsTrigger = menubar.getByRole('menuitem', { name: 'Products' });
    await productsTrigger.click();
    const submenu = page.getByRole('menu');
    const submenuItem = submenu.getByRole('menuitem').first();
    await submenuItem.focus();
    await page.keyboard.press('Escape');
    await expect(productsTrigger).toBeFocused();
    await expect(submenu).not.toBeVisible();
  });

  test('NM-R12 — rapid Left/Right arrow bounce does not stutter focus', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    await first.focus();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
    }
    await expect(first).toBeFocused();
  });

  test('NM-R13 — End inside submenu jumps to last submenu item (not last menubar item)', async ({
    page,
  }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await menubar.getByRole('menuitem', { name: 'Products' }).click();
    const submenu = page.getByRole('menu');
    // Gate — wait for useFloatingFocus to land initial focus
    await expect(submenu.getByRole('menuitem', { name: 'Web Apps' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(submenu.getByRole('menuitem', { name: 'CLI Tools' })).toBeFocused();
  });

  test('Home inside submenu jumps to first submenu item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await menubar.getByRole('menuitem', { name: 'Products' }).click();
    const submenu = page.getByRole('menu');
    // Wait for initial focus to land, then move to last with End first
    const firstLink = submenu.getByRole('menuitem', { name: 'Web Apps' });
    const lastLink = submenu.getByRole('menuitem', { name: 'CLI Tools' });
    await expect(firstLink).toBeFocused();
    await page.keyboard.press('End');
    await expect(lastLink).toBeFocused();
    await page.keyboard.press('Home');
    await expect(firstLink).toBeFocused();
  });

  test('Home on menubar focuses first menubar item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    const last = menubar.getByRole('menuitem', { name: 'Pricing', exact: true });
    await last.focus();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
  });

  test('End on menubar focuses last menubar item', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    const first = menubar.getByRole('menuitem', { name: 'Products' });
    const last = menubar.getByRole('menuitem', { name: 'Pricing', exact: true });
    await first.focus();
    await page.keyboard.press('End');
    await expect(last).toBeFocused();
  });

  test('ArrowRight inside submenu advances to the NEXT menubar item (F6)', async ({
    page,
  }) => {
    // E142 L4 F6 — submenu ArrowRight now calls stopPropagation so the
    // list-level handler cannot also advance (previously doubled up).
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await menubar.getByRole('menuitem', { name: 'Products' }).click();
    const submenu = page.getByRole('menu');
    await submenu.getByRole('menuitem').first().focus();
    await page.keyboard.press('ArrowRight');
    // Products submenu closed, next menubar item (Solutions) is focused AND
    // its submenu is open (matches APG: close current, advance one step,
    // open next submenu if it has one).
    const solutions = menubar.getByRole('menuitem', { name: 'Solutions' });
    await expect(solutions).toBeFocused();
  });

  test('Tab inside submenu closes submenu + exits menubar', async ({ page }) => {
    const menubar = page.getByRole('menubar', { name: 'Main' });
    await menubar.getByRole('menuitem', { name: 'Products' }).click();
    const submenu = page.getByRole('menu');
    await expect(submenu).toBeVisible();
    await submenu.getByRole('menuitem').first().focus();
    await page.keyboard.press('Tab');
    // Submenu closes + focus propagates to next tabbable (browser default)
    await expect(submenu).not.toBeVisible();
  });
});
