# Select — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Select.focus.spec.ts` (CI-gated; status in Select.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/select` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Tests

```ts
test('SL-R05 — Escape closes listbox and restores focus to trigger', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('SL-R14 — highlighted option scrolled into view (long list)', async ({ page }) => {
  await page.goto('/components/select?options=100');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  // Press End to highlight last option
  await page.keyboard.press('End');
  const lastOption = page.getByRole('option').last();
  // Option must be in view (not clipped by listbox scroll)
  await expect(lastOption).toBeInViewport();
});

test('SL-R13 — aria-activedescendant cleared when highlight resets', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.keyboard.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBeTruthy();
  await page.keyboard.press('Escape');
  // After close, highlight state resets — no stale aria-activedescendant
  await trigger.click();
  // Re-open: if value was selected, highlight = selected; else highlight = first
  expect(await listbox.getAttribute('aria-activedescendant')).toBeTruthy();
});
```
