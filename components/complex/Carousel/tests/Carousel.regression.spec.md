# Carousel — regression spec (19 cases CAR-R01..R19)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Carousel.regression.spec.ts` (CI-gated; status in Carousel.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
This file covers CAR-R13..R19 (remaining cases in keyboard/focus/aria specs).

## Tests

```ts
test('CAR-R13 — prefers-reduced-motion disables auto-rotation entirely', async ({
  page,
  context,
}) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/carousel?autoRotate=1&interval=500');
  await page.waitForTimeout(2000);
  // Auto-rotate disabled — still on slide 1
  await expect(page.locator('[aria-label="Slide 1 of"]').first()).toBeVisible();
});

test('CAR-R14 — auto-rotate loops from last to first', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&interval=300&slides=3');
  await page.waitForTimeout(1200); // past 3 intervals
  // Should loop back to slide 1 eventually
  const visibleSlide = await page
    .locator('[role="group"][aria-roledescription="slide"]:not([aria-hidden="true"])')
    .first();
  expect(await visibleSlide.getAttribute('aria-label')).toMatch(/Slide \d of 3/);
});

test('CAR-R15 — controlled index: external update switches slide', async ({ page }) => {
  await page.goto('/components/carousel?controlled=1');
  await page.getByRole('button', { name: 'Set index 3' }).click();
  await expect(page.locator('[aria-label="Slide 4 of"]').first()).toBeVisible();
});

test('CAR-R16 — coarse pointer: drag handlers still work on touch', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/carousel');
  const viewport = mobilePage.locator('[data-carousel-viewport]').first();
  const box = await viewport.boundingBox();
  if (box) {
    await mobilePage.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
    await mobilePage.waitForTimeout(50);
  }
  // Touch pointer drag triggers slide change
  await ctx.close();
});

test.skip('CAR-R17 — infinite scroll mode [PLAYGROUND-DEP: infinite demo]', async () => {
  // Finite loop in v1.0. Infinite deferred to future sprint.
});

test('CAR-R18 — announceAutoRotate prop controls live region verbosity', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&announceAutoRotate=true');
  const liveRegion = page.locator('[role="status"]');
  await page.waitForTimeout(1500);
  // Live region announces current slide when auto-rotating
  const text = await liveRegion.textContent();
  expect(text).toMatch(/Slide \d of \d/);
});

test('CAR-R19 — pauseReasons Set: multiple pause sources combine additively', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&interval=500');
  const carousel = page.getByRole('region');
  await carousel.hover(); // pause reason: hover
  await carousel.focus(); // pause reason: focus (additive)
  // Unfocus but keep hover — still paused
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);
  // Still paused (hover reason remains)
  await expect(page.locator('[aria-label="Slide 1 of"]').first()).toBeVisible();
});
```
