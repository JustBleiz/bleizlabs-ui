# Select — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/select` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (combobox-select-only)

## Tests

```ts
test('SL-R17 — form submit without value shows required validation when required', async ({ page }) => {
  await page.goto('/components/select?required=1');
  const form = page.locator('form');
  // Hidden input sync — empty value + required triggers native HTML5 validation
  const submitBtn = page.getByRole('button', { name: 'Submit' });
  await submitBtn.click();
  // Form should not submit (required validation blocks)
  const validationMessage = await page.evaluate(() => {
    const input = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    return input?.validationMessage;
  });
  expect(validationMessage).toBeTruthy();
});

test('SL-R18 — placeholder styling distinct from selected value (data-placeholder)', async ({ page }) => {
  await page.goto('/components/select?placeholder=Select%20option');
  const value = page.locator('[data-placeholder]');
  await expect(value).toBeVisible();
  // data-placeholder attribute present when no value — allows CSS target
  const color = await value.evaluate((el) => window.getComputedStyle(el).color);
  // Placeholder typically muted color, distinct from --color-text-primary
  expect(color).toBeTruthy();
});

test('SL-R20 — RTL direction: arrow semantics reversed on horizontal axis only', async ({ page }) => {
  await page.goto('/components/select?dir=rtl');
  const trigger = page.getByRole('combobox');
  await trigger.click();
  // Vertical arrow navigation (Up/Down) unaffected by RTL
  await page.keyboard.press('ArrowDown');
  const listbox = page.getByRole('listbox');
  expect(await listbox.getAttribute('aria-activedescendant')).toBeTruthy();
});

test('SL-R21 — mobile touch: custom portal listbox (not native <select>)', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/select');
  const trigger = mobilePage.getByRole('combobox');
  await trigger.tap();
  // Custom listbox (NOT native <select> picker) opens
  await expect(mobilePage.getByRole('listbox')).toBeVisible();
  // Touch tap on option selects it
  await mobilePage.getByRole('option').first().tap();
  await expect(mobilePage.getByRole('listbox')).not.toBeVisible();
  await ctx.close();
});
```
