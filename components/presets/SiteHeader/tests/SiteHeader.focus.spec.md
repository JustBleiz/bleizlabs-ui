# SiteHeader — Focus Management Spec

> Focus management scenarios for SiteHeader (desktop + mobile Sheet). Runs
> against `/components/site-header` demo page.

---

## Setup

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/components/site-header');
});
```

---

## FC-01 — No autofocus on mount

```ts
test('FC-01: SiteHeader does not hijack initial focus', async ({ page }) => {
  const active = await page.evaluate(() => document.activeElement?.tagName ?? '');
  expect(['BODY', 'HTML']).toContain(active);
});
```

## FC-02 — Opening Sheet moves focus into first tabbable inside dialog

```ts
test('FC-02: Sheet open moves focus to first tabbable inside dialog', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  // Expect active element to be descendant of role=dialog
  const insideDialog = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    return dlg?.contains(document.activeElement) ?? false;
  });
  expect(insideDialog).toBe(true);
});
```

## FC-03 — Escape closes Sheet and restores focus to MobileToggle

```ts
test('FC-03: Escape returns focus to toggle on close', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const toggle = page.getByRole('button', { name: 'Open navigation' });
  await toggle.click();
  await page.keyboard.press('Escape');
  // Close navigation label toggles based on state — after close it reads Open again
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});
```

## FC-04 — Overlay click restores focus to MobileToggle

```ts
test('FC-04: Overlay click returns focus to toggle', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  // Click outside the dialog content — overlay catches it
  await page.mouse.click(300, 100);
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});
```

## FC-05 — Close button inside Sheet restores focus to MobileToggle

```ts
test('FC-05: Close (X) button returns focus to toggle', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: /^Close/i }).click();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});
```

---

## Manual Verification

- Keyboard-only operation: Tab from body → reach toggle → Space → focus inside Sheet → Escape → focus back on toggle (flashless restore)
- Screen reader discovery of focus movement — verify NVDA announces the focused link immediately on Sheet open
