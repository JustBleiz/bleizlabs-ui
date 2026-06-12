/**
 * Card regression spec — accent variant visual contract (E04 audit remediation).
 *
 * Coverage:
 * - CD-R01 variant="accent" renders the documented left accent border
 *   (--border-width-accent, brand color) — pre-fix .accentLeft was a dead
 *   class no variant referenced, so accent === default visually
 * - CD-R02 default variant carries NO accent-width left border (guard against
 *   wiring the accent into the wrong class)
 *
 * Demo route: /components/card (section 2 — accent variant).
 */

import { test, expect } from '@playwright/test';

test.describe('Card — accent variant', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/card');
  });

  test('CD-R01 — accent variant renders the left accent border', async ({ page }) => {
    // CSS-module class marker — heading-based ancestor walks are ambiguous
    // (CardHeader/CardBody ship their own .root classes).
    const card = page.locator('[class*="variantAccent"]').first();
    await expect(card).toBeVisible();
    const border = await card.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderLeftWidth, style: cs.borderLeftStyle };
    });
    // --border-width-accent: 3px (micro token) — pre-fix this was 1px (subtle).
    expect(border).toEqual({ width: '3px', style: 'solid' });
  });

  test('CD-R02 — default variant has no accent-width left border', async ({ page }) => {
    const card = page.locator('[class*="variantDefault"]').first();
    await expect(card).toBeVisible();
    const width = await card.evaluate((el) => window.getComputedStyle(el).borderLeftWidth);
    expect(width).toBe('1px');
  });
});
