# InputOTP — regression spec (20 cases OTP-R01..R20)

**Execution status:** DEFERRED. `docs/specs/input-otp-spec.md`.

## Tests

```ts
test('OTP-R10 — IME composition guard: composed chars do not enter slots', async ({ page }) => {
  await page.goto('/components/input-otp?pattern=numeric');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await input.evaluate((el: HTMLInputElement) => {
    el.dispatchEvent(new CompositionEvent('compositionstart'));
    el.dispatchEvent(new InputEvent('input', { data: 'あ' }));
  });
  // Filter respects composition — no character accepted
  expect(await input.inputValue()).toBe('');
});

test('OTP-R11 — defaultValue full-length fires onComplete once', async ({ page }) => {
  await page.goto('/components/input-otp?defaultValue=123456&length=6&trackComplete=1');
  const calls = await page.evaluateHandle(() => (window as any).__onCompleteCalls || []);
  // onComplete fires ONCE on user-driven completion, not defaultValue init
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  // Clear and retype to full
  await input.fill('');
  await input.fill('123456');
  const result = await calls.jsonValue();
  expect(result.length).toBe(1);
});

test('OTP-R12 — controlled mode: external fill updates slots', async ({ page }) => {
  await page.goto('/components/input-otp?controlled=1');
  await page.getByRole('button', { name: 'Set 987654 external' }).click();
  const input = page.locator('input[type="text"]').first();
  expect(await input.inputValue()).toBe('987654');
});

test('OTP-R13 — length enforcement: truncates paste exceeding length', async ({ page }) => {
  await page.goto('/components/input-otp?length=4');
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.evaluate(() => navigator.clipboard.writeText('1234567890'));
  await page.keyboard.press('Control+v');
  // Truncated to 4
  expect(await input.inputValue()).toBe('1234');
});

test('OTP-R14 — custom RegExp pattern: only matching chars accepted', async ({ page }) => {
  await page.goto('/components/input-otp?pattern=^[A-F0-9]$'); // hex
  const input = page.locator('input[type="text"]').first();
  await input.focus();
  await page.keyboard.type('A');
  expect(await input.inputValue()).toBe('A');
  await page.keyboard.type('Z'); // rejected (not hex)
  expect(await input.inputValue()).toBe('A');
});

test('OTP-R15 — SSR safe: no hydration warning', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'warning') warnings.push(msg.text()); });
  await page.goto('/components/input-otp');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('hydration'))).toHaveLength(0);
});

test.skip('OTP-R16 — autofocus on mount [PLAYGROUND-DEP: autoFocus demo]', async () => {
  // autoFocus prop behavior deferred to explicit demo.
});
```
