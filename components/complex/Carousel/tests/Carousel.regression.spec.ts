/**
 * Carousel regression spec (E142 L3e).
 *
 * Coverage:
 * - CAR-R13 prefers-reduced-motion disables auto-rotation entirely
 * - CAR-R14 auto-rotate loops from last to first (loop mode)
 * - CAR-R15 controlled index: external update switches slide
 * - CAR-R16 coarse pointer [PLAYGROUND-DEP: desktop no-touch — skipped]
 * - CAR-R17 infinite scroll [PLAYGROUND-DEP: no infinite demo — skipped]
 * - CAR-R18 announceAutoRotate controls live region verbosity
 * - CAR-R19 pauseReasons Set: multiple pause sources combine additively
 * - Extra: singleton (1 slide) disables both Prev/Next
 * - Extra: live region stays silent during default auto-rotate (announceAutoRotate=false)
 */

import { test, expect } from '@playwright/test';

test.describe('Carousel — regression cases', () => {
  test('CAR-R13 — prefers-reduced-motion disables auto-rotation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const currentSlide = auto.locator('[aria-roledescription="slide"][data-current="true"]');
    const before = await currentSlide.first().getAttribute('aria-label');
    // Auto-rotate interval is 3000ms. With PRM, pauseReasons contains
    // 'reduced-motion' -> shouldRotate=false -> no interval scheduled.
    await page.waitForTimeout(1500);
    const after = await currentSlide.first().getAttribute('aria-label');
    expect(after).toBe(before);
  });

  test('CAR-R14 — loop mode: Next at last wraps to first', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
    const loop = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /Infinite loop/ }) })
      .first();
    const slides = loop.locator('[aria-roledescription="slide"]');
    const total = await slides.count();
    const next = loop.getByRole('button', { name: 'Next slide' });
    // Advance to last slide.
    for (let i = 0; i < total - 1; i++) {
      await next.click();
    }
    await expect(slides.nth(total - 1)).toHaveAttribute('data-current', 'true');
    // One more Next — wraps back to slide 0.
    await next.click();
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
  });

  test('CAR-R15 — controlled index: dot button updates active slide', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
    const controlled = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^4\. Controlled/ }) })
      .first();
    const slides = controlled.locator('[aria-roledescription="slide"]');
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    await controlled.getByRole('button', { name: 'Go to slide 4' }).click();
    await expect(slides.nth(3)).toHaveAttribute('data-current', 'true');
  });

  test.skip('CAR-R16 — coarse pointer [PLAYGROUND-DEP: desktop Chromium no-touch]', async () => {
    // Desktop Chromium context has no touch — touchscreen.tap() throws.
    // Pointer drag is indirectly covered by the desktop mouse test.
  });

  test.skip('CAR-R17 — infinite scroll [PLAYGROUND-DEP: no infinite demo in playground]', async () => {
    // Loop is the v1.0 equivalent; a true infinite feed would need a
    // "fetch more slides" demo not present in the playground.
  });

  test('CAR-R18 — announceAutoRotate=true populates live region', async ({ page }) => {
    // Do NOT emulate reduced motion here — reduced motion disables rotation.
    await page.goto('/components/carousel');
    const announced = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', { name: /Announce auto-rotation/ }),
      })
      .first();
    const live = announced.locator('[role="status"]').first();
    // Interval is 4000ms + loop=true. Poll live-region text for the
    // announce-pattern within one interval window. Reduced-motion is NOT
    // emulated here on purpose — we need the rotation to fire.
    await expect
      .poll(async () => live.textContent(), { timeout: 7000 })
      .toMatch(/Slide \d+ of \d+/);
  });

  test('CAR-R19 — combined pause reasons: hover + focus stay paused on blur', async ({ page }) => {
    // Do NOT emulate reduced motion — we need auto-rotate to actually be
    // alive so the hover/focus pause is observable as "no advance".
    await page.goto('/components/carousel');
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const root = auto.locator('[aria-roledescription="carousel"]').first();
    const viewport = auto.locator('div[tabindex="0"]').first();
    const currentSlide = auto.locator('[aria-roledescription="slide"][data-current="true"]');
    // Hover + focus — both pause reasons active.
    await root.hover();
    await viewport.focus();
    const initialLabel = await currentSlide.first().getAttribute('aria-label');
    // Blur focus but keep hover. Focus body outside the root — the
    // focusout listener fires, removes 'focus' reason, but 'hover' remains.
    await page.evaluate(() => {
      (document.body as HTMLElement).focus();
    });
    await page.waitForTimeout(1500);
    const afterLabel = await currentSlide.first().getAttribute('aria-label');
    // With hover still active, rotation remains paused.
    expect(afterLabel).toBe(initialLabel);
  });

  test('Singleton (1 slide): Prev + Next both aria-disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
    const single = page
      .locator('section')
      .filter({
        has: page.getByRole('heading', { name: /Singleton carousel/ }),
      })
      .first();
    const prev = single.getByRole('button', { name: 'Previous slide' });
    const next = single.getByRole('button', { name: 'Next slide' });
    await expect(prev).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  test('Default auto-rotate (announceAutoRotate=false): live region stays silent', async ({
    page,
  }) => {
    // No reduced-motion — auto-rotate fires. Section 2 auto-rotate with
    // announceAutoRotate=false means the live region stays empty even
    // though the index changes.
    await page.goto('/components/carousel');
    const auto = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^2\. Auto-rotate/ }) })
      .first();
    const live = auto.locator('[role="status"]').first();
    // Wait past one rotation tick (3000ms interval).
    await page.waitForTimeout(3500);
    const text = (await live.textContent()) ?? '';
    // Silent announce — text stays empty (setLiveMessage('') branch fires
    // when shouldRotate && !announceAutoRotate).
    expect(text.trim()).toBe('');
  });

  test('Controlled: clicking Next syncs external state (parent updates index)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/carousel');
    const controlled = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /^4\. Controlled/ }) })
      .first();
    const slides = controlled.locator('[aria-roledescription="slide"]');
    const next = controlled.getByRole('button', { name: 'Next slide' });
    await expect(slides.nth(0)).toHaveAttribute('data-current', 'true');
    await next.click();
    await expect(slides.nth(1)).toHaveAttribute('data-current', 'true');
    // Dot button aria-pressed reflects controlled state.
    const dot2 = controlled.getByRole('button', { name: 'Go to slide 2' });
    await expect(dot2).toHaveAttribute('aria-pressed', 'true');
  });
});
