# Tabs — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/tabs` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

## Tests

```ts
test('TB-R02 — wrapped TabsTrigger via Tooltip preserves focus', async ({ page }) => {
  await page.goto('/components/tabs?wrapped=tooltip');
  const wrappedTrigger = page.getByRole('tab', { name: 'Overview' });
  await wrappedTrigger.focus();
  expect(await wrappedTrigger.evaluate((el) => el === document.activeElement)).toBe(true);
  // forwardRef requirement confirmed — wrapped trigger focusable via Slot pattern
});

test('TB-R15 — tabpanel has tabindex=0 for natural Tab order', async ({ page }) => {
  await page.goto('/components/tabs');
  const panel = page.getByRole('tabpanel');
  const tabindex = await panel.getAttribute('tabindex');
  expect(tabindex).toBe('0');
  // Tab from active trigger lands on panel (composite widget contract)
  const overview = page.getByRole('tab', { name: 'Overview' });
  await overview.focus();
  await page.keyboard.press('Tab');
  expect(await panel.evaluate((el) => el === document.activeElement)).toBe(true);
});

test('TB-R17 — nested Tabs in Dialog: inner roving tabindex independent', async ({ page }) => {
  await page.goto('/components/tabs?nested=dialog');
  const dialogTrigger = page.getByRole('button', { name: 'Open Dialog' });
  await dialogTrigger.click();
  // Tabs outside Dialog unaffected; Tabs inside Dialog have own roving tabindex
  const innerTab = page.getByRole('dialog').getByRole('tab').first();
  await innerTab.focus();
  await page.keyboard.press('ArrowRight');
  const innerTab2 = page.getByRole('dialog').getByRole('tab').nth(1);
  expect(await innerTab2.getAttribute('aria-selected')).toBe('true');
});

test('TB-R21 — asChild Slot merges role + aria-* attributes onto custom element', async ({
  page,
}) => {
  await page.goto('/components/tabs?asChild=1');
  // Playground uses <TabsTrigger asChild><CustomButton>...</CustomButton></TabsTrigger>
  const custom = page.locator('[data-custom-button]').first();
  expect(await custom.getAttribute('role')).toBe('tab');
  expect(await custom.getAttribute('aria-selected')).toBeDefined();
  expect(await custom.getAttribute('aria-controls')).toBeTruthy();
});
```
