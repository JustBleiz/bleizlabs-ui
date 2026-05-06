# HoverCard — regression spec (Radix-style closed-issue mapping)

**Execution status:** DEFERRED. 15 regression cases mapped.
~2 marked `test.skip` with `PLAYGROUND-DEP:` rationale (nested HoverCard,
transformed-parent positioning).

## Tests

```ts
test('HC-R01 — hover delay timing respects openDelay prop', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.hover();
  // Default openDelay = 700ms. Content should NOT be visible before delay.
  await page.waitForTimeout(350);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  // After delay, content appears
  await page.waitForTimeout(450);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('HC-R02 — grace area: content pointer enter cancels close timer', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.hover();
  await page.waitForTimeout(750);
  await expect(page.getByRole('dialog')).toBeVisible();
  // Move pointer from trigger toward content — triggers closeDelay timer
  await page.mouse.move(0, 0); // leave trigger
  // Before closeDelay elapses, enter content — timer cancelled
  await page.getByRole('dialog').hover();
  await page.waitForTimeout(500);
  // Content stays visible (close timer cleared by content pointer enter)
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('HC-R06 — visibilitychange hidden closes (tab switch)', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.focus();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Simulate tab change via visibilitychange event
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('HC-R07 — window blur closes (alt-tab)', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.focus();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('HC-R09 — Provider skip-delay window after first open', async ({ page }) => {
  await page.goto('/components/hover-card');
  // Two triggers inside HoverCardProvider with skipDelayDuration=300ms
  const trigger1 = page.getByRole('link', { name: '@acme' });
  const trigger2 = page.getByRole('link', { name: '@beta' });
  await trigger1.hover();
  await page.waitForTimeout(750); // first open waits openDelay
  await expect(page.getByRole('dialog').filter({ hasText: 'Acme' })).toBeVisible();
  // Move to trigger2 within skipDelayDuration — should open INSTANTLY
  await trigger2.hover();
  await page.waitForTimeout(50); // no delay
  await expect(page.getByRole('dialog').filter({ hasText: 'Beta' })).toBeVisible();
});

test('HC-R10 — controlled mode single-fire (onOpenChange called once per transition)', async ({ page }) => {
  await page.goto('/components/hover-card?controlled=1');
  const callsHandle = await page.evaluateHandle(() => {
    (window as any).__onOpenChangeCalls = [];
    return (window as any).__onOpenChangeCalls;
  });
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.hover();
  await page.waitForTimeout(750);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400); // closeDelay
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const calls = await callsHandle.jsonValue();
  // Exactly 2 fires: [true, false] — no duplicates
  expect(calls).toEqual([true, false]);
});

test('HC-R11 — placement flip on viewport overflow', async ({ page }) => {
  await page.goto('/components/hover-card?placement=bottom');
  await page.setViewportSize({ width: 400, height: 200 }); // force bottom overflow
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.hover();
  await page.waitForTimeout(750);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // Collision detection should flip placement bottom → top
  const placement = await dialog.getAttribute('data-placement');
  expect(placement).toMatch(/^top/);
});

test.skip('HC-R14 — nested HoverCard [PLAYGROUND-DEP: nested composition demo]', async () => {
  // Requires playground route with HoverCard inside HoverCard content (e.g.,
  // @acme card contains link to @collaborator triggering second card).
  // Expected: outer grace area respects inner card's pointer enter;
  // closing outer while inner is open does not abandon inner mount.
});

test.skip('HC-R15 — portal positioning under transformed parent [PLAYGROUND-DEP: transform demo]', async () => {
  // Requires playground with trigger inside a `transform: scale()` or
  // `transform: translate()` container. FloatingPortal must position relative
  // to viewport, not transformed parent's coordinate space.
});
```
