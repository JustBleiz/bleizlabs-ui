# NavigationMenu — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/navigation-menu` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/

## Tests

```ts
test('NM-R11 — click on disabled item: no focus steal, no state change', async ({ page }) => {
  await page.goto('/components/navigation-menu?disabled=about');
  const disabled = page.getByRole('menuitem', { name: 'About' });
  const firstEnabled = page.getByRole('menuitem', { name: 'Home' });
  await firstEnabled.focus();
  await disabled.click({ force: true });
  // Disabled item (aria-disabled="true") does not steal focus
  await expect(firstEnabled).toBeFocused();
  expect(await disabled.getAttribute('aria-disabled')).toBe('true');
});

test('NM-R16 — focus on trigger opens instantly (WCAG SC 2.1.1 keyboard parity)', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  await trigger.focus();
  // Focus path bypasses openDelay — content appears immediately
  await expect(page.getByRole('menu')).toBeVisible();
});

test('NM-R17 — blur with relatedTarget in content keeps open', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  await trigger.focus();
  await expect(page.getByRole('menu')).toBeVisible();
  // Tab from trigger INTO submenu content (relatedTarget is inside menu)
  await page.keyboard.press('Tab');
  await expect(page.getByRole('menu')).toBeVisible();
  const firstSubItem = page.getByRole('menu').getByRole('menuitem').first();
  await expect(firstSubItem).toBeFocused();
});
```
