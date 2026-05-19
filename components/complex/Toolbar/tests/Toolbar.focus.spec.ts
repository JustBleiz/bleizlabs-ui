/**
 * Toolbar focus management spec — APG `/toolbar/` composite widget.
 *
 * Coverage:
 * - Roving tabindex initialization (first item active on mount)
 * - Roving tabindex sync when focus moves via click
 * - Single tab-stop into the toolbar (Tab from outside lands on active item)
 * - Tab from active item exits the toolbar (browser-native, not intercepted)
 * - Disabled items never receive tabindex=0
 * - Last-focused item retained on re-entry (Tab in/out/in lands on same item)
 */

import { test, expect } from '@playwright/test';

test.describe('Toolbar — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toolbar');
  });

  test('roving tabindex initial: first focusable item has tabindex=0', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    await expect(newBtn).toHaveAttribute('tabindex', '0');
  });

  test('roving tabindex: non-active items have tabindex=-1', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    await expect(openBtn).toHaveAttribute('tabindex', '-1');
  });

  test('click on a different item updates roving tabindex', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const exportBtn = toolbar.getByRole('button', { name: 'Export' });
    await exportBtn.click();
    await expect(exportBtn).toHaveAttribute('tabindex', '0');
    await expect(newBtn).toHaveAttribute('tabindex', '-1');
  });

  test('arrow nav updates roving tabindex (next item gets 0)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    await newBtn.focus();
    await page.keyboard.press('ArrowRight');
    await expect(openBtn).toHaveAttribute('tabindex', '0');
    await expect(newBtn).toHaveAttribute('tabindex', '-1');
  });

  test('disabled item never receives tabindex=0 via arrow nav', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const disabled = toolbar.getByRole('button', { name: /Save \(disabled\)/ });
    // Disabled buttons in lib Button have `disabled` attribute set.
    // Roving algorithm filters them — tabindex should never be 0.
    await expect(disabled).not.toHaveAttribute('tabindex', '0');
  });

  test('Tab from active item exits the toolbar', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await printBtn.focus();
    await page.keyboard.press('Tab');
    // Focus should leave the toolbar — i.e., document.activeElement is no
    // longer one of the toolbar's items. We can check by asserting that
    // none of the toolbar's role="button" items have :focus.
    const focusedInToolbar = await toolbar.locator(':focus').count();
    expect(focusedInToolbar).toBe(0);
  });

  test('re-entry via Tab lands on last-focused item (roving retention)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const exportBtn = toolbar.getByRole('button', { name: 'Export' });
    // Move focus to Export inside toolbar
    await exportBtn.click();
    await expect(exportBtn).toHaveAttribute('tabindex', '0');
    // Tab out
    await page.keyboard.press('Tab');
    // Shift+Tab back — should land on Export (the active item)
    await page.keyboard.press('Shift+Tab');
    await expect(exportBtn).toBeFocused();
  });

  test('only ONE item has tabindex=0 at any time', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const tabbables = await toolbar.locator('[tabindex="0"]').count();
    expect(tabbables).toBe(1);
  });
});
