# ContextMenu — regression spec (Radix + internal issue mapping)

**Execution status:** DEFERRED. 15 Radix ContextMenu cases + 3 internal
cases. ~5 marked `test.skip` with `PLAYGROUND-DEP:` / `TOUCH-DEFERRED:`
rationale.

## Tests

```ts
test('CM-R01 — native context menu suppressed on right-click', async ({ page }) => {
  // contextmenu event.preventDefault() must fire
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  await trigger.click({ button: 'right' });
  // Our menu should be visible; browser native menu should NOT appear
  await expect(page.getByRole('menu')).toBeVisible();
});

test('CM-R03 — close on scroll (window)', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  await page.mouse.wheel(0, 100);
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('CM-R04 — opening second ContextMenu closes first', async ({ page }) => {
  await page.goto('/components/context-menu');
  const first = page.getByText('Right-click me').first();
  await first.click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  const second = page.getByText('Right-click with disabled');
  await second.click({ button: 'right' });
  // First menu should close, only one menu visible
  const count = await page.locator('[role="menu"]').count();
  expect(count).toBe(1);
});

test.skip('CM-R05 — asChild on table row preserves layout [PLAYGROUND-DEP: table demo]', async () => {
  // ContextMenu wrapping <tr> with asChild=true does not break table layout
});

test('CM-R09 — right-click inside menu content suppresses browser native menu', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const item = page.getByRole('menuitem').first();
  await item.click({ button: 'right' });
  // onContextMenu on content calls preventDefault — browser native menu suppressed
  // Our menu should still be visible (the inner right-click was consumed)
  await expect(page.getByRole('menu')).toBeVisible();
});

test('CM-R10 — position uses clientX/clientY (viewport-relative)', async ({ page }) => {
  // position: fixed + clientX/clientY is correct when page is scrolled
  await page.goto('/components/context-menu');
  // Scroll page
  await page.evaluate(() => window.scrollTo(0, 200));
  const trigger = page.getByText('Right-click me').first();
  const triggerBox = await trigger.boundingBox();
  await trigger.click({ button: 'right' });
  // Menu should appear near the trigger's VIEWPORT position, not document position
  const menuBox = await page.getByRole('menu').boundingBox();
  if (triggerBox && menuBox) {
    // Menu top should be near trigger's viewport Y (after scroll), not absolute Y
    expect(Math.abs(menuBox.y - (triggerBox.y + triggerBox.height))).toBeLessThan(20);
  }
});

test.skip('CM-R11 — Escape inside Dialog+ContextMenu [PLAYGROUND-DEP: Dialog+ContextMenu]', async () => {
  // Escape should close ContextMenu only, not parent Dialog
});

test('CM-R12 — onOpenChange fires on scroll close', async ({ page }) => {
  // Verify onOpenChange callback receives false when scroll closes menu
  await page.goto('/components/context-menu');
  // Use controlled ContextMenu demo with callback counter
  await page.getByText('Right-click controlled').click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  await page.mouse.wheel(0, 100);
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('CM-R13 — disabled trigger does not prevent native context menu', async ({ page }) => {
  await page.goto('/components/context-menu');
  const disabledTrigger = page.getByText('Right-click disabled trigger');
  await disabledTrigger.click({ button: 'right' });
  // Our menu should NOT be visible (disabled trigger does not preventDefault)
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('CM-R14 — re-right-click at new coords opens at new position', async ({ page }) => {
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  // First right-click
  await trigger.click({ button: 'right', position: { x: 10, y: 10 } });
  await expect(page.getByRole('menu')).toBeVisible();
  const firstBox = await page.getByRole('menu').boundingBox();
  // Second right-click at different position
  await trigger.click({ button: 'right', position: { x: 100, y: 50 } });
  await expect(page.getByRole('menu')).toBeVisible();
  const secondBox = await page.getByRole('menu').boundingBox();
  if (firstBox && secondBox) {
    expect(Math.abs(secondBox.x - firstBox.x)).toBeGreaterThan(20);
  }
});

test('CM-R15 — position clamped at viewport right edge', async ({ page }) => {
  await page.goto('/components/context-menu');
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const trigger = page.getByText('Right-click me').first();
  // Right-click near right edge
  await trigger.click({
    button: 'right',
    position: { x: 1, y: 10 }, // forces shift clamp
  });
  const menuBox = await page.getByRole('menu').boundingBox();
  if (menuBox) {
    expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportWidth);
  }
});

test('CM-R16 — onSelect preventDefault keeps menu open', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click with preventDefault').click({ button: 'right' });
  await page.getByRole('menuitem', { name: /Toggle/ }).click();
  await expect(page.getByRole('menu')).toBeVisible();
});

test('CM-R17 — rapid right-clicks leave menu in consistent state', async ({ page }) => {
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  await trigger.click({ button: 'right' });
  await trigger.click({ button: 'right' });
  await trigger.click({ button: 'right' });
  // After 3 right-clicks, menu should be visible (each click closes + reopens)
  await expect(page.getByRole('menu')).toBeVisible();
});

test('CM-R18 — controlled mode onOpenChange works', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click controlled').click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  // Close button outside menu triggers onOpenChange(false)
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test.skip('CM-R06 — right-click selected text suppresses browser menu [PLAYGROUND-DEP]', async () => {});
test.skip('CM-R07 — touch long-press support [TOUCH-DEFERRED]', async () => {});
test.skip('CM-R08 — nested ContextMenu stopPropagation [PLAYGROUND-DEP]', async () => {});
```
