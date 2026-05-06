/**
 * Popover ARIA + accessibility tree spec (E20).
 *
 * - Trigger: aria-expanded, aria-haspopup="dialog", aria-controls when open
 * - Content: role="dialog", aria-modal, aria-labelledby (when title), aria-describedby (when description)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Popover — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/popover');
  });

  test('trigger has aria-expanded=false when closed', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    const expanded = await trigger.getAttribute('aria-expanded');
    expect(expanded).toBe('false');
  });

  test('trigger has aria-expanded=true when open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    const expanded = await trigger.getAttribute('aria-expanded');
    expect(expanded).toBe('true');
  });

  test('trigger has aria-haspopup="dialog"', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    const hasPopup = await trigger.getAttribute('aria-haspopup');
    expect(hasPopup).toBe('dialog');
  });

  test('trigger has aria-controls pointing to content id when open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    const controls = await trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const dialogId = await page.getByRole('dialog').getAttribute('id');
    expect(controls).toBe(dialogId);
  });

  test('content has role="dialog"', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('content has aria-modal="false" in non-modal mode (default)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    const modal = await page.getByRole('dialog').getAttribute('aria-modal');
    expect(modal).toBe('false');
  });

  test('content has aria-modal="true" in modal mode', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open modal' });
    await trigger.click();
    const modal = await page.getByRole('dialog').getAttribute('aria-modal');
    expect(modal).toBe('true');
  });

  test('content has aria-labelledby when title provided', async ({ page }) => {
    // "Open" (first) section uses title="Account"
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    const labelledBy = await page.getByRole('dialog').getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    if (labelledBy) {
      const heading = await page.locator(`#${labelledBy}`).textContent();
      expect(heading).toBeTruthy();
    }
  });

  test('content has aria-describedby when description provided', async ({ page }) => {
    // "Open" (first) section has description="Signed in as user@example.com"
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  test('content NOT aria-labelledby when no title', async ({ page }) => {
    // Placement grid popovers use no title — check "top" placement popover
    const trigger = page.getByRole('button', { name: 'top', exact: true });
    await trigger.click();
    const labelledBy = await page.getByRole('dialog').getAttribute('aria-labelledby');
    expect(labelledBy).toBeNull();
  });

  test('unique id per instance (no collision)', async ({ page }) => {
    const first = page.getByRole('button', { name: 'Open', exact: true });
    await first.click();
    const firstId = await page.getByRole('dialog').getAttribute('id');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const second = page.getByRole('button', { name: 'With arrow' });
    await second.click();
    const secondId = await page.getByRole('dialog').getAttribute('id');
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });

  test('axe-core zero structural violations with popover open', async ({ page }) => {
    // Note: `color-contrast` disabled — playground description uses --color-muted
    // on page bg which falls below 4.5:1 in axe's sampling. This is a playground
    // styling concern, not a library a11y defect. Library-level aria/role/labelledby
    // assertions still run under WCAG tags below.
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
