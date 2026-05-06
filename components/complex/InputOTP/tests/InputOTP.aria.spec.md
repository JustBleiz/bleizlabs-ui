# InputOTP — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('OTP-R07 — autoComplete="one-time-code" enables SMS autofill (iOS Safari)', async ({ page }) => {
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

test('OTP-R09 — invalid state: aria-invalid="true" + focus-ring-error styling', async ({ page }) => {
  await page.goto('/components/input-otp?invalid=1');
  const input = page.locator('input[type="text"]').first();
  expect(await input.getAttribute('aria-invalid')).toBe('true');
});
```
