/**
 * Dialog ARIA accessibility tree spec — APG role/property compliance (E15).
 *
 * Coverage:
 * - role="dialog" + aria-modal="true"
 * - aria-labelledby points to a rendered element with matching id
 * - aria-describedby only present when description provided (Radix #3007)
 * - axe-core zero violations when dialog is OPEN (smoke only covers closed state)
 * - Accessibility snapshot matches expected shape
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dialog — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    // Eliminate 250ms slide/fade animation so axe reads post-animation colors
    // deterministically (animation-duration drops to 1ms under reduced-motion).
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/dialog');
  });

  test('has role="dialog" + aria-modal + aria-labelledby', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const labelElement = page.locator(`#${labelledBy}`);
    await expect(labelElement).toBeVisible();
  });

  test('aria-describedby present only when description provided (Radix #3007)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    let dialog = page.getByRole('dialog');
    let describedBy = await dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await page.getByRole('button', { name: /open no-description dialog/i }).click();
    dialog = page.getByRole('dialog');
    describedBy = await dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeNull();
  });

  test('aria snapshot exposes dialog role with accessible name', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await page.waitForTimeout(50);

    // Locator.ariaSnapshot returns the YAML-like ARIA tree for the dialog content.
    // We assert the dialog role + its accessible name (title) are present.
    const dialog = page.getByRole('dialog');
    const snapshot = await dialog.ariaSnapshot();
    expect(snapshot).toContain('dialog');
    expect(snapshot).toContain('Confirm delete');
  });

  test('axe-core zero violations when dialog is open', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    await page.waitForTimeout(50);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('close button has accessible name', async ({ page }) => {
    await page.getByRole('button', { name: /open basic dialog/i }).click();
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: /close dialog/i });
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveAttribute('aria-label', /close/i);
  });
});
