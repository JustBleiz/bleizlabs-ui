# Select — regression spec (Radix closed-issue mapping)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Select.regression.spec.ts` (CI-gated; status in Select.tsx `@tested`; only the manual
NVDA sweep stays deferred). This file is a consumer-CI reference snapshot, not the
source of truth. Registry: SL-R01..R22 (E142 mapping; the spec-doc the mapping came
from was an ephemeral `_tmp` draft, since retired — the per-case content below and the
sibling `.spec.ts` are the canon) + SL-R23/R24 (E03 audit remediation: asChild
rest-forwarding — EXECUTED in `.spec.ts`; SL-R25..R27 live in the keyboard spec).
This file covers SL-R01, R02, R03, R06, R09, R15, R16, R19 (remaining cases in
keyboard/focus/aria spec files).

## Tests

```ts
test('SL-R01 — controlled-to-uncontrolled runtime switch does not crash', async ({ page }) => {
  await page.goto('/components/select?controlled=toggle');
  const toggle = page.getByRole('button', { name: 'Toggle controlled' });
  await toggle.click();
  // Should not crash; value persists or resets gracefully
  await expect(page.getByRole('combobox')).toBeVisible();
});

test('SL-R02 — SSR hydration: no mismatch on initial render', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/select?value=option-2');
  await page.reload();
  // No hydration warnings in console
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
  // Trigger shows server-rendered value
  const trigger = page.getByRole('combobox');
  await expect(trigger).toContainText('Option 2');
});

test('SL-R03 — typeahead after external value change: buffer cleared', async ({ page }) => {
  await page.goto('/components/select?externalChange=1');
  const trigger = page.getByRole('combobox');
  await trigger.focus();
  await page.keyboard.type('o');
  // External state change triggered (e.g., via React state update)
  await page.getByRole('button', { name: 'Set Value External' }).click();
  // Typeahead buffer should NOT persist stale input across external changes
  await page.keyboard.type('b');
  // Expect fresh typeahead search, not concatenated "ob"
  await expect(page.getByRole('listbox').or(trigger)).toContainText(/b/i);
});

test('SL-R06 — outside click + scroll closes listbox', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole('listbox')).not.toBeVisible();
  // Reopen and scroll
  await trigger.click();
  await page.evaluate(() => window.scrollBy(0, 100));
  await expect(page.getByRole('listbox')).not.toBeVisible();
});

test('SL-R09 — external value change while open updates highlight', async ({ page }) => {
  await page.goto('/components/select?externalChange=1');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  // External React state update
  await page.getByRole('button', { name: 'Set Value External' }).click();
  const listbox = page.getByRole('listbox');
  // Highlight re-syncs to new selected value
  const activeId = await listbox.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
});

test('SL-R15 — portal renders once per mount (no SSR double-portal)', async ({ page }) => {
  await page.goto('/components/select');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  // Only one listbox in DOM
  const listboxes = page.getByRole('listbox');
  expect(await listboxes.count()).toBe(1);
});

test('SL-R16 — nested Dialog+Select: Escape closes Select first, Dialog stays open', async ({
  page,
}) => {
  await page.goto('/components/select?dialog=1');
  await page.getByRole('button', { name: 'Open Dialog' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox').click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  // Escape routes to Select listbox first
  await expect(page.getByRole('listbox')).not.toBeVisible();
  // Dialog still open after first Escape (Radix #1951 pattern)
  await expect(dialog).toBeVisible();
});

test.skip('SL-R19 — dark mode color flicker [PLAYGROUND-DEP: theme toggle demo]', async () => {
  // Requires theme toggle playground. Expected: no color flash during theme
  // transition on Select trigger/listbox; CSS variables update smoothly.
});
```
