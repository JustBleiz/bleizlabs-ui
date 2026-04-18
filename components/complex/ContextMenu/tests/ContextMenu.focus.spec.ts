/**
 * ContextMenu focus management spec (E22).
 *
 * Focus contract:
 * - On open: focus moves to first non-disabled menuitem (rAF deferred)
 * - On close: focus restores to pre-open activeElement
 * - On close via scroll: no explicit focus restore
 */

import { test, expect } from '@playwright/test';

test.describe('ContextMenu — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/context-menu');
  });

  test('on open: first non-disabled item receives focus', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('on close via Escape: focus restores to the pre-right-click focused element (F7)', async ({
    page,
  }) => {
    // E142 L4 F7 — preOpenFocusRef captures document.activeElement on
    // pointerdown (BEFORE mousedown blurs it), so Escape restore lands on
    // the button that was focused when the user right-clicked.
    const anchor = page.getByRole('button', { name: /Focus anchor/ });
    await anchor.scrollIntoViewIfNeeded();
    await anchor.focus();
    const trigger = page.getByText('Right-click me', { exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    await expect(anchor).toBeFocused();
  });

  test('on close via item select: menu closes', async ({ page }) => {
    const anchor = page.getByRole('button', { name: /Focus anchor/ });
    await anchor.focus();
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('on close via Tab: focus does NOT stay on a menu item', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).not.toBeVisible();
    const activeRole = await page.evaluate(() =>
      document.activeElement?.getAttribute('role'),
    );
    expect(activeRole).not.toBe('menuitem');
  });

  test('on close via scroll: menu closes (OS convention)', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    await page.evaluate(() => window.scrollBy(0, 100));
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('disabled items are never focused by keyboard nav', async ({ page }) => {
    const trigger = page.getByText('Right-click with disabled', { exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    for (let i = 0; i < 20; i++) {
       
      await page.keyboard.press('ArrowDown');
       
      const ariaDisabled = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-disabled'),
      );
      expect(ariaDisabled).not.toBe('true');
    }
  });

  test('tabIndex: all items have tabIndex=-1 (menu uses arrow keys)', async ({
    page,
  }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    const tabIndices = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="menuitem"]')).map(
        (el) => (el as HTMLElement).tabIndex,
      ),
    );
    expect(tabIndices.length).toBeGreaterThan(0);
    expect(tabIndices.every((t) => t === -1)).toBe(true);
  });
});
