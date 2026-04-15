# Tooltip — keyboard interaction spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code — bypasses ESLint/tsconfig.

## Setup

- Page: `/components/tooltip` playground
- Default trigger: `<Button>Save</Button>` with Tooltip `content="Save file (Ctrl+S)"`
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/

## Tests

```ts
test('show on focus — keyboard parity with hover (SC 1.4.13)', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab'); // focus first trigger
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('hide on blur', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab'); // focus trigger
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Tab'); // focus next element
  await expect(page.getByRole('tooltip')).not.toBeVisible();
});

test('Escape hides without losing focus (SC 1.4.13 dismissable)', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).not.toBeVisible();
  // CRITICAL: focus must remain on the trigger after Escape
  await expect(trigger).toBeFocused();
});

test.skip('Escape scoped to tooltip, not parent modal [PLAYGROUND-DEP: Dialog E15]', async ({ page }) => {
  // Requires Dialog + Tooltip nested playground — Escape inside tooltip should
  // hide tooltip only, NOT close the enclosing Dialog. Unskip when scenario lands.
});

test('hover shows after delayDuration', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.hover();
  // Tooltip should NOT be visible at t=0
  await expect(page.getByRole('tooltip')).not.toBeVisible();
  // Default delayDuration is 700ms — wait 750ms for open
  await page.waitForTimeout(750);
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test.skip('hover group instant after first open [PLAYGROUND-DEP: TooltipProvider multi-instance demo]', async ({ page }) => {
  // Open tooltip A → move directly to trigger B → B opens without delay
  // Requires TooltipProvider demo with ≥2 tooltips.
});

test('hover persists when pointer enters tooltip content (SC 1.4.13 hoverable)', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.hover();
  await page.waitForTimeout(750);
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  // Move pointer from trigger into tooltip body
  await tooltip.hover();
  // Tooltip must remain visible while pointer is over it
  await page.waitForTimeout(200);
  await expect(tooltip).toBeVisible();
});

test('click does not close tooltip [Radix #1077 / #2029]', async ({ page }) => {
  await page.goto('/components/tooltip');
  const trigger = page.getByRole('button', { name: 'Save' });
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  // Keyboard activation via Enter
  await page.keyboard.press('Enter');
  // Tooltip should stay visible — click/Enter does NOT dismiss it
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('Tab navigation not interrupted', async ({ page }) => {
  await page.goto('/components/tooltip');
  await page.keyboard.press('Tab');
  const firstTooltip = page.getByRole('tooltip');
  await expect(firstTooltip).toBeVisible();
  await page.keyboard.press('Tab');
  // Focus advances to next element; tooltip on previous trigger hides
  await expect(firstTooltip).not.toBeVisible();
});
```
