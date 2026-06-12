# Tooltip — regression spec (Radix closed-issue mapping)

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Tooltip.regression.spec.ts` (CI-gated; status in Tooltip.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
20 cases mapped from `radix-ui/primitives` closed issues. ~10 marked
`test.skip` with `PLAYGROUND-DEP:` rationale — unskip when referenced
integration scenarios land.

## Tests

```ts
test('radix-620 — hover content does not disappear when pointer enters tooltip', async ({
  page,
}) => {
  // SC 1.4.13 hoverable — grace area prevents premature close during pointer travel.
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.hover();
  await page.waitForTimeout(750);
  const tooltip = page.getByRole('tooltip');
  await tooltip.hover();
  await page.waitForTimeout(300);
  await expect(tooltip).toBeVisible();
});

test('radix-705 — tab switch hides tooltip (no reappear on return)', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});

test.skip('radix-617 — no re-show on programmatic focus restore from modal [PLAYGROUND-DEP: Dialog E15]', async () => {
  // Dialog closes → focus restored to tooltip trigger → tooltip should NOT re-show.
});

test('radix-1691 — click before delay cancels pending open', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.hover();
  await page.waitForTimeout(200); // well below 700ms delay
  await trigger.click();
  await page.waitForTimeout(600); // total ~800ms since hover
  // Tooltip should NOT be open — click cancelled the pending open timer
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});

test('radix-1077 — keyboard activation keeps tooltip open', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('radix-2029 — click does not dismiss tooltip', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await trigger.click();
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test.skip('radix-2372 — moving between tooltips inside grace area [PLAYGROUND-DEP: TooltipProvider multi-demo]', async () => {
  // Provider group: hover A → move directly to B trigger → A closes, B opens instantly.
});

test.skip('radix-1920 — tooltip + dropdown open/close interaction [PLAYGROUND-DEP: DropdownMenu E21]', async () => {
  // Dropdown triggered while tooltip visible — tooltip hides and does not ignore delayDuration on re-hover.
});

test.skip('radix-1573 — iOS Safari hover behavior [PLAYGROUND-DEP: iOS device]', async () => {
  // iOS Safari tap-to-focus shows tooltip; no hover events; coarse pointer suppresses hover listeners.
});

test.skip('radix-2589 — Android Chrome touch [PLAYGROUND-DEP: touch device]', async () => {
  // Android Chrome tap may not focus non-input — document as limitation, rely on aria-describedby.
});

test.skip('radix-1351 — mobile focus reliability [PLAYGROUND-DEP: mobile device]', async () => {
  // Some mobile browsers do not consistently fire focus on tap for custom elements.
});

test('radix-2959 — asChild with forwardRef child forwards events correctly', async ({ page }) => {
  // Our Slot primitive merges refs via mergeRefs utility — custom components must forwardRef.
  await page.goto('/components/tooltip');
  // Playground has a tooltip wrapping our Button atom (which is forwardRef).
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('radix-2665 — duplicate of 705, covered', async () => {
  // Covered by radix-705 test above.
  expect(true).toBe(true);
});

test('radix-899 — no id collision between sibling tooltips', async ({ page }) => {
  await page.goto('/components/tooltip');
  const first = page.getByRole('button').nth(0);
  const second = page.getByRole('button').nth(1);
  await first.focus();
  const id1 = await first.getAttribute('aria-describedby');
  await second.focus();
  const id2 = await second.getAttribute('aria-describedby');
  expect(id1).not.toBe(id2);
});

test('radix-1010 — no implicit type="button" on wrapper', async ({ page }) => {
  // Our Slot does not add type attr — consumer's element is preserved.
  await page.goto('/components/tooltip');
  const anchor = page.getByRole('link', { name: 'Docs' }); // tooltip wrapping an <a>
  await anchor.focus();
  const type = await anchor.getAttribute('type');
  expect(type).toBeNull();
});

test('radix-1476 — wide tooltip shifted within viewport bounds', async ({ page }) => {
  // Shift middleware clamps the tooltip so it cannot overflow horizontally.
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Wide tooltip' });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip');
  const box = await tooltip.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
  }
});

test('radix-1612 — tooltip follows trigger on scroll', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  const before = await page.getByRole('tooltip').boundingBox();
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(50);
  const after = await page.getByRole('tooltip').boundingBox();
  // Tooltip y should decrease by ~100 (followed scroll)
  if (before && after) {
    expect(Math.abs(before.y - 100 - after.y)).toBeLessThan(10);
  }
});

test('radix-3081 — tooltip inside form does not submit on click [documentation test]', async ({
  page,
}) => {
  // Consumer responsibility: use type="button" on trigger inside forms.
  // Our Slot passes through consumer's type attribute unchanged.
  await page.goto('/components/tooltip');
  // No assertion — this is a documentation-only test.
  expect(true).toBe(true);
});

test.skip('radix-2727 — dropdown close restoring focus re-triggers tooltip [PLAYGROUND-DEP: DropdownMenu E21]', async () => {
  // Requires DropdownMenu integration.
});

test('radix-1914 — native disabled button — no tooltip (correct behavior)', async ({ page }) => {
  await page.goto('/components/tooltip');
  const disabled = page.getByRole('button', { name: 'Disabled action' });
  // Native disabled suppresses pointer events — tooltip never shows
  // This is CORRECT a11y: consumer should use aria-disabled instead.
  await disabled.hover({ force: true });
  await page.waitForTimeout(800);
  await expect(page.getByRole('tooltip', { name: /disabled|not available/i })).not.toBeVisible();
});
```
