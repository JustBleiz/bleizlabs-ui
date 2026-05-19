# NavigationMenu — regression spec (Radix closed-issue mapping)

**Execution status:** DEFERRED. 22 regression cases mapped (NM-R01..R22) from
`docs/specs/navigation-menu-spec.md`. This file covers NM-R01, R02, R04, R05,
R06, R07, R08, R14, R15, R18, R20, R21, R22 (keyboard/focus/aria-specific cases
in respective spec files).

## Tests

```ts
test('NM-R01 — Content rendered via Portal (outside normal flow)', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  await page.getByRole('menuitem', { name: 'Products' }).click();
  const menu = page.getByRole('menu');
  // Portal render — menu is direct child of <body>, not inside menubar
  const parentTag = await menu.evaluate((el) => el.parentElement?.tagName);
  expect(parentTag).toBe('BODY');
});

test('NM-R02 — hoverTrigger prop enables click-only mode', async ({ page }) => {
  await page.goto('/components/navigation-menu?hover=false');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  await trigger.hover();
  await page.waitForTimeout(300);
  // hoverTrigger=false: hover does NOT open submenu
  await expect(page.getByRole('menu')).not.toBeVisible();
  await trigger.click();
  await expect(page.getByRole('menu')).toBeVisible();
});

test.skip('NM-R04 / NM-R05 — disableOutsidePointerEvents unsupported (documented default) [Radix removed]', async () => {
  // disableOutsidePointerEvents is intentionally NOT supported in bleizlabs-ui.
  // Default: clicks outside close menu via useFloatingDismiss. Consumers wanting
  // inert pointer events outside should use Dialog pattern instead.
});

test('NM-R06 — Viewport allows children (no TS regression)', async ({ page }) => {
  await page.goto('/components/navigation-menu?viewport=1');
  // Viewport wraps Content; children pass through
  await page.getByRole('menuitem', { name: 'Products' }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  // Children content visible
  await expect(menu.getByRole('menuitem').first()).toBeVisible();
});

test('NM-R07 — forceMount does not break Escape for native dialog inside submenu', async ({
  page,
}) => {
  await page.goto('/components/navigation-menu?forceMount=1&dialog=1');
  // Trigger submenu with embedded native <dialog>
  await page.getByRole('menuitem', { name: 'Products' }).click();
  const nativeDialog = page.locator('dialog');
  await nativeDialog.evaluate((el: HTMLDialogElement) => el.showModal());
  await page.keyboard.press('Escape');
  // Escape closes native dialog first (event.preventDefault coordination)
  expect(await nativeDialog.evaluate((el: HTMLDialogElement) => el.open)).toBe(false);
  // Submenu still open after first Escape
  await expect(page.getByRole('menu')).toBeVisible();
});

test('NM-R08 — onOpenChange fires per-submenu (Item-level callback)', async ({ page }) => {
  await page.goto('/components/navigation-menu?trackOpen=1');
  const callsHandle = await page.evaluateHandle(() => {
    (window as any).__onOpenChangeCalls = [];
    return (window as any).__onOpenChangeCalls;
  });
  const productsTrigger = page.getByRole('menuitem', { name: 'Products' });
  await productsTrigger.click();
  await productsTrigger.click(); // close
  const calls = await callsHandle.jsonValue();
  // Per-submenu callback: [['products', true], ['products', false]]
  expect(calls.length).toBe(2);
});

test('NM-R14 — hover delay exact 200ms (cancel if pointer leaves early)', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  await trigger.hover();
  await page.waitForTimeout(150);
  // Before 200ms delay elapses, leave pointer
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  // Menu should NOT have opened (delay cancelled)
  await expect(page.getByRole('menu')).not.toBeVisible();
  // Hover again and wait full delay
  await trigger.hover();
  await page.waitForTimeout(250);
  await expect(page.getByRole('menu')).toBeVisible();
});

test('NM-R15 — grace area: pointer travel trigger→content keeps open', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  await trigger.hover();
  await page.waitForTimeout(250);
  await expect(page.getByRole('menu')).toBeVisible();
  // Move pointer off trigger — closeDelay armed
  await page.mouse.move(0, 0);
  // Enter content before closeDelay elapses
  await page.getByRole('menu').hover();
  await page.waitForTimeout(500);
  // Menu stays open
  await expect(page.getByRole('menu')).toBeVisible();
});

test('NM-R18 — Provider skip-delay window: reopen within 300ms is instant', async ({ page }) => {
  await page.goto('/components/navigation-menu?provider=1');
  const products = page.getByRole('menuitem', { name: 'Products' });
  const articles = page.getByRole('menuitem', { name: 'Articles' });
  await products.hover();
  await page.waitForTimeout(250);
  await expect(page.getByRole('menu').filter({ hasText: 'Laptops' })).toBeVisible();
  // Switch to sibling trigger within skipDelayDuration
  await articles.hover();
  await page.waitForTimeout(50); // no 200ms wait
  // Articles submenu opens instantly (skip-delay active)
  await expect(page.getByRole('menu').filter({ hasText: 'Posts' })).toBeVisible();
});

test('NM-R20 — visibilitychange (tab hidden) closes menu', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  await page.getByRole('menuitem', { name: 'Products' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('NM-R21 — window blur closes menu', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  await page.getByRole('menuitem', { name: 'Products' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('NM-R22 — controlled mode: onValueChange fires once per transition', async ({ page }) => {
  await page.goto('/components/navigation-menu?controlled=1');
  const callsHandle = await page.evaluateHandle(() => {
    (window as any).__valueChangeCalls = [];
    return (window as any).__valueChangeCalls;
  });
  await page.getByRole('menuitem', { name: 'Products' }).click();
  await page.getByRole('menuitem', { name: 'Articles' }).click();
  const calls = await callsHandle.jsonValue();
  // Batched React updates produce exactly one fire per open transition
  expect(calls).toEqual(['products', 'articles']);
});
```
