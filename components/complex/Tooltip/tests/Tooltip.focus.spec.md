# Tooltip — focus management spec

**Execution status:** DEFERRED to first consumer adoption.
**Focus contract:** Tooltip is MODELESS — trigger retains focus at all times.
Tooltip does NOT own focus, NOT trap focus, NOT move focus into content.

## Tests

```ts
test('trigger retains focus after tooltip shows (modeless contract)', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  // CRITICAL: activeElement must remain the trigger, NOT tooltip content
  await expect(trigger).toBeFocused();
  const activeRole = await page.evaluate(() => document.activeElement?.tagName);
  expect(activeRole).toBe('BUTTON');
});

test('no focus move into tooltip body', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip')).toBeVisible();
  // Tooltip body must not be in the tab order — next Tab leaves trigger
  await page.keyboard.press('Tab');
  const active = await page.evaluate(() => document.activeElement?.getAttribute('role'));
  expect(active).not.toBe('tooltip');
});

test('disabled native button — no tooltip (events do not fire)', async ({ page }) => {
  await page.goto('/components/tooltip');
  // Playground has a disabled button with tooltip wrapping it
  const disabled = page.getByRole('button', { name: 'Disabled action' });
  await disabled.hover({ force: true }); // force past pointer-events: none if present
  await page.waitForTimeout(800);
  await expect(page.getByRole('tooltip', { name: 'Not available' })).not.toBeVisible();
});

test('aria-disabled button — tooltip shows (events fire)', async ({ page }) => {
  await page.goto('/components/tooltip');
  // aria-disabled="true" is NOT the same as native disabled — events still fire
  const ariaDisabled = page.getByRole('button', { name: 'Cannot submit' });
  await ariaDisabled.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test.skip('programmatic focus restore from Dialog does not re-show [PLAYGROUND-DEP: Dialog E15 + #617]', async ({ page }) => {
  // Dialog closes → focus restored to tooltip trigger → tooltip should NOT
  // immediately re-show (Radix #617). Requires nested Dialog + Tooltip.
});

test('tooltip hides on document visibilitychange (Radix #705 / #2665)', async ({ page, context }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip')).toBeVisible();
  // Simulate tab switch via visibilitychange — use dispatchEvent
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});

test('tooltip hides on window blur', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});
```
