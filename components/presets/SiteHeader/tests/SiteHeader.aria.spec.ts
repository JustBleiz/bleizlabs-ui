/**
 * SiteHeader ARIA semantics spec — banner + navigation landmark + disclosure +
 * dialog-modal composition (E142 L3c).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('SiteHeader — ARIA (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/components/site-header');
  });

  test('AR-01 — SiteHeader renders semantic <header> with navigation landmark', async ({
    page,
  }) => {
    // NOTE-FOR-LIB: <header> renders as `banner` landmark ONLY when it is a
    // direct child of <body> (ARIA scoping rule). Playground nests each
    // SiteHeader inside a <section>, stripping banner role. Real consumer
    // apps that place SiteHeader directly under <body> DO get banner landmark.
    // Assertion: find a SiteHeader instance (by its .root class) + verify
    // it has a nav landmark inside.
    const siteHeader = page.locator('header[class*="__root"]').first();
    await expect(siteHeader).toBeAttached();
    const nav = siteHeader.locator('nav[aria-label]').first();
    await expect(nav).toBeAttached();
    const navLabel = await nav.getAttribute('aria-label');
    expect(navLabel).toBeTruthy();
  });

  test('AR-02 — navigation landmarks have accessible names', async ({ page }) => {
    // Playground renders 6 SiteHeader instances with distinct navAriaLabel values.
    const primaryNavs = page.getByRole('navigation', { name: 'Primary' });
    expect(await primaryNavs.count()).toBeGreaterThanOrEqual(1);
    const allLabels = await page.$$eval('header nav', (navs) =>
      navs.map((n) => n.getAttribute('aria-label') ?? ''),
    );
    for (const label of allLabels) {
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('AR-06 — aria snapshot on first SiteHeader exposes navigation role', async ({
    page,
  }) => {
    const siteHeader = page.locator('header[class*="__wrapper"]').first();
    const snapshot = await siteHeader.ariaSnapshot();
    expect(snapshot).toContain('navigation');
    expect(snapshot).toMatch(/"Primary"/);
  });

  test('axe-core zero violations — desktop', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('SiteHeader — ARIA (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
  });

  test('AR-03 — MobileToggle aria-expanded syncs with state', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    // Label flips to "Close navigation" after open
    await expect(
      page.getByRole('button', { name: 'Close navigation' }).first(),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('AR-04 — MobileToggle aria-controls points to Sheet id', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    const controlsId = await toggle.getAttribute('aria-controls');
    expect(controlsId).toMatch(/^site-header-sheet-/);
    await toggle.click();
    const dialog = page.locator(`#${controlsId}`);
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('AR-05 — Sheet aria-labelledby resolves to title element', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' }).first();
    const labelId = await dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const title = page.locator(`#${labelId}`);
    await expect(title).toContainText('Navigation');
  });

  test('axe-core zero violations — mobile with Sheet open', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.waitForTimeout(80);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
