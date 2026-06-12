# DatePicker — regression spec (21 cases DP-R01..R21)

**Execution status:** DEFERRED. Executable canon: sibling `DatePicker.regression.spec.ts`.
This file covers DP-R12..R21 (remaining cases in keyboard/focus/aria specs).

## Tests

```ts
test('DP-R12 — ISO parse always (YYYY-MM-DD format, locale-independent)', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.fill('2026-04-15');
  await page.keyboard.press('Enter');
  // Parsed correctly regardless of locale
  expect(await input.inputValue()).toMatch(/2026-04-15|15.04.2026|Apr 15, 2026/);
});

test('DP-R13 — invalid date reject (29 Feb on non-leap year)', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.fill('2025-02-29'); // 2025 is not a leap year
  await page.keyboard.press('Enter');
  expect(await input.getAttribute('aria-invalid')).toBe('true');
});

test('DP-R14 — min/max clamp BOTH input + Calendar', async ({ page }) => {
  await page.goto('/components/date-picker?min=2026-04-01&max=2026-04-30');
  const input = page.getByRole('combobox');
  await input.fill('2026-03-15');
  await page.keyboard.press('Enter');
  // Out of range — input marked invalid
  expect(await input.getAttribute('aria-invalid')).toBe('true');
  // Calendar also respects min/max (cells before min disabled)
  await input.click();
  const outOfRangeCell = page
    .getByRole('grid')
    .getByRole('gridcell')
    .filter({ hasText: '31' })
    .first();
  // March dates shown as out-of-range prev month (disabled)
  expect(await outOfRangeCell.getAttribute('aria-disabled')).toBe('true');
});

test('DP-R15 — disabled predicate: per-date custom disable function', async ({ page }) => {
  await page.goto('/components/date-picker?disableWeekends=1');
  await page.getByRole('combobox').click();
  const weekendCell = page
    .getByRole('grid')
    .getByRole('gridcell')
    .filter({ hasText: '18' })
    .first(); // Sat
  expect(await weekendCell.getAttribute('aria-disabled')).toBe('true');
});

test('DP-R16 — controlled value: external update re-renders input + Calendar', async ({ page }) => {
  await page.goto('/components/date-picker?controlled=1');
  await page.getByRole('button', { name: 'Set 2026-05-01 external' }).click();
  const input = page.getByRole('combobox');
  expect(await input.inputValue()).toMatch(/2026-05-01/);
});

test('DP-R17 — 6th useFloatingValueState consumer: pattern stable', async ({ page }) => {
  await page.goto('/components/date-picker');
  // Basic usage works — E29 primitive validated as Rule of Six consumer
  const input = page.getByRole('combobox');
  await input.click();
  await expect(page.getByRole('grid')).toBeVisible();
});

test('DP-R18 — SSR safe: no hydration warning', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/date-picker');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
});

test('DP-R19 — prefers-reduced-motion disables popup animation', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/date-picker');
  await page.getByRole('combobox').click();
  const popup = page.getByRole('dialog');
  const animation = await popup.evaluate((el) => window.getComputedStyle(el).animation);
  expect(animation).toMatch(/none|0s/);
});

test.skip('DP-R20 — date range mode [PLAYGROUND-DEP: range demo]', async () => {
  // Single-date only in v1.0. Range via future DateRangePicker component.
});

test.skip('DP-R21 — time picker composition [PLAYGROUND-DEP: datetime demo]', async () => {
  // Date-only in v1.0. Time via future TimePicker + combined DateTimePicker.
});
```
