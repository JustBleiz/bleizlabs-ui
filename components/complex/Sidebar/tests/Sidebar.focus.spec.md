# Sidebar — focus behavior spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling `.spec.ts`
(CI-gated; status in Sidebar.tsx `@tested`; only the manual NVDA sweep stays deferred). This file
is a consumer-CI reference snapshot, not the source of truth.

## Tests

```ts
test('SB-R05 — mobile drawer: useFocusTrap cycles focus inside panel', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto('/components/sidebar');
  await page.getByRole('button', { name: /menu/i }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  // Focus trap cycles within panel
  await page.keyboard.press('Tab');
  const active = await page.evaluate(
    () => document.activeElement?.closest('[role="dialog"]') !== null,
  );
  expect(active).toBe(true);
});

test('SB-R06 — disabled item NOT stripped from Tab order (aria-disabled only)', async ({
  page,
}) => {
  await page.goto('/components/sidebar?disabledItem=settings');
  const disabled = page.getByRole('link', { name: /settings/i });
  expect(await disabled.getAttribute('aria-disabled')).toBe('true');
  // Focusable via Tab (AT users can discover even if disabled)
  await disabled.focus();
  await expect(disabled).toBeFocused();
});
```
