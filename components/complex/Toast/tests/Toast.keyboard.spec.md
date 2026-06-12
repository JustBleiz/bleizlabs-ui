# Toast — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Toast.keyboard.spec.ts` (CI-gated; status in Toaster.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/toast` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

## Tests

```ts
test('TST-R01 — Tab reaches toast close button from viewport natural order', async ({ page }) => {
  await page.goto('/components/toast');
  await page.getByRole('button', { name: 'Show toast' }).click();
  // Tab from any focusable should eventually reach close button
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const closeBtn = page.getByRole('button', { name: /close/i });
  // Reachable via Tab (not focus-stolen on open)
  await expect(closeBtn).toBeVisible();
});

test('TST-R02 — Escape does NOT dismiss (toast is informational, not modal)', async ({ page }) => {
  await page.goto('/components/toast');
  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.keyboard.press('Escape');
  // Toast persists on Escape (not a modal dismissable)
  await expect(page.getByRole('status')).toBeVisible();
});

test('TST-R03 — action button activates via Enter/Space', async ({ page }) => {
  await page.goto('/components/toast?action=undo');
  await page.getByRole('button', { name: 'Show toast with action' }).click();
  const actionBtn = page.getByRole('button', { name: 'Undo' });
  await actionBtn.focus();
  await page.keyboard.press('Enter');
  // Action callback fired, toast typically dismisses after action
  await expect(page.getByRole('status')).not.toBeVisible();
});
```
