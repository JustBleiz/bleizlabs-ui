# Slider — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/slider` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/slider/

## Tests

```ts
test('SL-R05 — track click jumps to position AND focuses thumb', async ({ page }) => {
  await page.goto('/components/slider?value=0');
  const track = page.locator('[data-slider-track]').first();
  const box = await track.boundingBox();
  if (!box) throw new Error('No track bounds');
  // Click at 75% along track
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
  const thumb = page.getByRole('slider');
  await expect(thumb).toBeFocused();
  expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
});

test('SL-R10 — pointer capture cleanup on unmount mid-drag (no leak)', async ({ page }) => {
  await page.goto('/components/slider?unmountable=1');
  const thumb = page.getByRole('slider');
  const box = await thumb.boundingBox();
  if (!box) throw new Error('No thumb bounds');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y);
  // Unmount while dragging
  await page.getByRole('button', { name: 'Unmount' }).click();
  // No console errors, no pointer-events leak on body
  const warnings: string[] = [];
  page.on('pageerror', (err) => warnings.push(err.message));
  await page.waitForTimeout(100);
  expect(warnings).toHaveLength(0);
});

test('SL-R22 — disabled uses aria-disabled (Tab order intact)', async ({ page }) => {
  await page.goto('/components/slider?disabled=1');
  const thumb = page.getByRole('slider');
  expect(await thumb.getAttribute('aria-disabled')).toBe('true');
  // Focusable even when disabled (SR discoverability)
  await thumb.focus();
  await expect(thumb).toBeFocused();
});
```
