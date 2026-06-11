# Combobox — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Combobox.focus.spec.ts` (CI-gated; status in Combobox.tsx `@tested`; only the manual
NVDA sweep stays deferred). This file is a consumer-CI reference snapshot, not the
source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/combobox` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Tests

```ts
test('CB-R06 — blur commits on exact textValue match (Strategy A Radix)', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('Japan'); // exact match — non-matching text REVERTS instead
  // Tab away — the Tab-commit path commits the highlighted exact match
  // (the blur exact-match branch yields the identical outcome).
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100); // microtask + blur delay
  await expect(input).toHaveValue(/Japan/i);
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
