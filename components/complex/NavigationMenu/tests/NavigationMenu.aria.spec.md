# NavigationMenu — ARIA semantics spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`NavigationMenu.aria.spec.ts` (CI-gated; status in NavigationMenu.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/navigation-menu` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/

## Tests

```ts
test('NM-R03 — data-state/data-motion attributes on Trigger + Content', async ({ page }) => {
  await page.goto('/components/navigation-menu');
  const trigger = page.getByRole('menuitem', { name: 'Products' });
  expect(await trigger.getAttribute('data-state')).toBe('closed');
  await trigger.click();
  expect(await trigger.getAttribute('data-state')).toBe('open');
  const content = page.getByRole('menu');
  expect(await content.getAttribute('data-state')).toBe('open');
  // data-motion available for animation hooks
  const motion = await content.getAttribute('data-motion');
  expect(motion).toMatch(/from-|to-/);
});

test('NM-R19 — coarse pointer (touch) skips hover triggers', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/navigation-menu');
  const trigger = mobilePage.getByRole('menuitem', { name: 'Products' });
  await trigger.dispatchEvent('pointerover', { pointerType: 'touch' });
  // Hover suppressed on coarse pointer — submenu should NOT open via pointer
  await expect(mobilePage.getByRole('menu')).not.toBeVisible();
  await ctx.close();
});
```
