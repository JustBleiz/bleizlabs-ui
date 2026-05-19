# Calendar — regression spec (24 cases CAL-R01..R24)

**Execution status:** DEFERRED. 24 regression cases in `docs/specs/calendar-spec.md`.
This file covers CAL-R15..R24.

## Tests

```ts
test('CAL-R15 — DST boundary: spring-forward navigation seamless', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-03-08&tz=America/New_York'); // DST day
  const todayBtn = page.getByRole('button', { name: /8/ });
  await todayBtn.focus();
  await page.keyboard.press('ArrowRight');
  // Next day = 2026-03-09 (DST does not skip a day)
  await expect(page.getByRole('button', { name: /9/ })).toBeFocused();
});

test('CAL-R16 — year boundary: December → January rollover', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-12-31');
  await page.getByRole('button', { name: /31/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[aria-label*="January 2027"]')).toBeVisible();
});

test('CAL-R17 — leap year Feb 29 handling', async ({ page }) => {
  await page.goto('/components/calendar?date=2024-02-28'); // 2024 is leap
  await page.getByRole('button', { name: /28/ }).focus();
  await page.keyboard.press('ArrowRight');
  // Feb 29 exists in 2024 leap year
  await expect(page.getByRole('button', { name: /29/ })).toBeFocused();
});

test('CAL-R18 — locale week-start (Monday vs Sunday)', async ({ page }) => {
  await page.goto('/components/calendar?weekStartsOn=1&month=2026-04');
  const firstDayHeader = page.locator('thead th').first();
  // Monday first
  await expect(firstDayHeader).toHaveText(/mon|Mo|pon/i);
});

test('CAL-R19 — controlled value: external update re-renders selection', async ({ page }) => {
  await page.goto('/components/calendar?controlled=1');
  await page.getByRole('button', { name: 'Set 2026-05-01 external' }).click();
  const selected = page.getByRole('gridcell', { name: /1/, selected: true });
  await expect(selected).toBeVisible();
});

test('CAL-R20 — month chevron click updates focused date', async ({ page }) => {
  await page.goto('/components/calendar?date=2026-04-15');
  await page.getByRole('button', { name: /next month/i }).click();
  await expect(page.locator('[aria-label*="May 2026"]')).toBeVisible();
});

test('CAL-R21 — prefers-reduced-motion disables month transitions', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/calendar');
  const grid = page.getByRole('grid');
  const transition = await grid.evaluate((el) => window.getComputedStyle(el).transition);
  expect(transition).toMatch(/none|0s/);
});

test('CAL-R22 — min/max date: prev chevron disabled at min boundary', async ({ page }) => {
  await page.goto('/components/calendar?min=2026-04-01&date=2026-04-15');
  await page.getByRole('button', { name: /previous month/i }).click();
  // At min, prev chevron becomes aria-disabled
  const prevBtn = page.getByRole('button', { name: /previous month/i });
  expect(await prevBtn.getAttribute('aria-disabled')).toBe('true');
});

test('CAL-R23 — SSR safe: Date formatting uses Intl (consistent server/client)', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/calendar');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
});

test.skip('CAL-R24 — date range selection [PLAYGROUND-DEP: range demo]', async () => {
  // Single-date only in v1.0. Range selection deferred to future sprint.
});
```
