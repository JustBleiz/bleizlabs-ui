# DropdownMenu — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`DropdownMenu.keyboard.spec.ts` (CI-gated; status in DropdownMenu.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('Enter on trigger opens menu with first item focused', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Space on trigger opens menu with first item focused', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.focus();
  await page.keyboard.press(' ');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('ArrowDown on trigger opens menu with first item focused', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('ArrowUp on trigger opens menu with LAST item focused', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem').last()).toBeFocused();
});

test('ArrowDown cycles through items with wraparound', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.keyboard.press('ArrowDown'); // to second
  await page.keyboard.press('ArrowDown'); // to third
  await page.keyboard.press('ArrowDown'); // to fourth
  await page.keyboard.press('ArrowDown'); // wraps to first
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('ArrowUp at first item wraps to last', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  // First item is focused by default on click-open
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menuitem').last()).toBeFocused();
});

test('Home jumps to first item, End jumps to last', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Escape closes menu and restores focus to trigger', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('Enter on item fires onSelect and closes menu', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).not.toBeVisible();
});

test('Tab closes menu without restoring focus to trigger', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  const trigger = page.getByRole('button', { name: 'Actions' });
  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('menu')).not.toBeVisible();
  // Focus should move to next tabbable, NOT back to trigger
  await expect(trigger).not.toBeFocused();
});

test('ArrowDown skips disabled items', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'File' }).click();
  // Navigate through items — disabled "Save as... (coming soon)" should be skipped
  // Verify focus never lands on an item with aria-disabled="true"
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowDown');
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-disabled'),
    );
    expect(focused).not.toBe('true');
  }
});

test('Typeahead single char jumps to matching item', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Format' }).click();
  await page.keyboard.press('b');
  await expect(page.getByRole('menuitem', { name: 'Bold' })).toBeFocused();
});

test('Typeahead multi-char buffer matches sequence', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Format' }).click();
  await page.keyboard.type('bu', { delay: 100 }); // < 500ms gap
  await expect(page.getByRole('menuitem', { name: 'Bullet list' })).toBeFocused();
});

test('Typeahead buffer resets after 500ms', async ({ page }) => {
  await page.goto('/components/dropdown-menu');
  await page.getByRole('button', { name: 'Format' }).click();
  await page.keyboard.press('b');
  await page.waitForTimeout(600);
  await page.keyboard.press('c');
  // Should land on an item starting with "c" (not "bc")
  await expect(page.getByRole('menuitem', { name: /^c/i })).toBeFocused();
});

test.skip('Submenu navigation [PLAYGROUND-DEP: DropdownMenuSub not in E21 scope]', async () => {
  // Submenu (DropdownMenuSub + DropdownMenuSubTrigger + DropdownMenuSubContent) deferred
  // ArrowRight should open submenu, ArrowLeft should close it
});
```
