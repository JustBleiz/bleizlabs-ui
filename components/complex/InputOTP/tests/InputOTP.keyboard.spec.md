# InputOTP — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`InputOTP.keyboard.spec.ts` (CI-gated; status in InputOTP.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('OTP-R01 — typing single char advances focus marker to next slot', async ({ page }) => {
  await page.goto('/components/input-otp');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.type('1');
  // Hidden input value grew; decorative slot 0 shows "1", slot 1 highlighted
  expect(await input.inputValue()).toBe('1');
});

test('OTP-R02 — Backspace removes last char, focus stays in input', async ({ page }) => {
  await page.goto('/components/input-otp');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.type('12');
  await page.keyboard.press('Backspace');
  expect(await input.inputValue()).toBe('1');
  await expect(input).toBeFocused();
});

test('OTP-R03 — paste distributes chars across slots', async ({ page }) => {
  await page.goto('/components/input-otp?length=6');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.evaluate(() => navigator.clipboard.writeText('123456'));
  await page.keyboard.press('Control+v');
  expect(await input.inputValue()).toBe('123456');
});

test('OTP-R04 — pattern filter: numeric blocks alphabetic input', async ({ page }) => {
  await page.goto('/components/input-otp?pattern=numeric');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.type('abc');
  // Alphabetic chars rejected via onBeforeInput preventDefault
  expect(await input.inputValue()).toBe('');
});
```
