/**
 * DropdownMenu ARIA + accessibility tree spec (E21).
 *
 * - Trigger: aria-haspopup="menu", aria-expanded, aria-controls when open
 * - Content: role="menu" (no aria-modal)
 * - Items: role="menuitem", aria-disabled when disabled, absent otherwise
 * - Separators/groups with labelledBy
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DropdownMenu — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/dropdown-menu');
  });

  test('trigger has aria-haspopup="menu" (not "dialog")', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    const hasPopup = await trigger.getAttribute('aria-haspopup');
    expect(hasPopup).toBe('menu');
  });

  test('trigger has aria-expanded=false when closed', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  });

  test('trigger has aria-expanded=true when open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    expect(await trigger.getAttribute('aria-expanded')).toBe('true');
  });

  test('trigger has aria-controls pointing to menu id when open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    const controls = await trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const menuId = await page.getByRole('menu').getAttribute('id');
    expect(controls).toBe(menuId);
  });

  test('content has role="menu"', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
  });

  test('content does NOT have aria-modal attribute', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const ariaModal = await page.getByRole('menu').getAttribute('aria-modal');
    expect(ariaModal).toBeNull();
  });

  test('items have role="menuitem"', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const items = await page.locator('[role="menuitem"]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('disabled item has aria-disabled="true"', async ({ page }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const disabledItem = page.getByRole('menuitem', { name: /Save as/i });
    const ariaDisabled = await disabledItem.getAttribute('aria-disabled');
    expect(ariaDisabled).toBe('true');
  });

  test('non-disabled item does NOT have aria-disabled attribute', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const item = page.getByRole('menuitem', { name: 'Save' });
    const ariaDisabled = await item.getAttribute('aria-disabled');
    // Should be null (not "false") — only set when disabled
    expect(ariaDisabled).toBeNull();
  });

  test('separator has role="separator" and aria-orientation="horizontal"', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const separator = page.getByRole('separator').first();
    await expect(separator).toBeVisible();
    expect(await separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  test('group has role="group" with aria-labelledby pointing to label', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const group = page.getByRole('group').first();
    const labelledBy = await group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    if (labelledBy) {
      const labelText = await page.locator(`#${labelledBy}`).textContent();
      expect(labelText).toBeTruthy();
    }
  });

  test('unique ids per instance (no collision)', async ({ page }) => {
    const first = page.getByRole('button', { name: 'Actions' });
    await first.click();
    const firstId = await page.getByRole('menu').getAttribute('id');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    const second = page.getByRole('button', { name: 'File' });
    await second.click();
    const secondId = await page.getByRole('menu').getAttribute('id');
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });

  test('axe-core zero structural violations with menu open', async ({ page }) => {
    // color-contrast disabled — playground-level token concern, not component a11y.
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
