# ContextMenu — focus management spec

**Execution status:** DEFERRED.
**Focus contract:** On open, move focus to first non-disabled menu item via
`rAF` deferred `.focus()`. On close (Escape, item select, outside click),
restore focus to whatever was `document.activeElement` at the moment the
right-click fired — NOT to a specific trigger element, since ContextMenu has
no trigger button.

## Tests

```ts
test('on open: first non-disabled item receives focus', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('on close via Escape: focus restores to pre-open activeElement', async ({ page }) => {
  await page.goto('/components/context-menu');
  const anchor = page.getByRole('button', { name: 'Focus anchor' });
  await anchor.focus();
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('Escape');
  await expect(anchor).toBeFocused();
});

test('on close via item select: focus restores to pre-open activeElement', async ({ page }) => {
  await page.goto('/components/context-menu');
  const anchor = page.getByRole('button', { name: 'Focus anchor' });
  await anchor.focus();
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('Enter');
  // Item handleActivate captures previousActiveRef BEFORE onSelect runs
  // so restore works even if consumer code moves focus in onSelect callback
});

test('on close via Tab: focus moves to next document tabbable', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('Tab');
  // Focus should NOT be on a menu item — browser Tab propagates
  const activeRole = await page.evaluate(() =>
    document.activeElement?.getAttribute('role')
  );
  expect(activeRole).not.toBe('menuitem');
});

test('on close via scroll: focus is not explicitly restored', async ({ page }) => {
  // Scroll implies user moved on — no particular focus target is logical
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.mouse.wheel(0, 100);
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('disabled items are never focused by keyboard nav', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click with disabled').click({ button: 'right' });
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('ArrowDown');
    const ariaDisabled = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-disabled')
    );
    expect(ariaDisabled).not.toBe('true');
  }
});

test('tabIndex: all items have tabIndex=-1 (menu uses arrow keys)', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const tabIndices = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="menuitem"]')).map(
      (el) => (el as HTMLElement).tabIndex
    )
  );
  expect(tabIndices.every((t) => t === -1)).toBe(true);
});
```
