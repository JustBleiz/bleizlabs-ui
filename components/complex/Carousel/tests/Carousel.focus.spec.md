# Carousel — focus behavior spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('CAR-R05 — Hover pauses auto-rotation (WCAG 1.4.13)', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&interval=1000');
  const carousel = page.getByRole('region');
  await carousel.hover();
  await page.waitForTimeout(2000);
  // Paused while hovered
  await expect(page.locator('[aria-label="Slide 1 of"]').first()).toBeVisible();
});

test('CAR-R06 — visibilitychange hidden pauses auto-rotation', async ({ page }) => {
  await page.goto('/components/carousel?autoRotate=1&interval=500');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(2000);
  // Paused — no rotation while hidden
  await expect(page.locator('[aria-label="Slide 1 of"]').first()).toBeVisible();
});

test('CAR-R07 — Drag via pointer: swipe left = next slide', async ({ page }) => {
  await page.goto('/components/carousel?index=0');
  const viewport = page.locator('[data-carousel-viewport]').first();
  const box = await viewport.boundingBox();
  if (!box) throw new Error('No viewport');
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.up();
  // Swipe left → next slide
  await expect(page.locator('[aria-label="Slide 2 of"]').first()).toBeVisible();
});
```
