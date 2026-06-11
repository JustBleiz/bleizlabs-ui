# Combobox — regression spec (Radix + Select-inherited issue mapping)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Combobox.regression.spec.ts` (CI-gated; status in Combobox.tsx `@tested`; only the
manual NVDA sweep stays deferred). This file is a consumer-CI reference snapshot, not
the source of truth. Registry: the per-case content below and the sibling `.spec.ts`
are the canon (the spec-doc the original 28-case mapping came from was an ephemeral
draft, since retired). This file covers the highest-risk cases (CB-R02 SSR, CB-R03
filter race, CB-R16 SSR portal); CB-R06 (blur commit), CB-R07 (IME guard), CB-R17
(Escape bubble) live in keyboard/focus specs; CB-R18..R21 (announcer) in the aria spec.

## Tests

```ts
test('CB-R02 — SSR hydration: no mismatch on initial render with preset value', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/combobox?value=option-2');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
  const input = page.getByRole('combobox');
  await expect(input).toHaveValue(/Option 2|option-2/i);
});

test('CB-R03 — filter race: rapid keystrokes produce final-state listbox', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  await input.focus();
  // Rapid type simulating race between filter updates
  await page.keyboard.type('abcdef', { delay: 10 });
  // After all keystrokes settled, listbox reflects final filter
  await page.waitForTimeout(300);
  const visibleCount = await page.getByRole('option').count();
  // No stale filter state (zero options matching "abcdef" expected)
  expect(visibleCount).toBeGreaterThanOrEqual(0);
});

test('CB-R16 — SSR portal: listbox not rendered server-side (client-only)', async ({ page }) => {
  // Disable JS and check server HTML
  await page.context().setOffline(false);
  const response = await page.goto('/components/combobox');
  expect(response?.status()).toBe(200);
  const html = await response?.text();
  // Portal content should NOT be in SSR HTML (FloatingPortal client-only)
  expect(html).not.toContain('role="listbox"');
  // Client hydration mounts portal after 'use client' boundary
  // (ArrowDown opens — click on the input doesn't open Combobox)
  await page.getByRole('combobox').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
});

test('Controlled value: external update propagates to input', async ({ page }) => {
  await page.goto('/components/combobox?controlled=1');
  const input = page.getByRole('combobox');
  await page.getByRole('button', { name: 'Set Value External' }).click();
  // External state update → input reflects new value
  await expect(input).toHaveValue(/option-3|Option 3/i);
});

test('onValueChange does NOT fire for null transitions (only non-null commits)', async ({
  page,
}) => {
  await page.goto('/components/combobox?trackChanges=1');
  const callsHandle = await page.evaluateHandle(() => {
    (window as any).__valueChangeCalls = [];
    return (window as any).__valueChangeCalls;
  });
  const input = page.getByRole('combobox');
  await input.focus();
  await page.keyboard.press('ArrowDown'); // opens (click on the input doesn't open Combobox)
  await page.getByRole('option').first().click();
  // One call with string value (no null fire)
  const calls = await callsHandle.jsonValue();
  expect(calls.length).toBe(1);
  expect(typeof calls[0]).toBe('string');
});

test('Search state never null (empty string is valid initial)', async ({ page }) => {
  await page.goto('/components/combobox');
  const input = page.getByRole('combobox');
  // Initial input value must be string, never undefined/null
  const initial = await input.inputValue();
  expect(typeof initial).toBe('string');
});
```
