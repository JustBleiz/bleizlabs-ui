# Sidebar — ARIA semantics spec

**Execution status:** DEFERRED per E15 scope.

## Tests

```ts
test('SB-R07 — desktop: <aside> + <nav aria-label>', async ({ page }) => {
  await page.goto('/components/sidebar?desktop=1');
  const aside = page.locator('aside');
  const nav = aside.locator('nav');
  expect(await nav.getAttribute('aria-label')).toBeTruthy();
});

test('SB-R08 — mobile drawer: role="dialog" + aria-modal="true"', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/components/sidebar');
  await page.getByRole('button', { name: /menu/i }).click();
  const dialog = page.getByRole('dialog');
  expect(await dialog.getAttribute('aria-modal')).toBe('true');
});

test('SB-R09 — SidebarTrigger aria-expanded + aria-controls wiring', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/components/sidebar');
  const trigger = page.getByRole('button', { name: /menu/i });
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  expect(await trigger.getAttribute('aria-controls')).toBeTruthy();
  await trigger.click();
  expect(await trigger.getAttribute('aria-expanded')).toBe('true');
});

test('SB-R10 — SidebarGroup disclosure: aria-expanded on trigger', async ({ page }) => {
  await page.goto('/components/sidebar?groupDisclosure=1');
  const groupTrigger = page.getByRole('button', { name: /projects/i });
  expect(await groupTrigger.getAttribute('aria-expanded')).toBe('false');
  await groupTrigger.click();
  expect(await groupTrigger.getAttribute('aria-expanded')).toBe('true');
});
```
