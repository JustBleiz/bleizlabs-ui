# Command — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('CMD-R09 — input role="combobox" + aria-expanded + aria-controls', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  expect(await input.getAttribute('aria-expanded')).toBe('true');
  expect(await input.getAttribute('aria-controls')).toBeTruthy();
});

test('CMD-R10 — modal shell role="dialog" + aria-modal="true"', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const dialog = page.getByRole('dialog');
  expect(await dialog.getAttribute('aria-modal')).toBe('true');
});

test('CMD-R11 — options role="option" + aria-selected synced to highlight', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  await page.keyboard.press('ArrowDown');
  const options = page.getByRole('option');
  const selectedCount = await options.evaluateAll(
    (els) => els.filter((el) => el.getAttribute('aria-selected') === 'true').length,
  );
  expect(selectedCount).toBe(1);
});

test('CMD-R12 — groups role="group" + aria-labelledby to group heading', async ({ page }) => {
  await page.goto('/components/command?groups=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const group = page.getByRole('group').first();
  expect(await group.getAttribute('aria-labelledby')).toBeTruthy();
});

test('CMD-R13 — SC 1.1.1 dev-mode warn if no aria-label and no visible label', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/command?noLabel=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  // Dev-mode warning when accessible name missing
  expect(warnings.some((w) => w.toLowerCase().includes('aria'))).toBe(true);
});
```
