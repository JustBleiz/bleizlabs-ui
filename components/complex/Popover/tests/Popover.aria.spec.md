# Popover — ARIA / accessibility tree spec

**Execution status:** DEFERRED.

## Tests

```ts
test('trigger has aria-expanded=false when closed', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  const expanded = await trigger.getAttribute('aria-expanded');
  expect(expanded).toBe('false');
});

test('trigger has aria-expanded=true when open', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  const expanded = await trigger.getAttribute('aria-expanded');
  expect(expanded).toBe('true');
});

test('trigger has aria-haspopup="dialog"', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  const hasPopup = await trigger.getAttribute('aria-haspopup');
  expect(hasPopup).toBe('dialog');
});

test('trigger has aria-controls pointing to content id when open', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  const controls = await trigger.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  const dialogId = await page.getByRole('dialog').getAttribute('id');
  expect(controls).toBe(dialogId);
});

test('content has role="dialog"', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});

test('content has aria-modal="false" in non-modal mode (default)', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  const modal = await page.getByRole('dialog').getAttribute('aria-modal');
  expect(modal).toBe('false');
});

test('content has aria-modal="true" in modal mode', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open modal' });
  await trigger.click();
  const modal = await page.getByRole('dialog').getAttribute('aria-modal');
  expect(modal).toBe('true');
});

test('content has aria-labelledby when title provided', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'With title' });
  await trigger.click();
  const labelledBy = await page.getByRole('dialog').getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();
  // Verify the id points to a real heading in the document
  const heading = await page.locator(`#${labelledBy}`).textContent();
  expect(heading).toBeTruthy();
});

test('content has aria-describedby when description provided', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'With description' });
  await trigger.click();
  const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
});

test('content NOT aria-labelledby when no title', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Text-only popover' });
  await trigger.click();
  const labelledBy = await page.getByRole('dialog').getAttribute('aria-labelledby');
  expect(labelledBy).toBeNull();
});

test('unique id per instance (no collision)', async ({ page }) => {
  await page.goto('/components/popover');
  // Open two different popovers, compare their ids
  const first = page.getByRole('button', { name: 'Open' }).first();
  await first.click();
  const firstId = await page.getByRole('dialog').getAttribute('id');
  await page.keyboard.press('Escape');
  const second = page.getByRole('button', { name: 'With title' });
  await second.click();
  const secondId = await page.getByRole('dialog').getAttribute('id');
  expect(firstId).not.toBe(secondId);
});

test.skip('axe-core zero violations [DEFERRED — axe-core runner]', async () => {
  // Requires @axe-core/playwright integration
});

test.skip('NVDA announcement order [MANUAL — deferred]', async () => {
  // Manual: click trigger → NVDA announces dialog role + title + description
});
```
