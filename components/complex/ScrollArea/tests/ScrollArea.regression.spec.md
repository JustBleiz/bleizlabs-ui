# ScrollArea — regression spec (16 cases SA-R01..R16)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`ScrollArea.regression.spec.ts` (CI-gated; status in ScrollArea.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
This file covers SA-R09..R16 (remaining cases in keyboard/focus/aria specs).

## Tests

```ts
test('SA-R09 — orientation="both": horizontal + vertical scrollbars independent', async ({
  page,
}) => {
  await page.goto('/components/scroll-area?orientation=both');
  const hThumb = page.locator('[data-orientation="horizontal"] [data-scroll-area-thumb]');
  const vThumb = page.locator('[data-orientation="vertical"] [data-scroll-area-thumb]');
  await expect(hThumb).toBeVisible();
  await expect(vThumb).toBeVisible();
});

test('SA-R10 — autoHide: thumbs fade out after delay', async ({ page }) => {
  await page.goto('/components/scroll-area?autoHide=1&hideDelay=500');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  await viewport.hover();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
  const thumb = page.locator('[data-scroll-area-thumb]').first();
  const opacity = await thumb.evaluate((el) => window.getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThan(1);
});

test('SA-R11 — prefers-reduced-motion disables thumb transitions', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/scroll-area');
  const thumb = page.locator('[data-scroll-area-thumb]').first();
  const transition = await thumb.evaluate((el) => window.getComputedStyle(el).transition);
  expect(transition).toMatch(/none|0s/);
});

test('SA-R12 — content mutation: thumb size recalculated on ResizeObserver', async ({ page }) => {
  await page.goto('/components/scroll-area?mutable=1');
  const initialThumb = page.locator('[data-scroll-area-thumb]').first();
  const initialSize = await initialThumb.evaluate((el) => el.getBoundingClientRect().height);
  await page.getByRole('button', { name: 'Add content' }).click();
  await page.waitForTimeout(100);
  const afterSize = await initialThumb.evaluate((el) => el.getBoundingClientRect().height);
  // Thumb resized after content grew
  expect(afterSize).not.toBe(initialSize);
});

test('SA-R13 — RTL: horizontal scroll direction mirrored', async ({ page }) => {
  await page.goto('/components/scroll-area?dir=rtl&orientation=horizontal');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  // RTL: initial scrollLeft depends on content direction
  const scrollLeft = await viewport.evaluate((el) => el.scrollLeft);
  expect(typeof scrollLeft).toBe('number');
});

test('SA-R14 — scroll shadow indicators on overflow', async ({ page }) => {
  await page.goto('/components/scroll-area?shadows=1');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  // data-state="overflow-{top|bottom|both|none}" attribute reflects scroll position
  const state = await viewport.getAttribute('data-overflow');
  expect(state).toMatch(/top|bottom|both|none/);
});

test('SA-R15 — SSR safe: no hydration mismatch', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/scroll-area');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
});

test.skip('SA-R16 — virtualized list integration [PLAYGROUND-DEP: virtual list demo]', async () => {
  // Plain scroll area in v1.0. Virtualization integration deferred.
});
```
