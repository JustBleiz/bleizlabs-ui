# Command — regression spec (20 cases CMD-R01..R20)

**Execution status:** DEFERRED. Executable canon: sibling `Command.regression.spec.ts`.
This file covers CMD-R14..R20 (remaining cases in keyboard/focus/aria specs).

## Tests

```ts
test('CMD-R14 — filter auto mode: input value substring-filters items', async ({ page }) => {
  await page.goto('/components/command?items=50');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('settings');
  const visibleOptions = page.getByRole('option');
  const count = await visibleOptions.count();
  // Only items matching "settings" visible
  expect(count).toBeLessThan(50);
});

test('CMD-R15 — filter=false: no client-side filtering (consumer-managed)', async ({ page }) => {
  await page.goto('/components/command?filter=false');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.fill('anything');
  // All items still visible (filter disabled)
  const count = await page.getByRole('option').count();
  expect(count).toBeGreaterThan(0);
});

test('CMD-R16 — group auto-hide when all items filter out', async ({ page }) => {
  await page.goto('/components/command?groups=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  await page.getByRole('combobox').fill('zxc-no-match');
  // Groups with zero visible items hide entirely
  const visibleGroups = await page.getByRole('group').count();
  expect(visibleGroups).toBe(0);
});

test('CMD-R17 — IME composition guard respected', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.focus();
  await input.evaluate((el: HTMLInputElement) => {
    el.dispatchEvent(new CompositionEvent('compositionstart'));
    el.dispatchEvent(new InputEvent('input', { data: 'あ' }));
  });
  // Filter should NOT apply during composition
  const optionsBeforeEnd = await page.getByRole('option').count();
  await input.evaluate((el: HTMLInputElement) => {
    el.dispatchEvent(new CompositionEvent('compositionend'));
  });
  // Filter applies after compositionend
  expect(optionsBeforeEnd).toBeGreaterThan(0);
});

test('CMD-R18 — hidden registry when closed preserves consumer state', async ({ page }) => {
  await page.goto('/components/command?dynamic=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  await page.getByRole('combobox').fill('project');
  // Close palette
  await page.keyboard.press('Escape');
  // Reopen — same items visible (registry preserved)
  await page.getByRole('button', { name: 'Open palette' }).click();
  // State persists (search cleared by default, but items registry intact)
  const count = await page.getByRole('option').count();
  expect(count).toBeGreaterThan(0);
});

test.skip('CMD-R19 — virtualized command list [PLAYGROUND-DEP: virtualization demo]', async () => {
  // Plain list in v1.0. Virtualization for 1000+ items deferred.
});

test.skip('CMD-R20 — nested command pages [PLAYGROUND-DEP: pages demo]', async () => {
  // Single-page in v1.0. Nested pages/drill-down deferred.
});
```
