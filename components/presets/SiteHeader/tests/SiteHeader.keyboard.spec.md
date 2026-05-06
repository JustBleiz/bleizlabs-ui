# SiteHeader — Keyboard Interaction Spec

> Playwright-executable scenarios for SiteHeader keyboard handling. Format mirrors
> Sidebar E38 `.spec.md` convention — scenarios with copy-paste `@playwright/test`
> snippets. Each test is independent and targets the demo page at
> `/components/site-header`.

---

## Setup

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components/site-header');
});
```

---

## KB-01 — Desktop Tab order reaches Brand → Nav items → Actions

**Given** desktop viewport (≥768px) and focus on `<body>`
**When** user presses `Tab` repeatedly
**Then** focus lands in order on: first brand-link (if any), each nav link in DOM order, each action button in DOM order
**Expected:** MobileToggle is NOT in desktop Tab order (hidden via `display: none` from `bp-md`).

```ts
test('KB-01: desktop Tab order covers brand, nav, actions without toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('body').focus();
  const order: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() =>
      (document.activeElement as HTMLElement)?.textContent?.trim() ?? '',
    );
    order.push(focused);
  }
  expect(order).toContain('Products');
  expect(order).toContain('Pricing');
  expect(order).toContain('Sign in');
  // Toggle label (Open navigation) must NOT appear on desktop
  expect(order.some((t) => t.includes('Open navigation'))).toBe(false);
});
```

## KB-02 — Mobile viewport exposes MobileToggle in Tab order

**Given** viewport <768px
**When** user presses `Tab` from `<body>`
**Then** focus eventually lands on MobileToggle with aria-label "Open navigation"

```ts
test('KB-02: mobile Tab order includes toggle, excludes hidden nav', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('body').focus();
  const labels: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(
      () => (document.activeElement as HTMLElement)?.getAttribute('aria-label') ?? '',
    );
    labels.push(label);
  }
  expect(labels).toContain('Open navigation');
});
```

## KB-03 — Enter on MobileToggle opens Sheet

```ts
test('KB-03: Enter key on toggle opens mobile Sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
});
```

## KB-04 — Space on MobileToggle opens Sheet

```ts
test('KB-04: Space key on toggle opens mobile Sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).focus();
  await page.keyboard.press(' ');
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
});
```

## KB-05 — Escape closes open Sheet

```ts
test('KB-05: Escape closes mobile Sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeHidden();
});
```

## KB-06 — Tab cycles inside open Sheet (focus trap)

```ts
test('KB-06: Tab stays trapped inside open Sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  // Collect focused element after each Tab — none should escape dialog
  const inside: boolean[] = [];
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('Tab');
    const isInside = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg?.contains(document.activeElement) ?? false;
    });
    inside.push(isInside);
  }
  expect(inside.every(Boolean)).toBe(true);
});
```

## KB-07 — Shift+Tab reverse order inside Sheet stays trapped

```ts
test('KB-07: Shift+Tab reverse cycle stays trapped', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  for (let i = 0; i < 5; i += 1) {
    await page.keyboard.press('Shift+Tab');
  }
  const isInside = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    return dlg?.contains(document.activeElement) ?? false;
  });
  expect(isInside).toBe(true);
});
```

## KB-08 — No arrow-key hijack on nav

**Given** desktop, focus on a nav link
**When** user presses `ArrowRight`
**Then** default browser behavior fires (no SiteHeader-captured handler moves focus) — nav is not a menubar; arrow keys are reserved for consumer-owned behaviors.

```ts
test('KB-08: ArrowRight does not move focus off nav link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const productsLink = page.getByRole('link', { name: 'Products' });
  await productsLink.focus();
  await page.keyboard.press('ArrowRight');
  await expect(productsLink).toBeFocused();
});
```

---

## Manual Verification (NVDA sweep)

- Open demo → NVDA announces "banner landmark" + "Primary navigation"
- Tab to toggle on mobile viewport → "Open navigation, button, collapsed"
- Activate toggle → "Navigation, dialog, modal" announcement, focus on first link
- Escape → returns to "Close navigation, expanded" then "Open navigation, collapsed" on full close

Record outcome in component header `@tested` field once sweep is executed.
