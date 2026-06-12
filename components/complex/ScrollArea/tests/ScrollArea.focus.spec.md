# ScrollArea — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`ScrollArea.focus.spec.ts` (CI-gated; status in ScrollArea.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('SA-R04 — thumb drag scrolls viewport proportionally', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const thumb = page.locator('[data-scroll-area-thumb]').first();
  const box = await thumb.boundingBox();
  if (!box) throw new Error('No thumb');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 100);
  await page.mouse.up();
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  const scroll = await viewport.evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(0);
});

test('SA-R05 — focus visible on viewport (not thumb)', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  await viewport.focus();
  await expect(viewport).toBeFocused();
  // Thumb is not focusable (not in Tab order)
  const thumb = page.locator('[data-scroll-area-thumb]').first();
  expect(await thumb.getAttribute('tabindex')).toBeNull();
});
```
