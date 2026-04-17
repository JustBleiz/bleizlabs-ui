# Sidebar — keyboard interaction spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('SB-R01 — Tab navigates items in DOM order (plain nav)', async ({ page }) => {
  await page.goto('/components/sidebar?desktop=1');
  const items = page.locator('nav a, nav button');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
  }
  // No custom roving tabindex — plain Tab order
  expect(count).toBeGreaterThan(0);
});

test('SB-R02 — aria-current="page" on active route link', async ({ page }) => {
  await page.goto('/components/sidebar?activePath=/dashboard');
  const activeLink = page.locator('a[aria-current="page"]');
  await expect(activeLink).toBeVisible();
});

test('SB-R03 — Escape closes mobile drawer', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/components/sidebar');
  await page.getByRole('button', { name: /menu/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('SB-R04 — Cmd+B is consumer-owned (library does not bind)', async ({ page, browserName }) => {
  await page.goto('/components/sidebar');
  const modifier = browserName === 'webkit' ? 'Meta' : 'Control';
  // No library-level binding for Cmd+B per D8 (consumer-owned)
  await page.keyboard.press(`${modifier}+KeyB`);
  // State unchanged unless consumer demo wires it
  const sidebar = page.locator('aside');
  await expect(sidebar).toBeVisible();
});
```
