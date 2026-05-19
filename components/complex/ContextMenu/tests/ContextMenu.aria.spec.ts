/**
 * ContextMenu ARIA + accessibility tree spec (E22).
 *
 * Trigger is NOT a widget — no aria-haspopup/expanded/controls on the wrapper.
 * Content: role="menu" (no aria-modal), items role="menuitem", separators/groups.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('ContextMenu — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/context-menu');
  });

  test('content has role="menu"', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.locator('[role="menu"]')).toBeVisible();
  });

  test('content does NOT have aria-modal attribute', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    const ariaModal = await page.getByRole('menu').getAttribute('aria-modal');
    expect(ariaModal).toBeNull();
  });

  test('items have role="menuitem"', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    const items = await page.locator('[role="menuitem"]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('disabled item has aria-disabled="true"', async ({ page }) => {
    const trigger = page.getByText('Right-click with disabled', { exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    const disabled = page.getByRole('menuitem', { name: /Save as/i });
    expect(await disabled.getAttribute('aria-disabled')).toBe('true');
  });

  test('separator has role="separator" with horizontal orientation', async ({ page }) => {
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    const separator = page.getByRole('separator').first();
    await expect(separator).toBeVisible();
    expect(await separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  test('group has role="group" with aria-labelledby pointing to label', async ({ page }) => {
    // File-row demos use groups with labels (e.g. "File actions")
    const fileRow = page.getByText('report.pdf').locator('..');
    await fileRow.scrollIntoViewIfNeeded();
    await fileRow.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    const group = page.getByRole('group').first();
    const labelledBy = await group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    if (labelledBy) {
      const labelText = await page.locator(`#${labelledBy}`).textContent();
      expect(labelText).toBeTruthy();
    }
  });

  test('trigger wrapper does NOT have aria-haspopup', async ({ page }) => {
    const trigger = page.getByText('Right-click me', { exact: true });
    const hasPopup = await trigger.getAttribute('aria-haspopup');
    expect(hasPopup).toBeNull();
  });

  test('trigger wrapper does NOT have aria-expanded', async ({ page }) => {
    const trigger = page.getByText('Right-click me', { exact: true });
    const expanded = await trigger.getAttribute('aria-expanded');
    expect(expanded).toBeNull();
  });

  test('unique content id per instance', async ({ page }) => {
    const first = page.getByText('Right-click me', { exact: true });
    await first.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    const firstId = await page.getByRole('menu').getAttribute('id');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    const second = page.getByText('Right-click with disabled', { exact: true });
    await second.scrollIntoViewIfNeeded();
    await second.click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    const secondId = await page.getByRole('menu').getAttribute('id');
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });

  test('data-placement reflects actual flip result', async ({ page }) => {
    const trigger = page.getByText('Right-click me', { exact: true });
    await trigger.click({ button: 'right' });
    const placement = await page.getByRole('menu').getAttribute('data-placement');
    // Default is bottom-start; may flip — must match one of the valid placements
    expect(placement).toMatch(/^(bottom|top|left|right)/);
  });

  test('axe-core zero structural violations with menu open', async ({ page }) => {
    // color-contrast disabled — playground-level token concern, not component a11y.
    await page.getByText('Right-click me', { exact: true }).click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
