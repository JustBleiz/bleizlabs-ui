/**
 * ScrollArea focus behavior spec (E142 L3e).
 *
 * Coverage:
 * - SA-R04 thumb drag scrolls viewport proportionally
 * - SA-R05 focus visible on viewport (not thumb — thumb is visual + pointer)
 *
 * Playground: /components/scroll-area
 *   Section 2: visibility="always" — scrollbar always visible (stable for hover/drag)
 *   Section 6: tall+wide — both axes visible
 *
 * Selectors:
 * - Viewport: `div[tabindex="0"]` within a ScrollArea root (scoped per section)
 * - Thumb:   `[data-scroll-area-thumb]` (set by ScrollAreaThumb)
 * - Scrollbar: `[data-orientation="vertical" | "horizontal"]`
 */

import { test, expect } from '@playwright/test';

test.describe('ScrollArea — focus + pointer behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/scroll-area');
  });

  test('SA-R04 — thumb drag scrolls viewport proportionally', async ({ page }) => {
    // Section 2 — visibility="always" has the thumb always on screen.
    const sections = page.locator('section');
    const alwaysSection = sections.nth(1);
    const viewport = alwaysSection.locator('div[tabindex="0"]').first();
    const thumb = alwaysSection
      .locator('[data-scroll-area-thumb][data-orientation="vertical"]')
      .first();
    // Scroll thumb into the viewport BEFORE picking coordinates — playground
    // page is long enough that section 2 thumb can sit below the fold at
    // default 1280x720 which silently drops pointer events (no pointerdown
    // dispatched when target is off-screen).
    await thumb.scrollIntoViewIfNeeded();
    await expect(thumb).toBeVisible();
    const box = await thumb.boundingBox();
    if (!box) throw new Error('No thumb bounding box');
    const initial = await viewport.evaluate((el) => el.scrollTop);
    // Drag thumb down 80px — viewport.scrollTop should increase.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 80, {
      steps: 8,
    });
    await page.mouse.up();
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBeGreaterThan(initial);
  });

  test('SA-R05 — focus lands on viewport, not thumb (thumb has no tabindex)', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    await expect(viewport).toBeFocused();
    const thumb = basic.locator('[data-scroll-area-thumb]').first();
    // Thumb has no tabindex attr — not in Tab order.
    const tabindex = await thumb.getAttribute('tabindex');
    expect(tabindex).toBeNull();
  });

  test('Track click (not on thumb) pages scroll by viewport height', async ({ page }) => {
    // Section 2 — always-visible scrollbar. Clicking the track above/below
    // the thumb pages by one clientHeight (per ScrollArea.tsx:453).
    const sections = page.locator('section');
    const alwaysSection = sections.nth(1);
    const scrollbar = alwaysSection
      .locator('[data-orientation="vertical"][data-visible="true"]')
      .first();
    await scrollbar.scrollIntoViewIfNeeded();
    const viewport = alwaysSection.locator('div[tabindex="0"]').first();
    const sbBox = await scrollbar.boundingBox();
    if (!sbBox) throw new Error('No scrollbar box');
    // Click near the bottom of the track to page down (below the thumb).
    const initial = await viewport.evaluate((el) => el.scrollTop);
    await page.mouse.click(sbBox.x + sbBox.width / 2, sbBox.y + sbBox.height - 10);
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBeGreaterThan(initial);
  });

  test('Hover on root surfaces scrollbar (visibility="hover")', async ({ page }) => {
    const sections = page.locator('section');
    const hoverSection = sections.nth(2);
    const root = hoverSection.locator('[data-visibility="hover"]').first();
    const thumb = hoverSection.locator('[data-scroll-area-thumb]').first();
    // Pre-hover: scrollbar is hidden (opacity:0 + pointer-events:none).
    await root.hover();
    const scrollbar = hoverSection.locator('[data-orientation="vertical"]').first();
    await expect(scrollbar).toHaveAttribute('data-visible', 'true');
    await expect(thumb).toBeVisible();
  });
});
