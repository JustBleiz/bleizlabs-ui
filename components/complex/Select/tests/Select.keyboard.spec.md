# Select — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Select.keyboard.spec.ts` (CI-gated; status in Select.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
E03 audit remediation note: the seeding contract mapped below as SL-R04 is EXECUTED as
**SL-R27** in the sibling `.spec.ts` (one case, two IDs — the `.ts` suite is canonical),
alongside SL-R25/R26 (closed printable-char open + deferred typeahead match).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/select` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (combobox-select-only)

## Tests

```ts
test('SL-R04 — ArrowUp on closed Select with no value opens + highlights last', async ({
  page,
}) => {
  await page.goto('/components/select?value=');
  const trigger = page.getByRole('combobox');
  await trigger.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('listbox')).toBeVisible();
  const options = page.getByRole('option');
  const last = options.last();
  const activeId = await page.getByRole('listbox').getAttribute('aria-activedescendant');
  const lastId = await last.getAttribute('id');
  expect(activeId).toBe(lastId);
});

test('SL-R07 — Tab from open listbox closes AND navigates to next focusable', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Tab');
  // Listbox closes AND focus moves to next tabbable (not back to trigger)
  await expect(page.getByRole('listbox')).not.toBeVisible();
  const nextButton = page.getByRole('button', { name: 'Submit' });
  await expect(nextButton).toBeFocused();
});

test('SL-R08 — disabled item skipped by arrow navigation', async ({ page }) => {
  await page.goto('/components/select?disabled=option-2');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  const option1 = page.getByRole('option', { name: 'Option 1' });
  const option3 = page.getByRole('option', { name: 'Option 3' });
  // Highlight option-1, then ArrowDown skips disabled option-2 → option-3
  await page.keyboard.press('ArrowDown'); // assume starts on option-1
  await page.keyboard.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  const activeId = await listbox.getAttribute('aria-activedescendant');
  const option3Id = await option3.getAttribute('id');
  expect(activeId).toBe(option3Id);
});

test('SL-R10 — Home/End wrap correctly around disabled edges', async ({ page }) => {
  await page.goto('/components/select?disabled=first');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.keyboard.press('Home');
  // Home skips disabled first item, lands on first ENABLED
  const firstEnabled = page.getByRole('option').nth(1);
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBe(
    await firstEnabled.getAttribute('id'),
  );
});

test('SL-R11 — PageDown/PageUp jumps by 10 options', async ({ page }) => {
  await page.goto('/components/select?options=50');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  // Assume starts highlighted on option-0
  await page.keyboard.press('PageDown');
  const option10 = page.getByRole('option').nth(10);
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBe(
    await option10.getAttribute('id'),
  );
});

test('SL-R12 — typeahead with multi-char same prefix cycles correctly', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.focus();
  // Options: "Apple", "Avocado", "Banana"
  await page.keyboard.type('a');
  // Highlights "Apple"
  await page.keyboard.type('a');
  // Cycles to "Avocado" within 500ms buffer (Radix #30 fix)
  const avocado = page.getByRole('option', { name: 'Avocado' });
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBe(
    await avocado.getAttribute('id'),
  );
});

test('SL-R22 — typeahead with accents matches diacritic-folded', async ({ page }) => {
  await page.goto('/components/select?locale=pl');
  const trigger = page.getByRole('combobox');
  await trigger.focus();
  // Options include "Łódź", "Lublin"
  await page.keyboard.type('l');
  // Both "Łódź" and "Lublin" start with L (diacritic-folded)
  const firstMatch = page.getByRole('option').filter({ hasText: /^[ŁL]/ }).first();
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBe(
    await firstMatch.getAttribute('id'),
  );
});
```
