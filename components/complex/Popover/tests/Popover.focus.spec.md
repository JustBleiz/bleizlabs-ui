# Popover — focus management spec

**Execution status:** DEFERRED.
**Focus contract:** On open, focus moves INTO content (first tabbable or content
element). On close, focus restores to trigger. Modal mode adds trap.

## Tests

```ts
test('on open: focus moves to first tabbable inside content', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  // First tabbable inside popover receives focus (e.g. a form input)
  const firstInput = page.getByRole('dialog').getByRole('textbox').first();
  await expect(firstInput).toBeFocused();
});

test('on open with initialFocusRef: focus moves to specified element', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Initial focus' });
  await trigger.click();
  const targetButton = page.getByRole('button', { name: 'Targeted' });
  await expect(targetButton).toBeFocused();
});

test('on open with no tabbables: focus moves to content element', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Text-only popover' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeFocused();
});

test('on close: focus restored to trigger', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open' }).first();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('on close with restoreFocusOnClose=false: focus NOT restored', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'No restore' });
  await trigger.click();
  await page.keyboard.press('Escape');
  // activeElement should be body (or default) — not trigger
  const active = await page.evaluate(() => document.activeElement?.tagName);
  expect(active).not.toBe('BUTTON');
});

test('modal mode: background has inert attribute while open', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open modal' });
  await trigger.click();
  // Check that other body children have inert (excluding popover portal host)
  const hasInert = await page.evaluate(() => {
    const candidates = Array.from(document.body.children);
    return candidates.some((el) => el.hasAttribute('inert'));
  });
  expect(hasInert).toBe(true);
});

test('modal mode: inert removed after close', async ({ page }) => {
  await page.goto('/components/popover');
  const trigger = page.getByRole('button', { name: 'Open modal' });
  await trigger.click();
  await page.keyboard.press('Escape');
  const anyInert = await page.evaluate(() =>
    Array.from(document.body.children).some((el) => el.hasAttribute('inert')),
  );
  expect(anyInert).toBe(false);
});

test.skip('on close when trigger unmounted: no error [PLAYGROUND-DEP: dynamic trigger demo]', async () => {
  // Requires a playground where trigger is conditionally rendered and can be
  // removed while popover is open.
});
```
