/**
 * Banner regression spec — theme-aware dismiss hover scrim (E04 audit
 * remediation).
 *
 * Coverage:
 * - BN-R01 dismiss hover scrim is theme-aware (light theme: dark-ish scrim;
 *   dark theme: light-ish scrim) — pre-fix it was a hardcoded
 *   `rgb(0 0 0 / 0.06)` (theme-blind: invisible/inverted on dark surfaces)
 *
 * Demo route: /components/banner (section 2 — dismissible).
 */

import { test, expect } from '@playwright/test';

async function hoverScrimRgb(page: import('@playwright/test').Page): Promise<number[]> {
  const dismiss = page.getByRole('button', { name: 'Dismiss banner' }).first();
  await dismiss.hover();
  return dismiss.evaluate((el) => {
    const bg = window.getComputedStyle(el).backgroundColor;
    const m = bg.match(/\d+(\.\d+)?/g);
    let channels = m ? m.slice(0, 3).map(Number) : [];
    // color-mix() computes to `color(srgb r g b / a)` with 0-1 floats in
    // Chromium; plain rgb() uses 0-255 ints — normalize to 0-255.
    if (channels.length === 3 && channels.every((v) => v <= 1)) {
      channels = channels.map((v) => v * 255);
    }
    return channels;
  });
}

test.describe('Banner — dismiss hover scrim', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/banner');
  });

  test('BN-R01 — hover scrim follows the theme (color-mix on text-primary)', async ({ page }) => {
    // Dark theme (demo default on this stack is data-theme on <html>) — force
    // both states explicitly so the assertion is deterministic.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await hoverScrimRgb(page);
    expect(dark.length).toBe(3);
    // Pre-fix: rgb(0 0 0 / .06) → channels [0,0,0]. Post-fix the scrim mixes
    // from --color-text-primary, which is LIGHT in dark theme.
    expect(Math.max(...dark)).toBeGreaterThan(100);

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const light = await hoverScrimRgb(page);
    expect(light.length).toBe(3);
    // Light theme: text-primary is dark → scrim channels stay dark.
    expect(Math.max(...light)).toBeLessThan(155);
  });
});
