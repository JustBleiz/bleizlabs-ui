# Calendar — ARIA semantics spec

**Execution status:** DEFERRED.

## Tests

```ts
test('CAL-R11 — root role="grid" + aria-labelledby to month/year header', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  const grid = page.getByRole('grid');
  const labelledBy = await grid.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();
});

test('CAL-R12 — cells have role="gridcell" with aria-selected', async ({ page }) => {
  await page.goto('/components/calendar?selected=2026-04-15');
  const selectedCell = page.getByRole('gridcell', { name: /15/ });
  expect(await selectedCell.getAttribute('aria-selected')).toBe('true');
});

test('CAL-R13 — today cell has aria-current="date"', async ({ page }) => {
  await page.goto('/components/calendar'); // today = 2026-04-17 per currentDate
  const todayBtn = page.getByRole('button', { name: /17/ });
  expect(await todayBtn.getAttribute('aria-current')).toBe('date');
});

test('CAL-R14 — aria-disabled="true" on disabled dates (not native disabled)', async ({ page }) => {
  await page.goto('/components/calendar?min=2026-04-10&date=2026-04-05');
  const outOfRange = page.getByRole('button', { name: /^5 April/ });
  expect(await outOfRange.getAttribute('aria-disabled')).toBe('true');
  expect(await outOfRange.getAttribute('disabled')).toBeNull();
});
```
