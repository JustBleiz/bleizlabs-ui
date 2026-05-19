# ContextMenu — keyboard interaction spec

**Execution status:** DEFERRED to first consumer adoption.
**Inherits:** Full DropdownMenu keyboard model (ArrowDown/Up cycle, Home/End,
Enter/Space activate, Tab closes, typeahead single+multi-char 500ms).

## Tests

```ts
test('right-click on trigger opens menu with first item focused', async ({ page }) => {
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  await trigger.click({ button: 'right' });
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Escape closes menu and restores focus to pre-open activeElement', async ({ page }) => {
  await page.goto('/components/context-menu');
  // Focus a known element before right-click
  const focusTarget = page.getByRole('button', { name: 'Focus anchor' });
  await focusTarget.focus();
  const trigger = page.getByText('Right-click me').first();
  await trigger.click({ button: 'right' });
  await page.keyboard.press('Escape');
  // Focus should restore to the pre-open anchor, NOT the trigger element
  await expect(focusTarget).toBeFocused();
});

test('ArrowDown cycles with wraparound', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const itemCount = await page.getByRole('menuitem').count();
  for (let i = 0; i < itemCount + 1; i++) {
    await page.keyboard.press('ArrowDown');
  }
  // After cycling past last, should be back at first
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Home jumps to first item, End jumps to last', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Enter activates item and closes menu', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('Tab closes menu without restoring focus to any specific element', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('ArrowDown skips disabled items', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click with disabled').click({ button: 'right' });
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowDown');
    const ariaDisabled = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-disabled'),
    );
    expect(ariaDisabled).not.toBe('true');
  }
});

test('typeahead jumps to matching item', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await page.keyboard.press('d');
  // Should land on an item starting with 'd' (e.g., "Delete", "Duplicate")
  const active = await page.evaluate(() =>
    document.activeElement?.textContent?.toLowerCase().startsWith('d'),
  );
  expect(active).toBe(true);
});
```
