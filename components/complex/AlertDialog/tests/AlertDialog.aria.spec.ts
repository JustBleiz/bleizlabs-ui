/**
 * AlertDialog ARIA attributes + accessibility tree spec — APG `/alertdialog/` compliance (E16).
 *
 * Coverage:
 * - role="alertdialog" present (NOT role="dialog")
 * - aria-modal="true" present
 * - aria-labelledby references the title element
 * - aria-describedby ALWAYS present (REQUIRED per APG /alertdialog/, unlike Dialog)
 * - Severity classes do not alter accessibility tree (visual only)
 * - axe-core zero violations when alert is OPEN
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('AlertDialog — ARIA compliance (APG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/alert-dialog');
  });

  test('role="alertdialog" attribute present (not plain dialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute('role', 'alertdialog');
    const dialogLocator = page.locator('[role="dialog"]');
    await expect(dialogLocator).toHaveCount(0);
  });

  test('aria-modal="true" attribute present', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby references visible title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const labelledBy = await alert.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('aria-describedby ALWAYS present (REQUIRED per APG alertdialog)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test('aria-describedby element contains description text', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    const descText = await page.locator(`#${describedBy}`).textContent();
    expect(descText).toMatch(/cannot be undone/i);
  });

  test('Severity variants do not change ARIA role or attributes', async ({ page }) => {
    for (const kind of ['basic', 'critical', 'info']) {
      await page.getByRole('button', { name: new RegExp(`open ${kind} alert`, 'i') }).click();
      const alert = page.getByRole('alertdialog');
      await expect(alert).toHaveAttribute('role', 'alertdialog');
      await expect(alert).toHaveAttribute('aria-modal', 'true');
      await expect(alert).toHaveAttribute('aria-labelledby', /.+/);
      await expect(alert).toHaveAttribute('aria-describedby', /.+/);
      await page.keyboard.press('Escape');
      await expect(alert).not.toBeVisible();
    }
  });

  test('aria snapshot exposes alertdialog role with accessible name', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.waitForTimeout(50);
    const alert = page.getByRole('alertdialog');
    const snapshot = await alert.ariaSnapshot();
    expect(snapshot).toContain('alertdialog');
    expect(snapshot).toContain('Discard unsaved changes?');
  });

  test('axe-core zero violations when alert is open', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.waitForTimeout(50);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
