# Carousel — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('CAR-R08 — root role="region" + aria-roledescription="carousel"', async ({ page }) => {
  await page.goto('/components/carousel');
  const carousel = page.getByRole('region');
  expect(await carousel.getAttribute('aria-roledescription')).toBe('carousel');
});

test('CAR-R09 — slides role="group" + aria-roledescription="slide" + aria-label="N of M"', async ({ page }) => {
  await page.goto('/components/carousel');
  const firstSlide = page.locator('[role="group"][aria-roledescription="slide"]').first();
  expect(await firstSlide.getAttribute('aria-label')).toMatch(/^Slide \d of \d$/);
});

test('CAR-R10 — non-current slides aria-hidden="true"', async ({ page }) => {
  await page.goto('/components/carousel?index=0');
  const slides = page.locator('[role="group"][aria-roledescription="slide"]');
  const count = await slides.count();
  for (let i = 1; i < count; i++) {
    expect(await slides.nth(i).getAttribute('aria-hidden')).toBe('true');
  }
});

test('CAR-R11 — pause button has aria-pressed synced with pause state', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1');
  const pauseBtn = page.getByRole('button', { name: /pause|play/i });
  expect(await pauseBtn.getAttribute('aria-pressed')).toBe('false');
  await pauseBtn.click();
  expect(await pauseBtn.getAttribute('aria-pressed')).toBe('true');
});

test('CAR-R12 — live region role="status" aria-live="polite"', async ({ page }) => {
  await page.goto('/components/carousel');
  const liveRegion = page.locator('[role="status"]');
  expect(await liveRegion.getAttribute('aria-live')).toBe('polite');
});
```
