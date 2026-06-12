# Toast — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Toast.focus.spec.ts` (CI-gated; status in Toaster.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/toast` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

## Tests

```ts
test('TST-R04 — toast does NOT steal focus on open (WCAG 2.4.3)', async ({ page }) => {
  await page.goto('/components/toast');
  const triggerBtn = page.getByRole('button', { name: 'Show toast' });
  await triggerBtn.focus();
  await triggerBtn.click();
  // Focus remains on trigger (not moved to toast)
  await expect(triggerBtn).toBeFocused();
  await expect(page.getByRole('status')).toBeVisible();
});

test('TST-R05 — hover pauses auto-dismiss timer (WCAG SC 1.4.13 hoverable)', async ({ page }) => {
  await page.goto('/components/toast?duration=3000');
  await page.getByRole('button', { name: 'Show toast' }).click();
  const toast = page.getByRole('status');
  await expect(toast).toBeVisible();
  // Hover over toast before auto-dismiss
  await toast.hover();
  await page.waitForTimeout(4000); // longer than duration
  // Timer paused while hovering — toast still visible
  await expect(toast).toBeVisible();
  // Mouse out resumes timer
  await page.mouse.move(0, 0);
  await page.waitForTimeout(3500);
  await expect(toast).not.toBeVisible();
});

test('TST-R06 — focus inside toast pauses auto-dismiss (WCAG SC 1.4.13 focusable)', async ({
  page,
}) => {
  await page.goto('/components/toast?duration=2000&action=undo');
  await page.getByRole('button', { name: 'Show toast with action' }).click();
  const actionBtn = page.getByRole('button', { name: 'Undo' });
  await actionBtn.focus();
  await page.waitForTimeout(3000); // longer than duration
  // Focus inside toast paused timer — toast still visible
  await expect(page.getByRole('status')).toBeVisible();
});
```
