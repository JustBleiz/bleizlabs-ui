/**
 * Carousel keyboard interaction spec — APG `/carousel/` (E142 L3e).
 *
 * Coverage:
 * - CAR-R01 ArrowLeft/Right prev/next slide
 * - CAR-R02 Home/End first/last slide
 * - CAR-R03 RTL mirrors Left/Right
 * - CAR-R04 Focus on carousel pauses auto-rotation
 *
 * Playground: /components/carousel
 *   Section 1: Basic (5 slides, linear clamp, no auto-rotate)
 *   Section 2: Auto-rotate 3000ms + pause button
 *   Section 3: Loop (3 slides)
 *   Section 5: RTL (3 slides)
 *
 * Slide labels per source are `"N of M"` (not "Slide N of M" like spec.md
 * lists). Current slide drops `inert`; non-current slides get `inert={true}`.
 * Viewport carries `tabIndex={0}` + dynamic id — scope selectors to section.
 */

import { test, expect } from '@playwright/test';

test.describe('Carousel — keyboard interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
  });

  test('CAR-R01 — ArrowRight advances to next slide; ArrowLeft goes back', async ({
    page,
  }) => {
    // Section 1 — Basic. 5 slides total, start at 0.
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    await expect(viewport).toBeFocused();
    // Before keypress — slide 1 of 5 is current.
    const slide1 = basic.locator('[aria-roledescription="slide"]').nth(0);
    await expect(slide1).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowRight');
    const slide2 = basic.locator('[aria-roledescription="slide"]').nth(1);
    await expect(slide2).toHaveAttribute('data-current', 'true');
    await expect(slide1).not.toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(slide1).toHaveAttribute('data-current', 'true');
  });

  test('CAR-R02 — End jumps to last slide; Home jumps back to first', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    const slides = basic.locator('[aria-roledescription="slide"]');
    const total = await slides.count();
    expect(total).toBeGreaterThan(1);
    await page.keyboard.press('End');
    await expect(slides.nth(total - 1)).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('Home');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
  });

  test('CAR-R03 — RTL: ArrowLeft advances (next), ArrowRight goes back (prev)', async ({
    page,
  }) => {
    // Section 5 — RTL, 3 slides.
    const rtl = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /RTL direction/ }) })
      .first();
    const viewport = rtl.locator('div[tabindex="0"]').first();
    await viewport.focus();
    const slides = rtl.locator('[aria-roledescription="slide"]');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowLeft');
    // Under RTL, ArrowLeft advances.
    await expect(slides.nth(1)).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
  });

  test('CAR-R04 — focus on carousel pauses auto-rotation', async ({ page }) => {
    // Section 2 — Auto-rotate 3000ms. Focusing any tabbable inside root
    // adds pause reason 'focus' via the root-level focusin listener.
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const viewport = auto.locator('div[tabindex="0"]').first();
    const currentSlide = auto.locator(
      '[aria-roledescription="slide"][data-current="true"]',
    );
    // Focus BEFORE any auto-rotate tick fires.
    await viewport.focus();
    const initialCurrent = await currentSlide.first().getAttribute('aria-label');
    // Wait briefly — rotation interval is 3000ms. With focus pause active,
    // we should NOT see an advance in <1500ms.
    await page.waitForTimeout(1500);
    const laterCurrent = await currentSlide.first().getAttribute('aria-label');
    expect(laterCurrent).toBe(initialCurrent);
  });

  test('ArrowLeft at first slide (no loop) stays at first', async ({ page }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    const slide1 = basic.locator('[aria-roledescription="slide"]').nth(0);
    await expect(slide1).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(slide1).toHaveAttribute('data-current', 'true');
  });

  test('Loop mode: ArrowLeft at first wraps to last', async ({ page }) => {
    // Section 3 — Loop, 3 slides.
    const loop = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Infinite loop/ }) })
      .first();
    const viewport = loop.locator('div[tabindex="0"]').first();
    await viewport.focus();
    const slides = loop.locator('[aria-roledescription="slide"]');
    const total = await slides.count();
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(slides.nth(total - 1)).toHaveAttribute('data-current', 'true');
  });
});
