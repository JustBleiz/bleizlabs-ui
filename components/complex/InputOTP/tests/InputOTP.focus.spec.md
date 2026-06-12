# InputOTP — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`InputOTP.focus.spec.ts` (CI-gated; status in InputOTP.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('OTP-R05 — focus always on hidden input (decorative slots never focusable)', async ({
  page,
}) => {
  await page.goto('/components/input-otp');
  await page.keyboard.press('Tab');
  const input = page.locator('input[type="text"]').first();
  await expect(input).toBeFocused();
  // Decorative slots have no tabindex
  const slots = page.locator('[data-otp-slot]');
  for (let i = 0; i < (await slots.count()); i++) {
    expect(await slots.nth(i).getAttribute('tabindex')).toBeNull();
  }
});

test('OTP-R06 — click on decorative slot focuses real input at that position', async ({ page }) => {
  await page.goto('/components/input-otp');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.type('123');
  // Click on slot 1 (decorative)
  await page.locator('[data-otp-slot]').nth(1).click();
  // Focus still on real input
  await expect(input).toBeFocused();
});
```
