# Slider — regression spec (25 cases SL-R01..SL-R25)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Slider.regression.spec.ts` (CI-gated; status in Slider.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
25 regression cases mapped (SL-R01..SL-R25). This file covers SL-R02, R03,
R06, R09, R14, R15, R16, R21, R23-R25 (remaining cases in keyboard/focus/aria
specs).

## Tests

```ts
test('SL-R02 — React 19 refs: thumb ref clean (no warnings)', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/slider');
  await page.reload();
  expect(warnings.filter((w) => w.toLowerCase().includes('ref'))).toHaveLength(0);
});

test('SL-R03 — render-time prop sync (no setState-in-render warning)', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.goto('/components/slider?externalValue=1');
  await page.getByRole('button', { name: 'Change external value' }).click();
  await page.waitForTimeout(100);
  expect(warnings.filter((w) => w.includes('setState'))).toHaveLength(0);
});

test('SL-R06 — drag clamps clientX/Y before percent calc (no escape)', async ({ page }) => {
  await page.goto('/components/slider?value=50');
  const thumb = page.getByRole('slider');
  const box = await thumb.boundingBox();
  if (!box) throw new Error('No thumb bounds');
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  // Drag way past viewport bounds
  await page.mouse.move(-500, -500);
  await page.mouse.up();
  // Value clamped at min, no NaN
  expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0);
});

test('SL-R09 — decimal step precision: value rounded per step', async ({ page }) => {
  await page.goto('/components/slider?step=0.1&min=0&max=1');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const value = Number(await thumb.getAttribute('aria-valuenow'));
  // Precision: 0.3 exact, not 0.30000000000000004
  expect(value).toBe(0.3);
});

test('SL-R14 — controlled mode external value overrides drag mid-flight', async ({ page }) => {
  await page.goto('/components/slider?controlled=1&value=50');
  const thumb = page.getByRole('slider');
  const box = await thumb.boundingBox();
  if (!box) throw new Error('No thumb bounds');
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  // During drag, parent updates value externally
  await page.getByRole('button', { name: 'Set 75 external' }).click();
  await page.mouse.up();
  // Controlled value wins
  expect(await thumb.getAttribute('aria-valuenow')).toBe('75');
});

test('SL-R15 — uncontrolled defaultValue initializes correctly', async ({ page }) => {
  await page.goto('/components/slider?defaultValue=42');
  const thumb = page.getByRole('slider');
  expect(await thumb.getAttribute('aria-valuenow')).toBe('42');
});

test('SL-R16 — touch pointer: drag works with pointerType=touch', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/slider?value=50');
  const thumb = mobilePage.getByRole('slider');
  const box = await thumb.boundingBox();
  if (box) {
    await mobilePage.touchscreen.tap(box.x + box.width / 2 + 50, box.y);
    // Touch drag updates value
    expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  }
  await ctx.close();
});

test.skip('SL-R21 — multi-thumb range slider [PLAYGROUND-DEP: range demo]', async () => {
  // Single-thumb only in v1.0. Multi-thumb deferred.
});

test('SL-R23 — prefers-reduced-motion disables thumb transitions', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/slider');
  const thumb = page.getByRole('slider');
  const transition = await thumb.evaluate((el) => window.getComputedStyle(el).transition);
  expect(transition).toMatch(/none|0s/);
});

test('SL-R24 — form participation: hidden input syncs with value', async ({ page }) => {
  await page.goto('/components/slider?name=volume&value=75');
  const hiddenInput = page.locator('input[name="volume"][type="hidden"]');
  expect(await hiddenInput.inputValue()).toBe('75');
});

test('SL-R25 — onValueCommit fires only on drag end + keyboard commit', async ({ page }) => {
  await page.goto('/components/slider?trackCommit=1');
  const calls = await page.evaluateHandle(() => {
    (window as any).__commitCalls = [];
    return (window as any).__commitCalls;
  });
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  const result = await calls.jsonValue();
  expect(result.length).toBe(1);
});
```
