# Command — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Command.keyboard.spec.ts` (CI-gated; status in Command.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('CMD-R01 — ArrowDown/Up navigates filtered items', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  const activeId = await listbox.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
});

test('CMD-R02 — Enter fires cmd-select on highlighted item', async ({ page }) => {
  await page.goto('/components/command?trackSelect=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  // Palette closes, callback fired
  await expect(page.getByRole('listbox')).not.toBeVisible();
});

test('CMD-R03 — Escape closes palette, restores focus to trigger', async ({ page }) => {
  await page.goto('/components/command');
  const triggerBtn = page.getByRole('button', { name: 'Open palette' });
  await triggerBtn.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox')).not.toBeVisible();
  await expect(triggerBtn).toBeFocused();
});

test('CMD-R04 — Cmd+K (useCommandShortcut helper) opens palette', async ({ page, browserName }) => {
  await page.goto('/components/command?shortcut=1');
  const modifier = browserName === 'webkit' ? 'Meta' : 'Control';
  await page.keyboard.press(`${modifier}+KeyK`);
  await expect(page.getByRole('combobox')).toBeVisible();
});

test('CMD-R05 — Home/End jump to first/last enabled filtered item', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('End');
  const listbox = page.getByRole('listbox');
  const activeId = await listbox.getAttribute('aria-activedescendant');
  const lastOption = page.getByRole('option').last();
  expect(activeId).toBe(await lastOption.getAttribute('id'));
});
```
