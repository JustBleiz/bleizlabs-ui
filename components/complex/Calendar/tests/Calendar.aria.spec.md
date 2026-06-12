# Calendar — ARIA semantics spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Calendar.aria.spec.ts` (CI-gated; status in Calendar.tsx `@tested`; only the manual
NVDA sweep stays deferred). This file is a consumer-CI reference snapshot, not the
source of truth.

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
  await page.goto('/components/calendar');
  // Marker is hydration-safe (CAL-R25): applied AFTER hydration — use an
  // auto-retrying assertion, never a one-shot getAttribute snapshot.
  const todayButtons = page.locator('button[aria-current="date"]');
  await expect(todayButtons.first()).toBeVisible();
});

test('CAL-R14 — aria-disabled="true" on disabled dates (not native disabled)', async ({ page }) => {
  await page.goto('/components/calendar?min=2026-04-10&date=2026-04-05');
  const outOfRange = page.getByRole('button', { name: /^5 April/ });
  expect(await outOfRange.getAttribute('aria-disabled')).toBe('true');
  expect(await outOfRange.getAttribute('disabled')).toBeNull();
});
```
