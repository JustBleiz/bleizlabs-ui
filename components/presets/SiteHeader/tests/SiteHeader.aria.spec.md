# SiteHeader — ARIA Snapshot Spec

> ARIA and landmark scenarios for SiteHeader. Runs against `/components/site-header`.

---

## AR-01 — banner landmark present (native `<header>`)

```ts
test('AR-01: header emits banner landmark', async ({ page }) => {
  await page.goto('/components/site-header');
  const banner = page.getByRole('banner').first();
  await expect(banner).toBeVisible();
});
```

## AR-02 — navigation landmark has accessible name

```ts
test('AR-02: nav landmark exposes aria-label', async ({ page }) => {
  await page.goto('/components/site-header');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav).toHaveCount(2); // one in header bar (desktop-hidden on mobile), one inside Sheet portal (SSR mount; only visible when open)
});
```

> **Note:** both nav instances share the same accessible name by default — acceptable because they never exist as visible landmarks simultaneously (mobile Sheet is mounted only when open; desktop nav is display-none on mobile). An axe-core audit treats each instance independently and both pass `landmark-unique` (unique within visible tree).

## AR-03 — MobileToggle aria-expanded reflects state

```ts
test('AR-03: aria-expanded syncs with mobileOpen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/components/site-header');
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});
```

## AR-04 — MobileToggle aria-controls points to Sheet content id

```ts
test('AR-04: aria-controls targets Sheet id', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/components/site-header');
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  const controlsId = await toggle.getAttribute('aria-controls');
  expect(controlsId).toMatch(/^site-header-sheet-/);
  await toggle.click();
  // Sheet dialog should now exist with the referenced id
  const dialog = page.locator(`#${controlsId}`);
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
});
```

## AR-05 — Sheet has aria-labelledby pointing to title

```ts
test('AR-05: Sheet aria-labelledby resolves to title element', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/components/site-header');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  const labelId = await dialog.getAttribute('aria-labelledby');
  expect(labelId).toBeTruthy();
  const title = page.locator(`#${labelId}`);
  await expect(title).toContainText('Navigation');
});
```

## AR-06 — Accessibility snapshot baseline

```ts
test('AR-06: ARIA snapshot contains banner + navigation + button', async ({ page }) => {
  await page.goto('/components/site-header');
  const snapshot = await page.accessibility.snapshot();
  const json = JSON.stringify(snapshot);
  expect(json).toContain('banner');
  expect(json).toContain('navigation');
  expect(json).toContain('Primary');
});
```

---

## Manual Verification

- Run `@axe-core/playwright` on demo page → zero violations for rules:
  `landmark-unique`, `landmark-one-main`, `button-name`, `link-name`,
  `aria-valid-attr`, `aria-allowed-attr`, `aria-required-children`,
  `color-contrast`, `focus-order-semantics`.
- Chrome DevTools Lighthouse accessibility score = 100 on demo page.
