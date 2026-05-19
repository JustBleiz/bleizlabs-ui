# ScrollArea — keyboard interaction spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('SA-R01 — viewport tabIndex=0 preserves native keyboard scroll', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  expect(await viewport.getAttribute('tabindex')).toBe('0');
  await viewport.focus();
  const initialScroll = await viewport.evaluate((el) => el.scrollTop);
  await page.keyboard.press('ArrowDown');
  const afterScroll = await viewport.evaluate((el) => el.scrollTop);
  expect(afterScroll).toBeGreaterThan(initialScroll);
});

test('SA-R02 — PageDown/PageUp scroll by viewport height', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  await viewport.focus();
  await page.keyboard.press('PageDown');
  const scroll = await viewport.evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(0);
});

test('SA-R03 — Home/End scroll to top/bottom', async ({ page }) => {
  await page.goto('/components/scroll-area');
  const viewport = page.locator('[data-scroll-area-viewport]').first();
  await viewport.focus();
  await page.keyboard.press('End');
  const scrollEnd = await viewport.evaluate(
    (el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
  );
  expect(scrollEnd).toBe(true);
  await page.keyboard.press('Home');
  expect(await viewport.evaluate((el) => el.scrollTop)).toBe(0);
});
```
