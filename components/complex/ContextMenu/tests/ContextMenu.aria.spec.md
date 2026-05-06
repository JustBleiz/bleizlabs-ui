# ContextMenu — ARIA / accessibility tree spec

**Execution status:** DEFERRED.
**Key distinction from DropdownMenu:** Trigger is NOT a widget — no
`aria-haspopup`, `aria-expanded`, or `aria-controls` on the wrapper element.
The trigger is just a right-click zone wrapping arbitrary children.

## Tests

```ts
test('content has role="menu"', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  await expect(page.locator('[role="menu"]')).toBeVisible();
});

test('content does NOT have aria-modal attribute', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const ariaModal = await page.getByRole('menu').getAttribute('aria-modal');
  expect(ariaModal).toBeNull();
});

test('items have role="menuitem"', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const items = await page.locator('[role="menuitem"]').count();
  expect(items).toBeGreaterThan(0);
});

test('disabled item has aria-disabled="true" and data-disabled attribute', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click with disabled').click({ button: 'right' });
  const disabled = page.getByRole('menuitem', { name: /disabled/i }).first();
  expect(await disabled.getAttribute('aria-disabled')).toBe('true');
  const dataDisabled = await disabled.getAttribute('data-disabled');
  expect(dataDisabled).not.toBeNull();
});

test('separator has role="separator" with horizontal orientation', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click me').first().click({ button: 'right' });
  const separator = page.getByRole('separator').first();
  await expect(separator).toBeVisible();
  expect(await separator.getAttribute('aria-orientation')).toBe('horizontal');
});

test('group has role="group" with aria-labelledby pointing to label', async ({ page }) => {
  await page.goto('/components/context-menu');
  await page.getByText('Right-click with groups').click({ button: 'right' });
  const group = page.getByRole('group').first();
  const labelledBy = await group.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();
  const labelText = await page.locator(`#${labelledBy}`).textContent();
  expect(labelText).toBeTruthy();
});

test('trigger wrapper does NOT have aria-haspopup', async ({ page }) => {
  // The trigger is not a widget — wrapper has no ARIA state
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  const hasPopup = await trigger.getAttribute('aria-haspopup');
  expect(hasPopup).toBeNull();
});

test('trigger wrapper does NOT have aria-expanded', async ({ page }) => {
  await page.goto('/components/context-menu');
  const trigger = page.getByText('Right-click me').first();
  const expanded = await trigger.getAttribute('aria-expanded');
  expect(expanded).toBeNull();
});

test('unique content id per instance', async ({ page }) => {
  await page.goto('/components/context-menu');
  const first = page.getByText('Right-click me').first();
  await first.click({ button: 'right' });
  const firstId = await page.getByRole('menu').getAttribute('id');
  await page.keyboard.press('Escape');
  const second = page.getByText('Right-click with disabled');
  await second.click({ button: 'right' });
  const secondId = await page.getByRole('menu').getAttribute('id');
  expect(firstId).not.toBe(secondId);
});

test('data-placement reflects actual flip result', async ({ page }) => {
  // Right-click near bottom of viewport — menu should flip to top-start
  await page.goto('/components/context-menu');
  const bottomTrigger = page.getByText('Right-click near bottom');
  await bottomTrigger.click({ button: 'right' });
  const placement = await page.getByRole('menu').getAttribute('data-placement');
  // Default is bottom-start; after flip should be top-start (or top*)
  expect(placement).toMatch(/^(bottom|top)/);
});
```
