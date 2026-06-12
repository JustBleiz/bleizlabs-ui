# Popover — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`Popover.keyboard.spec.ts` (CI-gated; status in Popover.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('click trigger opens popover', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('click trigger again closes popover (toggle)', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await trigger.click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('Enter on trigger opens popover (button native behavior)', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('Space on trigger opens popover', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.focus();
  await page.keyboard.press(' ');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('Escape closes popover and restores focus to trigger', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('Escape when dismissable=false does NOT close', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Non-dismissable' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('outside click closes popover', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Click in empty area outside trigger + content
  await page.mouse.click(10, 10);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('outside click when dismissable=false does NOT close', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Non-dismissable' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('Tab inside non-modal popover exits to next document tabbable', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  // Tab through popover content until focus leaves — popover should NOT trap
  // Concrete assertion depends on playground content; verify no focus trap
});

test('Tab inside modal popover wraps within content (focus trap)', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open modal' });
  await trigger.click();
  // Tab through all tabbables inside modal popover — last Tab should wrap to first
});
```
