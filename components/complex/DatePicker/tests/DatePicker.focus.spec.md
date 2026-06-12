# DatePicker — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`DatePicker.focus.spec.ts` (CI-gated; status in DatePicker.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('DP-R05 — focus management: input ↔ Calendar cell transition', async ({ page }) => {
  await page.goto('/components/date-picker?value=2026-04-15');
  const input = page.getByRole('combobox');
  await input.click();
  // On open, focus moves to selected cell (Calendar manages focus)
  const selectedCell = page.getByRole('grid').getByRole('button', { name: /15/ });
  await expect(selectedCell).toBeFocused();
});

test('DP-R06 — selecting Calendar date closes popup, returns focus to input', async ({ page }) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.click();
  await page.getByRole('grid').getByRole('button', { name: /15/ }).click();
  await expect(page.getByRole('grid')).not.toBeVisible();
  await expect(input).toBeFocused();
});

test('DP-R07 — useFloatingFocus SKIPPED: manual focus management preserves input semantics', async ({
  page,
}) => {
  await page.goto('/components/date-picker');
  const input = page.getByRole('combobox');
  await input.focus();
  // Type without opening popup — focus stays on input (not auto-moved)
  await page.keyboard.type('2026');
  await expect(input).toBeFocused();
});
```
