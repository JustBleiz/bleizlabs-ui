/**
 * Carousel ARIA semantics spec — APG `/carousel/` (E142 L3e).
 *
 * Coverage:
 * - CAR-R08 root aria-roledescription="carousel" + aria-label required
 * - CAR-R09 slides have role="group" + aria-roledescription="slide" +
 *   aria-label="N of M" (source uses "N of M", not "Slide N of M")
 * - CAR-R10 non-current slides use `inert` attribute (NOT aria-hidden —
 *   WCAG 4.1.2 forbids aria-hidden on focusable descendants; source was
 *   migrated to `inert` in E142 L2 per docblock L627-630)
 * - CAR-R11 pause button has aria-pressed synced with pause state
 * - CAR-R12 live region role="status" + aria-live="polite"
 * - axe-core zero violations (default + auto-rotate + RTL + loop)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Carousel — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
  });

  test('CAR-R08 — root has aria-roledescription="carousel" + aria-label', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const root = basic.locator('[aria-roledescription="carousel"]').first();
    await expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(root).toHaveAttribute('aria-label', 'Basic gallery');
  });

  test('CAR-R09 — slides have role="group" + aria-roledescription="slide" + aria-label="N of M"', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const firstSlide = basic.locator('[aria-roledescription="slide"]').first();
    await expect(firstSlide).toHaveAttribute('role', 'group');
    // Source format: `${myIndex + 1} of ${total}` e.g., "1 of 5".
    // Use locator-bound assertion (auto-retries) instead of one-shot
    // getAttribute() to avoid race when aria-label is set after first
    // render (slide count derives from registered slides via effect).
    await expect(firstSlide).toHaveAttribute('aria-label', /^\d+ of \d+$/);
  });

  test('CAR-R10 — non-current slides get inert attribute (NOT aria-hidden)', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const slides = basic.locator('[aria-roledescription="slide"]');
    const total = await slides.count();
    // First slide current — no inert attribute.
    const first = slides.nth(0);
    await expect(first).toHaveAttribute('data-current', 'true');
    // Remaining slides are inert.
    for (let i = 1; i < total; i++) {
      const slide = slides.nth(i);
      const hasInert = await slide.evaluate((el) => el.hasAttribute('inert'));
      expect(hasInert).toBe(true);
      // aria-hidden must NOT be set — inert replaces it (per source
      // comment: WCAG 4.1.2 + axe aria-hidden-focus rule).
      const ariaHidden = await slide.getAttribute('aria-hidden');
      expect(ariaHidden).toBeNull();
    }
  });

  test('CAR-R11 — pause button aria-pressed synced with pause state', async ({
    page,
  }) => {
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Auto-rotate/ }) })
      .first();
    const pauseBtn = auto.getByRole('button', { name: 'Pause carousel' });
    await expect(pauseBtn).toHaveAttribute('aria-pressed', 'false');
    await pauseBtn.click();
    const playBtn = auto.getByRole('button', { name: 'Play carousel' });
    await expect(playBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('CAR-R12 — live region has role="status" + aria-live="polite"', async ({
    page,
  }) => {
    // Live region is inside the Carousel root. Scope to first Carousel.
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const live = basic.locator('[role="status"]').first();
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await expect(live).toHaveAttribute('aria-atomic', 'true');
  });

  test('CarouselPrev + CarouselNext have aria-controls linking to viewport', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const prev = basic.getByRole('button', { name: 'Previous slide' });
    const next = basic.getByRole('button', { name: 'Next slide' });
    const prevControls = await prev.getAttribute('aria-controls');
    const nextControls = await next.getAttribute('aria-controls');
    expect(prevControls).toMatch(/^carousel-.*-viewport$/);
    expect(nextControls).toEqual(prevControls);
    // Viewport element exists with that id.
    const viewport = basic.locator(`#${prevControls}`);
    await expect(viewport).toBeVisible();
  });

  test('Prev is aria-disabled at first slide (no loop); Next at last slide', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const prev = basic.getByRole('button', { name: 'Previous slide' });
    const next = basic.getByRole('button', { name: 'Next slide' });
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    // Jump to last via End key.
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    await page.keyboard.press('End');
    await expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  test('Loop mode: Prev + Next never aria-disabled', async ({ page }) => {
    const loop = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Infinite loop/ }) })
      .first();
    const prev = loop.getByRole('button', { name: 'Previous slide' });
    const next = loop.getByRole('button', { name: 'Next slide' });
    // Use locator-bound assertion (auto-retries) so we wait for the loop
    // state to settle (initial render briefly inherits non-loop edge state
    // before the `loop` prop propagates through the controller effect).
    await expect(prev).not.toHaveAttribute('aria-disabled', 'true');
    await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('aria snapshot contains slide group', async ({ page }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const root = basic.locator('[aria-roledescription="carousel"]').first();
    const snapshot = await root.ariaSnapshot();
    // Snapshot includes the group role from slides.
    expect(snapshot.toLowerCase()).toContain('group');
  });

  test('axe-core zero violations — default playground', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after navigating to second slide', async ({
    page,
  }) => {
    const basic = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Basic/ }) })
      .first();
    const next = basic.getByRole('button', { name: 'Next slide' });
    await next.click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
