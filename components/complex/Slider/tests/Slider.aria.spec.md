# Slider — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/slider` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/slider/

## Tests

```ts
test('SL-R17 — role="slider" + aria-valuenow/valuemin/valuemax on thumb', async ({ page }) => {
  await page.goto('/components/slider?value=40&min=0&max=100');
  const thumb = page.getByRole('slider');
  expect(await thumb.getAttribute('aria-valuenow')).toBe('40');
  expect(await thumb.getAttribute('aria-valuemin')).toBe('0');
  expect(await thumb.getAttribute('aria-valuemax')).toBe('100');
});

test('SL-R18 — aria-orientation matches prop', async ({ page }) => {
  await page.goto('/components/slider?orientation=vertical');
  const thumb = page.getByRole('slider');
  expect(await thumb.getAttribute('aria-orientation')).toBe('vertical');
});

test('SL-R19 — aria-valuetext optional custom formatting', async ({ page }) => {
  await page.goto('/components/slider?value=50&valuetext=$50');
  const thumb = page.getByRole('slider');
  expect(await thumb.getAttribute('aria-valuetext')).toBe('$50');
});

test('SL-R20 — aria-labelledby when label prop provided', async ({ page }) => {
  await page.goto('/components/slider?label=Volume');
  const thumb = page.getByRole('slider');
  const labelledBy = await thumb.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();
});
```
