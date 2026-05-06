# Combobox — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/combobox` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (editable-listbox)

## Tests

```ts
test('role="combobox" + aria-autocomplete="list" + aria-expanded on input', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  expect(await input.getAttribute('aria-autocomplete')).toBe('list');
  expect(await input.getAttribute('aria-expanded')).toBe('false');
  await input.click();
  expect(await input.getAttribute('aria-expanded')).toBe('true');
  // aria-controls now points to listbox id
  const controls = await input.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
});

test('Listbox role="listbox" + aria-labelledby={inputId} + aria-multiselectable=false', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.click();
  const listbox = page.getByRole('listbox');
  const inputId = await input.getAttribute('id');
  expect(await listbox.getAttribute('aria-labelledby')).toBe(inputId);
  expect(await listbox.getAttribute('aria-multiselectable')).toBe('false');
});

test('aria-disabled propagation (not native disabled)', async ({ page }) => {
  await page.goto('/components/combobox?disabled=1');
  const input = page.getByRole('combobox');
  expect(await input.getAttribute('aria-disabled')).toBe('true');
  // Native disabled attribute NOT used — AT users can discover field
  expect(await input.getAttribute('disabled')).toBeNull();
});

test('Empty state uses role="presentation" (not listbox child)', async ({ page }) => {
  await page.goto('/components/combobox?search=xyznomatch');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('xyznomatch');
  await expect(page.getByRole('listbox')).toBeVisible();
  // "No results" message has role="presentation" (not listbox option)
  const emptyMsg = page.getByText(/no results|empty/i).first();
  expect(await emptyMsg.getAttribute('role')).toBe('presentation');
});
```
