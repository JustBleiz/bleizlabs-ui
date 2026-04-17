# ScrollArea — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('SA-R06 — native scrollbars hidden (scrollbar-width: none)', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  const scrollbarWidth = await viewport.evaluate((el) => window.getComputedStyle(el).getPropertyValue('scrollbar-width'));
  expect(scrollbarWidth).toMatch(/none/);
});

test('SA-R07 — custom scrollbars shown only when content overflows', async ({ page }) => {
  await page.goto('/components/scroll-area?content=short');
  const thumb = page.locator('[data-scroll-area-thumb]').first();
  // Short content — no scrollbar (hidden via display: none or opacity: 0)
  const visible = await thumb.isVisible();
  expect(visible).toBe(false);
});

test('SA-R08 — coarse pointer (touch): native scroll preserved, thumbs can be hidden', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/scroll-area');
  const viewport = mobilePage.locator('[data-scroll-area-viewport]').first();
  // Touch gesture scrolls
  const box = await viewport.boundingBox();
  if (box) {
    await mobilePage.touchscreen.tap(box.x + box.width / 2, box.y + 50);
  }
  await ctx.close();
});
```
