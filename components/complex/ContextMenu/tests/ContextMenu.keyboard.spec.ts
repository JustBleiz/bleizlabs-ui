/**
 * ContextMenu keyboard interaction spec (E22).
 *
 * Inherits DropdownMenu keyboard model — ArrowDown/Up cycle, Home/End,
 * Enter/Space activate, Tab closes, typeahead. Key differences:
 * - Opened via right-click (contextmenu event)
 * - Focus restore target is pre-open activeElement, not a trigger
 */

import { test, expect } from '@playwright/test';

test.describe('ContextMenu — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/context-menu');
  });

  test('right-click on trigger opens menu with first item focused', async ({ page }) => {
    const trigger = page.getByText('Right-click me', { exact: true });
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('Escape closes menu and restores focus to the pre-open focused element (F7)', async ({
    page,
  }) => {
    // E142 L4 F7 — preOpenFocusRef snapshots activeElement on pointerdown
    // (before the browser's mousedown blurs it), so Escape restore lands
    // on the element that was focused BEFORE the right-click.
    const focusTarget = page.getByRole('button', { name: /Focus anchor/ });
    await focusTarget.scrollIntoViewIfNeeded();
    await focusTarget.focus();
    const trigger = page.getByText('Right-click me', { exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    await expect(focusTarget).toBeFocused();
  });

  test('ArrowDown cycles with wraparound', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    const itemCount = await page.getByRole('menuitem').count();
    // Press ArrowDown itemCount times — returns to first item after full cycle
    for (let i = 0; i < itemCount; i++) {
       
      await page.keyboard.press('ArrowDown');
    }
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('Home jumps to first item, End jumps to last', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('menuitem').last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('Enter activates item and closes menu', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('Tab closes menu', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('ArrowDown skips disabled items', async ({ page }) => {
    const trigger = page.getByText('Right-click with disabled', { exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    for (let i = 0; i < 10; i++) {
       
      await page.keyboard.press('ArrowDown');
       
      const ariaDisabled = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-disabled'),
      );
      expect(ariaDisabled).not.toBe('true');
    }
  });

  test('typeahead jumps to matching item', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('d');
    // Should land on an item starting with 'd' (Delete or Duplicate)
    const active = await page.evaluate(() =>
      document.activeElement?.textContent?.toLowerCase().startsWith('d'),
    );
    expect(active).toBe(true);
  });
});
