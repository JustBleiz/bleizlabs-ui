# Combobox — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/combobox` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Tests

```ts
test('CB-R06 — blur commits current search value (Strategy A Radix)', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('app');
  // Focus moves outside combobox
  await page.getByRole('button', { name: 'Submit' }).focus();
  // Search committed as selected value (or reverts to last valid if invalid)
  // Strategy A: commit what's shown in input
  const finalValue = await input.inputValue();
  expect(finalValue).toBe('app');
});

test('Focus stays on input the entire time (APG editable-combobox)', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  // Focus remains on input (not moved to option)
  await expect(input).toBeFocused();
  // Only aria-activedescendant tracks highlight
  const activeId = await input.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
});

test('Clear button: focus returns to input after clear', async ({ page }) => {
  await page.goto('/components/combobox?value=selected');
  const clearButton = page.getByRole('button', { name: 'Clear selection' });
  await clearButton.click();
  const input = page.getByRole('combobox');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('');
});
```
