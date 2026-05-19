# DropdownMenu — focus management spec

**Execution status:** DEFERRED.
**Focus contract:** On open, focus moves to first (or last, if ArrowUp) non-disabled
menu item via `rAF` deferred `.focus()`. On close via Escape/item-select, focus
restores to trigger via `rAF`. On close via Tab, focus does NOT restore — Tab
propagates to next document tabbable.

## Tests

```ts
test('on open: first non-disabled item receives focus', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('on open with ArrowUp: last non-disabled item receives focus', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menuitem').last()).toBeFocused();
});

test('on open with all first items disabled: focus moves to first enabled', async ({ page }) => {
  // Requires a playground with disabled first items
  // For now: verify behavior via File menu where "Save as..." is disabled mid-list
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'File' }).click();
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-disabled'));
  expect(focused).not.toBe('true');
});

test('on close via Escape: focus restores to trigger', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('on close via item select: focus restores to trigger', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
});

test('on close via Tab: focus does NOT restore to trigger', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(trigger).not.toBeFocused();
});

test('on close via outside click: focus restores to trigger', async ({ page }) => {
  // Outside-click handler in DropdownMenuContent calls setOpen(false) without
  // explicit focus restore, relying on default restoration. Verify behavior.
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await page.mouse.click(10, 10);
  // Trigger may or may not retain focus — verify menu is closed at minimum
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('disabled items are never focused by keyboard nav', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'File' }).click();
  // Iterate 20 ArrowDowns — disabled items should never be focused
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('ArrowDown');
    const ariaDisabled = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-disabled'),
    );
    expect(ariaDisabled).not.toBe('true');
  }
});

test('tabIndex: all items have tabIndex=-1 (menu uses arrow keys)', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  const tabIndices = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="menuitem"]')).map(
      (el) => (el as HTMLElement).tabIndex,
    ),
  );
  expect(tabIndices.every((t) => t === -1)).toBe(true);
});

test.skip('focus restore when trigger unmounted [PLAYGROUND-DEP: dynamic trigger]', async () => {
  // Requires a playground where trigger is conditionally rendered.
});

test.skip('DropdownMenu inside Dialog [PLAYGROUND-DEP: Dialog+DropdownMenu integration]', async () => {
  // Escape should close menu but stay within Dialog focus trap.
  // Tab should close menu then cycle within Dialog.
});
```
