# Sidebar — regression spec (24 cases SB-R01..R24)

**Execution status:** DEFERRED. `docs/specs/sidebar-spec.md`.

## Tests

```ts
test('SB-R11 — breakpoint: desktop <aside> visible, mobile <dialog> hidden by default', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/components/sidebar');
  await expect(page.locator('aside')).toBeVisible();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('SB-R12 — cookie persistence: SSR-friendly, no flash', async ({ page, context }) => {
  await context.addCookies([{ name: 'sidebar-collapsed', value: 'true', url: 'http://localhost:3000' }]);
  await page.goto('/components/sidebar');
  // Initial render respects cookie — no collapsed→expanded flash
  const sidebar = page.locator('aside');
  expect(await sidebar.getAttribute('data-state')).toBe('collapsed');
});

test('SB-R13 — responsive: window resize switches desktop↔mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/components/sidebar');
  await expect(page.locator('aside')).toBeVisible();
  // Shrink to mobile
  await page.setViewportSize({ width: 400, height: 800 });
  // Aside hidden, trigger visible
  await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
});

test('SB-R14 — mobile drawer: backdrop click dismisses', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/components/sidebar');
  await page.getByRole('button', { name: /menu/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Click backdrop
  await page.mouse.click(10, 400);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('SB-R15 — SidebarSeparator role="separator"', async ({ page }) => {
  await page.goto('/components/sidebar');
  const separator = page.locator('[role="separator"]');
  await expect(separator.first()).toBeVisible();
});

test('SB-R16 — SidebarItem asChild renders as Next.js Link', async ({ page }) => {
  await page.goto('/components/sidebar?asChild=1');
  // asChild should preserve <a href> semantics + aria attributes
  const link = page.locator('a[data-sidebar-item]').first();
  await expect(link).toBeVisible();
});

test.skip('SB-R17 — nested SidebarGroup [PLAYGROUND-DEP: nested groups demo]', async () => {
  // Flat groups in v1.0. Nested groups deferred.
});
```
