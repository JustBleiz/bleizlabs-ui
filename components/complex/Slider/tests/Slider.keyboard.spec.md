# Slider — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Slider.keyboard.spec.ts` (CI-gated; status in Slider.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/slider` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/slider/

## Tests

```ts
test('SL-R01 — RTL inverts Arrow Left/Right semantics (Left = increase)', async ({ page }) => {
  await page.goto('/components/slider?dir=rtl&value=50');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowLeft');
  // Under RTL, ArrowLeft increases value
  expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
});

test('SL-R04 — keyboard arrow past min/max clamps (no NaN)', async ({ page }) => {
  await page.goto('/components/slider?value=100&min=0&max=100');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  // Clamped at max=100, no NaN
  expect(await thumb.getAttribute('aria-valuenow')).toBe('100');
});

test('SL-R07 — Arrow key fires onValueChange exactly once (dedup via equality)', async ({
  page,
}) => {
  await page.goto('/components/slider?trackChanges=1&value=50');
  const calls = await page.evaluateHandle(() => {
    (window as any).__calls = [];
    return (window as any).__calls;
  });
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  const result = await calls.jsonValue();
  expect(result.length).toBe(1); // no double-fire
});

test('SL-R08 — Home/End no-op when min==max', async ({ page }) => {
  await page.goto('/components/slider?value=5&min=5&max=5');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('End');
  // No NaN, no change
  expect(await thumb.getAttribute('aria-valuenow')).toBe('5');
});

test('SL-R11 — Shift+Arrow uses largeStep increment', async ({ page }) => {
  await page.goto('/components/slider?value=50&largeStep=10');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('Shift+ArrowRight');
  expect(await thumb.getAttribute('aria-valuenow')).toBe('60');
});

test('SL-R12 — PageUp/PageDown use largeStep', async ({ page }) => {
  await page.goto('/components/slider?value=50&largeStep=10');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('PageUp');
  expect(await thumb.getAttribute('aria-valuenow')).toBe('60');
  await page.keyboard.press('PageDown');
  expect(await thumb.getAttribute('aria-valuenow')).toBe('50');
});

test('SL-R13 — Vertical orientation: ArrowUp always increases', async ({ page }) => {
  await page.goto('/components/slider?orientation=vertical&value=50');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowUp');
  expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
});
```
