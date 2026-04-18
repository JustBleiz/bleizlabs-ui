/**
 * Slider ARIA semantics spec — APG `/slider/` (E142 L3d2).
 *
 * Coverage:
 * - SL-R17 role="slider" + aria-valuenow/valuemin/valuemax on thumb
 * - SL-R18 aria-orientation matches prop
 * - SL-R19 aria-valuetext reflects formatValue output
 * - SL-R20 aria-labelledby when label associated externally
 * - data-orientation attribute on root + thumb
 * - axe-core zero violations (default + vertical + RTL)
 *
 * Playground: /components/slider
 *   idx 0: Basic aria-label="Basic slider", defaultValue=25
 *   idx 1: Volume aria-labelledby="volume-label", formatValue="X percent"
 *   idx 2: Price (min=0 max=1000)
 *   idx 5: RTL
 *   idx 7: Vertical aria-label="Vertical value"
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Slider — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
  });

  test('SL-R17 — role="slider" + aria-valuenow/valuemin/valuemax', async ({
    page,
  }) => {
    // Section 3 — Price min=0 max=1000, starts at 250
    const sections = page.locator('section');
    const price = sections.nth(2);
    const thumb = price.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '250');
    await expect(thumb).toHaveAttribute('aria-valuemin', '0');
    await expect(thumb).toHaveAttribute('aria-valuemax', '1000');
  });

  test('SL-R18 — aria-orientation matches prop (horizontal default + vertical)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const horizontalThumb = basic.getByRole('slider');
    await expect(horizontalThumb).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
    const vertical = sections.nth(7);
    const verticalThumb = vertical.getByRole('slider');
    await expect(verticalThumb).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('SL-R19 — aria-valuetext reflects formatValue output', async ({
    page,
  }) => {
    // Section 2 — Volume formatValue=(v) => `${v} percent` (starts 30)
    const sections = page.locator('section');
    const volume = sections.nth(1);
    const thumb = volume.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuetext', '30 percent');
    // Change value, valuetext updates
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuetext', '31 percent');
  });

  test('SL-R20 — aria-labelledby links thumb to external label', async ({
    page,
  }) => {
    const thumb = page
      .locator('[role="slider"][aria-labelledby="volume-label"]')
      .first();
    await expect(thumb).toBeVisible();
    const label = page.locator('#volume-label');
    await expect(label).toHaveText('Volume');
  });

  test('data-orientation attribute on root matches orientation', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const vertical = sections.nth(7);
    // Root span with data-orientation attr
    const root = vertical.locator('[data-orientation="vertical"]').first();
    await expect(root).toBeVisible();
  });

  test('aria-disabled on disabled thumb', async ({ page }) => {
    const thumb = page
      .getByRole('slider', { name: 'Disabled (aria-disabled, focusable)' })
      .first();
    await expect(thumb).toHaveAttribute('aria-disabled', 'true');
  });

  test('aria-readonly on read-only thumb', async ({ page }) => {
    const thumb = page
      .getByRole('slider', { name: 'Read-only (focusable, no changes)' })
      .first();
    await expect(thumb).toHaveAttribute('aria-readonly', 'true');
  });

  test('aria snapshot contains slider role', async ({ page }) => {
    const thumb = page.getByRole('slider').first();
    const snapshot = await thumb.ariaSnapshot();
    expect(snapshot).toContain('slider');
  });

  test('axe-core zero violations — default playground', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after keyboard changes', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const volume = sections.nth(1);
    const thumb = volume.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('PageUp');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
