/**
 * Tooltip ARIA + accessibility tree spec — APG `/tooltip/` compliance (E19).
 *
 * Key distinction: `aria-describedby` (supplemental) NOT `aria-labelledby` (naming).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tooltip — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/tooltip');
  });

  test('role="tooltip" on floating content', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).focus();
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
  });

  test('aria-describedby wired to tooltip id', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-describedby', /.+/);
    const describedBy = await trigger.getAttribute('aria-describedby');
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toHaveAttribute('id', describedBy!);
  });

  test('id unique per instance — no collision between sibling tooltips [Radix #899]', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    const undo = page.getByRole('button', { name: 'Undo' });
    await save.focus();
    await expect(save).toHaveAttribute('aria-describedby', /.+/);
    const firstId = await save.getAttribute('aria-describedby');
    await undo.focus();
    await expect(undo).toHaveAttribute('aria-describedby', /.+/);
    const secondId = await undo.getAttribute('aria-describedby');
    expect(firstId).not.toBe(secondId);
  });

  test('tooltip id stable across show/hide cycles', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-describedby', /.+/);
    const idFirstShow = await trigger.getAttribute('aria-describedby');
    await page.getByRole('button', { name: 'Undo' }).focus();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-describedby', /.+/);
    const idSecondShow = await trigger.getAttribute('aria-describedby');
    expect(idFirstShow).toBe(idSecondShow);
  });

  test('aria-describedby absent when tooltip hidden', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    // Before focus — no aria-describedby (tooltip not open)
    await expect(trigger).not.toHaveAttribute('aria-describedby', /.+/);
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-describedby', /.+/);
  });

  test('content NOT wired as aria-labelledby (tooltip is supplemental, not naming)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    const labelledBy = await trigger.getAttribute('aria-labelledby');
    expect(labelledBy).toBeNull();
  });

  test('axe-core zero violations with tooltip open', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
