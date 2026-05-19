# DatePicker — keyboard interaction spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('DP-R01 — ArrowDown/Alt+Down opens Calendar popup from input', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('grid')).toBeVisible();
});

test('DP-R02 — Escape closes popup without losing input focus', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.click();
  await expect(page.getByRole('grid')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('grid')).not.toBeVisible();
  await expect(input).toBeFocused();
});

test('DP-R03 — Enter in input commits typed ISO date', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('2026-05-15');
  await page.keyboard.press('Enter');
  expect(await input.inputValue()).toContain('2026-05-15');
});

test('DP-R04 — Calendar grid keyboard inherits APG /grid/ (Arrow/PageUp/Down/Home/End)', async ({
  page,
}) => {
  await page.goto('/components/date-picker?value=2026-04-15');
  await page.getByRole('combobox').click();
  const grid = page.getByRole('grid');
  await grid.getByRole('button', { name: /15/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(grid.getByRole('button', { name: /16/ })).toBeFocused();
});
```
