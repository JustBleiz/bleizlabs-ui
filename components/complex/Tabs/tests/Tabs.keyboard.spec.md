# Tabs — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Tabs.keyboard.spec.ts` (CI-gated; status in Tabs.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/tabs` playground
- Default: `<Tabs defaultValue="overview">` with Overview/Tasks/Team triggers
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

## Tests

```ts
test('TB-R03 — Tab key moves focus only; arrows change tab in automatic mode', async ({ page }) => {
  await page.goto('/components/tabs');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const tasks = page.getByRole('tab', { name: 'Tasks' });
  await overview.focus();
  expect(await overview.getAttribute('aria-selected')).toBe('true');
  // Tab key moves focus INTO tabpanel (tabindex=0), does NOT activate next tab
  await page.keyboard.press('Tab');
  expect(await tasks.getAttribute('aria-selected')).toBe('false'); // still Overview
  // ArrowRight activates next tab (automatic mode)
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  expect(await tasks.getAttribute('aria-selected')).toBe('true');
});

test('TB-R04 — Cmd/Ctrl+ArrowLeft skipped (browser back hotkey takes precedence)', async ({
  page,
}) => {
  await page.goto('/components/tabs');
  const tasks = page.getByRole('tab', { name: 'Tasks' });
  await tasks.click();
  await tasks.focus();
  // Modifier key press should NOT change tab (passes through to browser)
  await page.keyboard.press('Meta+ArrowLeft');
  expect(await tasks.getAttribute('aria-selected')).toBe('true');
});

test('TB-R08 — Manual mode Space inside input does not activate tab', async ({ page }) => {
  await page.goto('/components/tabs?mode=manual&input=1');
  const tabInput = page.getByRole('tabpanel').getByRole('textbox');
  await tabInput.focus();
  await page.keyboard.press('Space');
  // Input receives space, tab state unchanged
  expect(await tabInput.inputValue()).toContain(' ');
});

test('TB-R12 — Disabled trigger skipped by arrow navigation', async ({ page }) => {
  await page.goto('/components/tabs?disabled=tasks');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const team = page.getByRole('tab', { name: 'Team' });
  await overview.focus();
  // ArrowRight from Overview skips disabled "Tasks" → lands on "Team"
  await page.keyboard.press('ArrowRight');
  expect(await team.getAttribute('aria-selected')).toBe('true');
});

test('TB-R13 — Vertical orientation uses Up/Down arrows', async ({ page }) => {
  await page.goto('/components/tabs?orientation=vertical');
  const first = page.getByRole('tab').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  const second = page.getByRole('tab').nth(1);
  expect(await second.getAttribute('aria-selected')).toBe('true');
});

test('TB-R14 — RTL mode reverses Left/Right arrow semantics', async ({ page }) => {
  await page.goto('/components/tabs?dir=rtl');
  const overview = page.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  // In RTL, ArrowLeft moves to NEXT tab (not previous)
  await page.keyboard.press('ArrowLeft');
  const tasks = page.getByRole('tab', { name: 'Tasks' });
  expect(await tasks.getAttribute('aria-selected')).toBe('true');
});

test('TB-R20 — loop prop controls boundary wraparound', async ({ page }) => {
  await page.goto('/components/tabs?loop=false');
  const last = page.getByRole('tab').last();
  await last.focus();
  await page.keyboard.press('ArrowRight');
  // loop=false: stays on last tab
  expect(await last.getAttribute('aria-selected')).toBe('true');
  // Switch to loop=true default
  await page.goto('/components/tabs');
  await last.focus();
  await page.keyboard.press('ArrowRight');
  // loop=true (default): wraps to first
  const first = page.getByRole('tab').first();
  expect(await first.getAttribute('aria-selected')).toBe('true');
});
```
