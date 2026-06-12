# Tabs — regression spec (Radix closed-issue mapping)

**Execution status:** DEFERRED. 24 regression cases mapped (TB-R01..R24);
executable canon: sibling `Tabs.regression.spec.ts`. This file covers TB-R01, R05, R07, R09, R10, R11,
R18, R19, R22 (keyboard/focus/aria-specific cases in respective spec files).
TB-R23/R24 (asChild rest-forwarding, E01 audit remediation) are EXECUTED in
`Tabs.regression.spec.ts`, not deferred.

## Tests

```ts
test('TB-R01 — controlled-to-uncontrolled runtime switch is anti-pattern (no crash)', async ({
  page,
}) => {
  await page.goto('/components/tabs?controlled=toggle');
  const toggleButton = page.getByRole('button', { name: 'Toggle controlled' });
  await toggleButton.click();
  // Switching between controlled/uncontrolled mid-flight should not crash
  // (document as anti-pattern; component should handle gracefully)
  await expect(page.getByRole('tablist')).toBeVisible();
});

test('TB-R05 — arrow nav activation is synchronous (no setTimeout desync)', async ({ page }) => {
  await page.goto('/components/tabs');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const tasks = page.getByRole('tab', { name: 'Tasks' });
  await overview.focus();
  await page.keyboard.press('ArrowRight');
  // Immediately after keypress, aria-selected should reflect new state (no async delay)
  expect(await tasks.getAttribute('aria-selected')).toBe('true');
  expect(await overview.getAttribute('aria-selected')).toBe('false');
});

test('TB-R07 — SSR mount: no module-level DOM access, use client boundary correct', async ({
  page,
}) => {
  const response = await page.goto('/components/tabs');
  expect(response?.status()).toBe(200);
  // Server-rendered page includes tablist without hydration errors
  const tablist = page.getByRole('tablist');
  await expect(tablist).toBeVisible();
  // Check for absence of hydration warnings in console
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  await page.reload();
  expect(warnings.filter((w) => w.includes('hydration'))).toHaveLength(0);
});

test('TB-R09 — forceMount + hidden state renders all panels in DOM', async ({ page }) => {
  await page.goto('/components/tabs?forceMount=1');
  // All TabsContent rendered, inactive ones hidden via CSS (data-state="inactive")
  const allPanels = page.locator('[role="tabpanel"]');
  expect(await allPanels.count()).toBeGreaterThanOrEqual(3);
  // Active panel visible, inactive ones hidden via CSS
  const active = page.locator('[role="tabpanel"][data-state="active"]');
  await expect(active).toBeVisible();
});

test('TB-R10 — onValueChange fires once per transition (no double-fire)', async ({ page }) => {
  await page.goto('/components/tabs?trackChanges=1');
  const firesHandle = await page.evaluateHandle(() => {
    (window as any).__valueChangeCalls = [];
    return (window as any).__valueChangeCalls;
  });
  const tasks = page.getByRole('tab', { name: 'Tasks' });
  await tasks.click();
  const calls = await firesHandle.jsonValue();
  // Exactly 1 fire per transition
  expect(calls).toEqual(['tasks']);
});

test('TB-R11 — defaultValue with no matching trigger falls back to first trigger', async ({
  page,
}) => {
  await page.goto('/components/tabs?defaultValue=nonexistent');
  const first = page.getByRole('tab').first();
  // Fallback behavior: first trigger becomes active
  expect(await first.getAttribute('aria-selected')).toBe('true');
});

test('TB-R18 — rapid arrow key presses produce synchronous state updates', async ({ page }) => {
  await page.goto('/components/tabs');
  await page.getByRole('tab').first().focus();
  // Rapid sequential presses
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight'); // wraps to first due to loop=true
  const first = page.getByRole('tab').first();
  expect(await first.getAttribute('aria-selected')).toBe('true');
});

test('TB-R19 — prefers-reduced-motion disables trigger transitions', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/tabs');
  const trigger = page.getByRole('tab').first();
  const transitionProp = await trigger.evaluate((el) => {
    return window.getComputedStyle(el).transition;
  });
  // prefers-reduced-motion: reduce — transition should be 'none' or 'all 0s'
  expect(transitionProp).toMatch(/none|0s/);
});

test.skip('TB-R22 — forceMount + animations use CSS data-[state=inactive]:hidden [PLAYGROUND-DEP]', async () => {
  // Requires playground scenario with CSS transition animations on TabsContent.
  // Expected: inactive panels hidden via [data-state=inactive] attribute; CSS
  // transitions observable between active/inactive states.
});

// TB-R23 — asChild trigger forwards rest props (data-testid/title) without
// breaking activation; TB-R24 — native trigger contrast. EXECUTED in
// Tabs.regression.spec.ts (E01 audit remediation — asChild branch dropped
// {...rest}; native always spread it last).
```
