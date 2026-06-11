# Combobox — ARIA semantics spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Combobox.aria.spec.ts` (CI-gated; status in Combobox.tsx `@tested`; only the manual
NVDA sweep stays deferred). This file is a consumer-CI reference snapshot, not the
source of truth. E03 audit remediation note: CB-R18..R21 (debounced filtered-result-count
announcer, WCAG 4.1.3) added to the sibling `.spec.ts` — mirrored below.
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
  await input.focus();
  await input.fill('a'); // type to open (click doesn't open Combobox — Radix/cmdk precedent)
  expect(await input.getAttribute('aria-expanded')).toBe('true');
  // aria-controls now points to listbox id
  const controls = await input.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
});

test('Listbox role="listbox" + aria-labelledby={inputId} + aria-multiselectable=false', async ({
  page,
}) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  await input.fill('a'); // type to open (click doesn't open Combobox)
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

// CB-R18..R21 (E03 audit remediation) — debounced filtered-result-count announcer
// (WCAG 4.1.3; the NVDA sweep expected it, the component had no live region pre-fix).

test('CB-R18 — announcer node pre-exists, role=status, empty before interaction', async ({
  page,
}) => {
  // Pre-fix: node absent entirely.
  const announcer = page.locator('[data-combobox-announcer]').first();
  await expect(announcer).toBeAttached();
  await expect(announcer).toHaveAttribute('role', 'status');
  await expect(announcer).toHaveAttribute('aria-live', 'polite');
  await expect(announcer).toHaveText('');
});

test('CB-R19 — announcer reports filtered counts (plural / zero / singular)', async ({ page }) => {
  const input = page.getByRole('combobox').first();
  const announcer = page.locator('[data-combobox-announcer]').first();
  await input.focus();
  await input.fill('an');
  const listbox = page.getByRole('listbox').first();
  await expect(listbox).toBeVisible();
  const count = await listbox.getByRole('option').count();
  expect(count).toBeGreaterThan(1);
  await expect(announcer).toHaveText(`${count} results`);
  await input.fill('zxqv');
  await expect(announcer).toHaveText('0 results');
  await input.fill('croat');
  await expect(announcer).toHaveText('1 result');
});

test('CB-R20 — announcement is debounced (coalesces a typing burst)', async ({ page }) => {
  const input = page.getByRole('combobox').first();
  const announcer = page.locator('[data-combobox-announcer]').first();
  await input.focus();
  await page.keyboard.type('croa', { delay: 40 });
  // Immediately after the burst the 300ms debounce hasn't fired yet.
  await expect(announcer).toHaveText('');
  // Settles to the single final-count text.
  await expect(announcer).toHaveText('1 result');
});

test('CB-R21 — multi mode: toggle resets count to total; Escape clears the announcer', async ({
  page,
}) => {
  // Multi demo (uncontrolled chips) — exact-name match ("Countries" is a
  // substring of two other labels on the page).
  const input = page.getByRole('combobox', { name: 'Countries', exact: true });
  const announcer = page.locator('[data-combobox-announcer]').nth(6);
  await input.focus();
  await input.fill('pol');
  const listbox = page.getByRole('listbox').first();
  await expect(listbox).toBeVisible();
  await expect(announcer).toHaveText('1 result');
  // Toggle the pick — search clears, listbox stays open, count returns to total.
  await listbox.getByRole('option').first().click();
  await expect(listbox).toBeVisible();
  const total = await listbox.getByRole('option').count();
  await expect(announcer).toHaveText(total === 1 ? '1 result' : `${total} results`);
  await page.keyboard.press('Escape');
  await expect(announcer).toHaveText('');
});
```
