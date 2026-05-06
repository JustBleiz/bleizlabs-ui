# Calendar — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Tests

```ts
test('CAL-R08 — roving tabindex: only focused cell has tabindex=0', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  const focused = page.getByRole('button', { name: /^15/ });
  expect(await focused.getAttribute('tabindex')).toBe('0');
  const other = page.getByRole('button', { name: /^20/ });
  expect(await other.getAttribute('tabindex')).toBe('-1');
});

test('CAL-R09 — Tab moves focus OUT of grid (single tabstop)', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('Tab');
  // Focus leaves calendar (to next focusable outside grid)
  const active = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  expect(active).not.toBe('gridcell');
});

test('CAL-R10 — disabled cells remain focusable (APG requirement)', async ({ page }) => {
  await page.goto('/components/calendar?disableWeekends=1&date=2026-04-18'); // Sat
  const disabled = page.getByRole('button', { name: /18/ });
  expect(await disabled.getAttribute('aria-disabled')).toBe('true');
  // Focusable even when disabled
  await disabled.focus();
  await expect(disabled).toBeFocused();
});
```
