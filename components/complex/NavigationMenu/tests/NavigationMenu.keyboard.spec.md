# NavigationMenu — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`NavigationMenu.keyboard.spec.ts` (CI-gated; status in NavigationMenu.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/navigation-menu` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/

## Tests

```ts
test('NM-R09 — typeahead wrapping: find next match or wrap', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const menubar = page.getByRole('menubar');
  const first = menubar.getByRole('menuitem').first();
  await first.focus();
  // Menubar items: "Home", "About", "Products", "Articles", "Contact"
  await page.keyboard.press('a');
  await expect(menubar.getByRole('menuitem', { name: 'About' })).toBeFocused();
  await page.keyboard.press('a');
  // Wraps — second "a" initial finds "Articles"
  await expect(menubar.getByRole('menuitem', { name: 'Articles' })).toBeFocused();
});

test('NM-R10 — Escape in submenu returns focus to parent menubar item', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const productsTrigger = page.getByRole('menuitem', { name: 'Products' });
  await productsTrigger.click();
  const submenuItem = page.getByRole('menu').getByRole('menuitem').first();
  await submenuItem.focus();
  await page.keyboard.press('Escape');
  // Focus returns to parent trigger, NOT grandparent
  await expect(productsTrigger).toBeFocused();
});

test('NM-R12 — rapid Left/Right arrow bounce does not stutter focus', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const first = page.getByRole('menubar').getByRole('menuitem').first();
  await first.focus();
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
  }
  // After equal Right/Left presses, focus should be back on first item
  await expect(first).toBeFocused();
});

test('NM-R13 — Home/End scope affects active scope only (menubar vs submenu)', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const productsTrigger = page.getByRole('menuitem', { name: 'Products' });
  await productsTrigger.click();
  const submenu = page.getByRole('menu');
  const submenuItems = submenu.getByRole('menuitem');
  await submenuItems.first().focus();
  await page.keyboard.press('End');
  // End inside submenu jumps to last submenu item (NOT last menubar item)
  await expect(submenuItems.last()).toBeFocused();
});
```
