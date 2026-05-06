/**
 * Drawer ARIA attributes + accessibility tree spec — APG `/dialog-modal/` compliance (E17).
 *
 * Coverage:
 * - role="dialog" present (NOT alertdialog — Drawer is a generic container)
 * - aria-modal="true" present
 * - aria-labelledby references the title element
 * - aria-describedby present ONLY when description prop provided (Radix #3007)
 * - Background elements receive `inert` attribute while drawer open
 * - axe-core zero violations when drawer is OPEN
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Drawer — ARIA compliance (APG dialog-modal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/drawer');
  });

  test('role="dialog" attribute present (NOT alertdialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test('aria-modal="true" attribute present', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby references visible title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const labelledBy = await drawer.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('aria-describedby present when description provided', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const describedBy = await drawer.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test('aria-describedby absent when description omitted', async ({ page }) => {
    await page.getByRole('button', { name: /open text-only drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const describedBy = await drawer.getAttribute('aria-describedby');
    expect(describedBy).toBeFalsy();
  });

  test('Background siblings have inert attribute while drawer open', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const mainHasInert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInert).toBe(true);

    await page.keyboard.press('Escape');
    const mainHasInertAfter = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainHasInertAfter).toBe(false);
  });

  test('aria snapshot exposes dialog role with accessible name', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await page.waitForTimeout(50);
    const drawer = page.getByRole('dialog');
    const snapshot = await drawer.ariaSnapshot();
    expect(snapshot).toContain('dialog');
    expect(snapshot).toContain('Confirm action');
  });

  test('axe-core zero violations when drawer is open', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await page.waitForTimeout(50);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
