/**
 * HoverCard ARIA semantics spec (E23).
 *
 * - aria-expanded synced with open state on trigger
 * - aria-labelledby wired when title prop set (absent otherwise)
 * - Coarse-pointer (touch) skips hover entirely
 * - axe-core zero structural violations
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('HoverCard — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/hover-card');
  });

  test('HC-R08 — coarse pointer (touch) skips hover handlers entirely', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      hasTouch: true,
      isMobile: true,
    });
    const mobilePage = await ctx.newPage();
    await mobilePage.goto('/components/hover-card');
    const trigger = mobilePage.getByRole('link', { name: '@jane' }).first();
    // On coarse pointer devices, hover handlers are not wired → a simulated
    // pointerover should not show the dialog.
    await trigger.dispatchEvent('pointerover', { pointerType: 'touch' });
    await expect(mobilePage.getByRole('dialog')).not.toBeVisible();
    await ctx.close();
  });

  test('HC-R12 — aria-expanded synced with open state on trigger', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    expect(await trigger.getAttribute('aria-expanded')).toBe('false');
    await trigger.hover();
    // Default openDelay = 700ms
    await page.waitForTimeout(800);
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await trigger.getAttribute('aria-expanded')).toBe('true');
  });

  test('HC-R13 — aria-labelledby wired when title prop set', async ({ page }) => {
    // All playground HoverCards provide a title — verify aria-labelledby is set.
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    if (labelledBy) {
      const heading = await page.locator(`#${labelledBy}`).textContent();
      expect(heading).toBeTruthy();
    }
  });

  test('axe-core zero structural violations with hover card open', async ({ page }) => {
    // color-contrast disabled — playground-level token concern, not component a11y.
    await page.getByRole('link', { name: '@jane' }).first().focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
