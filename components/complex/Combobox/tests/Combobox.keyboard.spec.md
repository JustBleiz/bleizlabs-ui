# Combobox — keyboard interaction spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/combobox` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (editable-listbox)

## Tests

```ts
test('CB-R07 — IME composition guard: composed chars do not trigger filter', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  // Start IME composition (Japanese/Chinese input)
  await input.evaluate((el: HTMLInputElement) => {
    el.dispatchEvent(new CompositionEvent('compositionstart'));
    el.value = 'あ'; // composing
    el.dispatchEvent(new InputEvent('input', { data: 'あ' }));
  });
  // Filter should NOT fire during composition
  await expect(page.getByRole('listbox')).not.toBeVisible();
  // Commit composition
  await input.evaluate((el: HTMLInputElement) => {
    el.dispatchEvent(new CompositionEvent('compositionend', { data: 'あ' }));
  });
  // Filter fires ONLY after compositionend
  await expect(page.getByRole('listbox')).toBeVisible();
});

test('CB-R17 — Escape bubble: clear search first, then close if already empty', async ({
  page,
}) => {
  await page.goto('/components/combobox?dialog=1');
  await page.getByRole('button', { name: 'Open Dialog' }).click();
  const input = page.getByRole('dialog').getByRole('combobox');
  await input.focus();
  await input.fill('test');
  await expect(input).toHaveValue('test');
  await page.keyboard.press('Escape');
  // First Escape clears search
  await expect(input).toHaveValue('');
  // Dialog still open
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  // Second Escape bubbles to Dialog (or no-op per parent)
  // In this variant, Dialog Escape handler closes dialog
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('ArrowDown on closed input opens listbox + seeds highlight', async ({ page }) => {
  await page.goto('/components/combobox?value=');
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  // aria-activedescendant on input points to first visible enabled option
  const activeId = await input.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
});

test('Printable char opens listbox and filters (non-IME keyboard)', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.type('a');
  await expect(page.getByRole('listbox')).toBeVisible();
  // Only options starting with 'a' visible (filter applied)
  const visibleOptions = page.getByRole('option');
  const count = await visibleOptions.count();
  expect(count).toBeGreaterThan(0);
});
```
