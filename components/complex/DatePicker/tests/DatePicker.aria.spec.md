# DatePicker — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('DP-R08 — input role="combobox" + aria-haspopup="dialog" + aria-expanded', async ({
  page,
}) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  expect(await input.getAttribute('aria-haspopup')).toBe('dialog');
  expect(await input.getAttribute('aria-expanded')).toBe('false');
  await input.click();
  expect(await input.getAttribute('aria-expanded')).toBe('true');
});

test('DP-R09 — popup role="dialog" + aria-modal="false" (non-modal default)', async ({ page }) => {
  await page.goto('/components/date-picker');
  await page.getByRole('combobox').click();
  const popup = page.getByRole('dialog');
  expect(await popup.getAttribute('aria-modal')).toBe('false');
});

test('DP-R10 — embedded Calendar preserves APG /grid/ semantics', async ({ page }) => {
  await page.goto('/components/date-picker');
  await page.getByRole('combobox').click();
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  // Cells have role="gridcell" + aria-selected on current value
  const cells = grid.getByRole('gridcell');
  expect(await cells.count()).toBeGreaterThan(0);
});

test('DP-R11 — aria-invalid="true" on invalid date input', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.fill('not-a-date');
  await page.keyboard.press('Tab');
  expect(await input.getAttribute('aria-invalid')).toBe('true');
});
```
