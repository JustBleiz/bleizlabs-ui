/**
 * Carousel focus behavior spec (E142 L3e).
 *
 * Coverage:
 * - CAR-R05 Hover pauses auto-rotation (WCAG 1.4.13)
 * - CAR-R06 visibilitychange hidden pauses auto-rotation
 * - CAR-R07 Drag via pointer: swipe left = next slide
 *
 * Playground: /components/carousel
 *   Section 1: Basic (5 slides, drag enabled)
 *   Section 2: Auto-rotate 3000ms
 *   Section 7: drag disabled (verify drag is off)
 *
 * Root element carries `aria-roledescription="carousel"` and data-paused
 * reflects the manual (button-pressed) pause state only. Focus / hover /
 * visibility pauses live in pauseReasons Set (internal) — observed
 * indirectly by whether the active slide advances within the interval.
 */

import { test, expect } from '@playwright/test';

test.describe('Carousel — focus + pointer behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
  });

  test('CAR-R05 — hover pauses auto-rotation (WCAG 1.4.13)', async ({ page }) => {
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const root = auto.locator('[aria-roledescription="carousel"]').first();
    const currentSlide = auto.locator('[aria-roledescription="slide"][data-current="true"]');
    const initialLabel = await currentSlide.first().getAttribute('aria-label');
    await root.hover();
    // Wait past half the auto-rotate interval (3000ms) — rotation should
    // not advance while hovered.
    await page.waitForTimeout(1500);
    const afterLabel = await currentSlide.first().getAttribute('aria-label');
    expect(afterLabel).toBe(initialLabel);
  });

  test('CAR-R06 — visibilitychange hidden pauses auto-rotation', async ({ page }) => {
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const currentSlide = auto.locator('[aria-roledescription="slide"][data-current="true"]');
    const initialLabel = await currentSlide.first().getAttribute('aria-label');
    // Simulate tab hidden — addPauseReason('visibility') fires.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(1500);
    const afterLabel = await currentSlide.first().getAttribute('aria-label');
    expect(afterLabel).toBe(initialLabel);
    // Restore visibility — pause reason cleared.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });

  test('CAR-R07 — pointer drag swipes to next slide', async ({ page }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const viewport = basic.locator('div[tabindex="0"]').first();
    const slides = basic.locator('[aria-roledescription="slide"]');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('No viewport box');
    // Swipe left by 60% of viewport width — exceeds default 20% threshold.
    const startX = box.x + box.width * 0.8;
    const endX = box.x + box.width * 0.2;
    const midY = box.y + box.height / 2;
    await page.mouse.move(startX, midY);
    await page.mouse.down();
    await page.mouse.move(endX, midY, { steps: 10 });
    await page.mouse.up();
    await expect(slides.nth(1)).toHaveAttribute('data-current', 'true');
  });

  test('Drag disabled section: drag does NOT change slide', async ({ page }) => {
    // Section 7 — dragEnabled={false}.
    const noDrag = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Drag disabled/ }) })
      .first();
    const viewport = noDrag.locator('div[tabindex="0"]').first();
    const slides = noDrag.locator('[aria-roledescription="slide"]');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    const box = await viewport.boundingBox();
    if (!box) throw new Error('No viewport box');
    const startX = box.x + box.width * 0.8;
    const endX = box.x + box.width * 0.2;
    const midY = box.y + box.height / 2;
    await page.mouse.move(startX, midY);
    await page.mouse.down();
    await page.mouse.move(endX, midY, { steps: 10 });
    await page.mouse.up();
    // Still on slide 0 — drag handlers are disabled.
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
  });

  test('Pause button toggles aria-pressed + manual pause', async ({ page }) => {
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Auto-rotate/ }) })
      .first();
    const pauseBtn = auto.getByRole('button', { name: 'Pause carousel' });
    await expect(pauseBtn).toBeVisible();
    await expect(pauseBtn).toHaveAttribute('aria-pressed', 'false');
    await pauseBtn.click();
    // After click, label flips to 'Play carousel' + aria-pressed=true.
    const playBtn = auto.getByRole('button', { name: 'Play carousel' });
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveAttribute('aria-pressed', 'true');
    // Click again to resume.
    await playBtn.click();
    await expect(auto.getByRole('button', { name: 'Pause carousel' })).toBeVisible();
  });
});
