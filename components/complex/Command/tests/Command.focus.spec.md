# Command — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Command.focus.spec.ts` (CI-gated; status in Command.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('CMD-R06 — focus trap: Tab cycles within palette modal', async ({ page }) => {
  await page.goto('/components/command?footer=1');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await input.focus();
  // Tab cycles to next focusable in modal
  await page.keyboard.press('Tab');
  const activeRole = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  expect(['option', 'button'].includes(activeRole || '')).toBe(true);
});

test('CMD-R07 — initial focus on input, not first option', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  const input = page.getByRole('combobox');
  await expect(input).toBeFocused();
});

test('CMD-R08 — background inert while open (AT virtual cursor blocked)', async ({ page }) => {
  await page.goto('/components/command');
  await page.getByRole('button', { name: 'Open palette' }).click();
  // Body children except portal root have inert
  const bodyChildrenInert = await page.evaluate(() => {
    return Array.from(document.body.children)
      .filter((el) => !el.querySelector('[role="combobox"]'))
      .every((el) => el.hasAttribute('inert'));
  });
  expect(bodyChildrenInert).toBe(true);
});
```
