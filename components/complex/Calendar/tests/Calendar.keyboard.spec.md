# Calendar — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Calendar.keyboard.spec.ts` (CI-gated; status in Calendar.tsx `@tested`; only the
manual NVDA sweep stays deferred). This file is a consumer-CI reference snapshot,
not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/calendar` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/grid/

## Tests

```ts
test('CAL-R01 — ArrowLeft/Right RTL mirrors direction', async ({ page }) => {
  await page.goto('/components/calendar?dir=rtl&date=2026-04-15');
  const grid = page.getByRole('grid');
  await grid.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('ArrowLeft');
  // Under RTL, ArrowLeft = next day (+1)
  await expect(grid.getByRole('button', { name: /16/ })).toBeFocused();
});

test('CAL-R02 — ArrowUp/Down moves by 7 days (same weekday)', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('ArrowDown');
  // +7 days = April 22
  await expect(page.getByRole('button', { name: /22/ })).toBeFocused();
});

test('CAL-R03 — Home/End: first/last day of week per weekStartsOn', async ({ page }) => {
  await page.goto('/components/calendar?weekStartsOn=1&date=2026-04-15'); // Monday start
  await page.getByRole('button', { name: /15/ }).focus(); // Wed Apr 15
  await page.keyboard.press('Home');
  // First day of week (Monday Apr 13)
  await expect(page.getByRole('button', { name: /13/ })).toBeFocused();
  await page.keyboard.press('End');
  // Last day of week (Sunday Apr 19)
  await expect(page.getByRole('button', { name: /19/ })).toBeFocused();
});

test('CAL-R04 — PageUp/PageDown: previous/next month same day-of-month', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('PageDown');
  // May 15, 2026
  await expect(page.locator('[aria-label*="May 2026"]')).toBeVisible();
});

test('CAL-R05 — Shift+PageUp/PageDown: previous/next year', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('Shift+PageDown');
  await expect(page.locator('[aria-label*="April 2027"]')).toBeVisible();
});

test('CAL-R06 — Disabled dates skipped during arrow nav', async ({ page }) => {
  await page.goto('/components/calendar?disableWeekends=1&date=2026-04-17'); // Fri
  await page.getByRole('button', { name: /17/ }).focus();
  await page.keyboard.press('ArrowRight');
  // Skips weekend (18, 19) → lands on Monday 20
  await expect(page.getByRole('button', { name: /20/ })).toBeFocused();
});

test('CAL-R07 — Modifier keys (Alt/Meta/Ctrl+arrow) skipped', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('Meta+ArrowLeft');
  // No change — modifier skipped for browser hotkey
  await expect(page.getByRole('button', { name: /15/ })).toBeFocused();
});
```
