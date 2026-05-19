# Toast — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/toast` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

## Tests

```ts
test('TST-R07 — variant="error" gets role="alert" + aria-live="assertive"', async ({ page }) => {
  await page.goto('/components/toast?variant=error');
  await page.getByRole('button', { name: 'Show error toast' }).click();
  const toast = page.getByRole('alert');
  await expect(toast).toBeVisible();
  expect(await toast.getAttribute('aria-live')).toBe('assertive');
});

test('TST-R08 — non-error variants get role="status" + aria-live="polite"', async ({ page }) => {
  await page.goto('/components/toast?variant=success');
  await page.getByRole('button', { name: 'Show success toast' }).click();
  const toast = page.getByRole('status');
  await expect(toast).toBeVisible();
  expect(await toast.getAttribute('aria-live')).toBe('polite');
});

test('TST-R09 — aria-atomic="true" ensures SRs read title+description as unit', async ({
  page,
}) => {
  await page.goto('/components/toast');
  await page.getByRole('button', { name: 'Show toast' }).click();
  const toast = page.getByRole('status');
  expect(await toast.getAttribute('aria-atomic')).toBe('true');
});

test('TST-R10 — RTL direction mirrors position left↔right', async ({ page }) => {
  await page.goto('/components/toast?dir=rtl&position=top-left');
  await page.getByRole('button', { name: 'Show toast' }).click();
  const region = page.locator('[data-position="top-left"]');
  // Under RTL, top-left visually renders at top-right
  const box = await region.boundingBox();
  const viewport = page.viewportSize();
  if (box && viewport) {
    // Box should be on right half of screen under RTL
    expect(box.x).toBeGreaterThan(viewport.width / 2);
  }
});
```
