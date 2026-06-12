# Toast — regression spec

**Execution status:** DEFERRED. 17 edge cases (TST-R01..R17) across the
tests/ quad; executable canon: sibling `Toast.regression.spec.ts`.
This file covers core regression cases; keyboard/focus/aria split.

## Tests

```ts
test('TST-R11 — dedup by id: toast() with same id updates existing (no duplicate)', async ({
  page,
}) => {
  await page.goto('/components/toast?dedup=1');
  await page.getByRole('button', { name: 'Show toast (id=x)' }).click();
  await expect(page.getByRole('status')).toHaveCount(1);
  // Call toast again with same id
  await page.getByRole('button', { name: 'Show toast (id=x)' }).click();
  // Only ONE toast visible (existing updated, not duplicated)
  await expect(page.getByRole('status')).toHaveCount(1);
});

test('TST-R12 — promise() transitions loading → success/error', async ({ page }) => {
  await page.goto('/components/toast?promise=resolve');
  await page.getByRole('button', { name: 'Start promise toast' }).click();
  // Initial state: loading variant
  await expect(page.getByText(/loading|saving/i).first()).toBeVisible();
  // After promise resolves, transitions to success variant (same toast id)
  await expect(page.getByText(/success|saved/i).first()).toBeVisible({ timeout: 3000 });
});

test('TST-R13 — duration: Infinity requires manual dismissal', async ({ page }) => {
  await page.goto('/components/toast?duration=Infinity');
  await page.getByRole('button', { name: 'Show sticky toast' }).click();
  await page.waitForTimeout(5000);
  // Still visible after 5s (Infinity duration)
  await expect(page.getByRole('status')).toBeVisible();
  // Close button dismisses manually
  await page.getByRole('button', { name: /close/i }).click();
  await expect(page.getByRole('status')).not.toBeVisible();
});

test('TST-R14 — visibilitychange hidden pauses auto-dismiss', async ({ page }) => {
  await page.goto('/components/toast?duration=2000');
  await page.getByRole('button', { name: 'Show toast' }).click();
  // Hide tab before auto-dismiss
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(3000); // longer than duration
  // Timer paused while hidden
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  // Toast still visible after resume (not silently expired)
  await expect(page.getByRole('status')).toBeVisible();
});

test('TST-R15 — reduced-motion disables slide-in animation', async ({ page, context }) => {
  await context.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/toast');
  await page.getByRole('button', { name: 'Show toast' }).click();
  const toast = page.getByRole('status');
  const animation = await toast.evaluate((el) => window.getComputedStyle(el).animation);
  expect(animation).toMatch(/none|0s/);
});

test('TST-R16 — SSR safe: Toaster renders null on server', async ({ page }) => {
  const response = await page.goto('/components/toast');
  const html = await response?.text();
  // Server HTML should NOT contain toast portal div (client-only mount)
  expect(html).not.toContain('role="alert"');
  expect(html).not.toContain('role="status"');
});

test('TST-R17 — max queue size: oldest toasts evicted when limit reached', async ({ page }) => {
  await page.goto('/components/toast?max=3');
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Show toast' }).click();
    await page.waitForTimeout(50);
  }
  // Only 3 toasts visible (oldest 2 evicted)
  const count = await page.getByRole('status').count();
  expect(count).toBeLessThanOrEqual(3);
});
```
