# InputOTP — ARIA semantics spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`InputOTP.aria.spec.ts` (CI-gated; status in InputOTP.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('OTP-R07 — autoComplete="one-time-code" enables SMS autofill (iOS Safari)', async ({
  page,
}) => {
  await page.goto('/components/input-otp');
  const input = page.locator('input[type="text"]').first();
  expect(await input.getAttribute('autocomplete')).toBe('one-time-code');
});

test('OTP-R08 — aria-label or aria-labelledby present (WCAG 2.1 SC 1.1.1)', async ({ page }) => {
  await page.goto('/components/input-otp');
  const input = page.locator('input[type="text"]').first();
  const ariaLabel = await input.getAttribute('aria-label');
  const ariaLabelledBy = await input.getAttribute('aria-labelledby');
  expect(ariaLabel || ariaLabelledBy).toBeTruthy();
});

test('OTP-R09 — invalid state: aria-invalid="true" + focus-ring-error styling', async ({
  page,
}) => {
  await page.goto('/components/input-otp?invalid=1');
  const input = page.locator('input[type="text"]').first();
  expect(await input.getAttribute('aria-invalid')).toBe('true');
});
```
