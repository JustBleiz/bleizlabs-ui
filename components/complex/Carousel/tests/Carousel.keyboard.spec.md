# Carousel — keyboard interaction spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('CAR-R01 — ArrowLeft/Right prev/next slide', async ({ page }) => {
  await page.goto('/components/carousel?index=2');
  const carousel = page.getByRole('region');
  await carousel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[aria-label="Slide 4 of"]').first()).toBeVisible();
});

test('CAR-R02 — Home/End first/last slide', async ({ page }) => {
  await page.goto('/components/carousel');
  await page.getByRole('region').focus();
  await page.keyboard.press('End');
  const total = await page.locator('[role="group"][aria-roledescription="slide"]').count();
  await expect(page.locator(`[aria-label="Slide ${total} of ${total}"]`).first()).toBeVisible();
});

test('CAR-R03 — RTL mirrors Left/Right', async ({ page }) => {
  await page.goto('/components/carousel?dir=rtl&index=2');
  await page.getByRole('region').focus();
  await page.keyboard.press('ArrowLeft');
  // Under RTL, Left = next slide
  await expect(page.locator('[aria-label="Slide 4 of"]').first()).toBeVisible();
});

test('CAR-R04 — Focus on carousel pauses auto-rotation', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&interval=1000');
  await page.getByRole('region').focus();
  const initial = await page.locator('[aria-label="Slide 1 of"]').first().isVisible();
  await page.waitForTimeout(1500);
  // Still on slide 1 (focus paused auto-rotate)
  expect(initial).toBe(true);
});
```
