/**
 * SiteHeader keyboard interaction spec — composition of banner + navigation +
 * disclosure + dialog-modal (E142 L3c).
 *
 * Covers KB-01..KB-08. No arrow-key hijacking (route links ≠ menubar).
 * Desktop Tab order: Brand → Nav → Actions (MobileToggle hidden via CSS).
 * Mobile (<768px): MobileToggle visible; Enter/Space opens Sheet; Escape closes;
 * Tab trap inside Sheet.
 */

import { test, expect } from '@playwright/test';

test.describe('SiteHeader — keyboard interactions (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/components/site-header');
  });

  test('KB-01 — desktop Tab order covers brand, nav, actions without toggle', async ({
    page,
  }) => {
    await page.locator('body').focus();
    const labels: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const text = el?.textContent?.trim() ?? '';
        const aria = el?.getAttribute('aria-label') ?? '';
        return `${text}|${aria}`;
      });
      labels.push(focused);
    }
    const joined = labels.join('\n');
    expect(joined).toContain('Products');
    expect(joined).toContain('Pricing');
    // "Open navigation" toggle should NOT appear in desktop Tab sweep
    expect(joined).not.toContain('Open navigation');
  });

  test('KB-08 — ArrowRight does not move focus off nav link (no menubar hijack)', async ({
    page,
  }) => {
    // Use SiteHeader .root class — see SiteHeader.aria.spec.ts AR-01 note.
    const siteHeader = page.locator('header[class*="__root"]').first();
    await siteHeader.scrollIntoViewIfNeeded();
    const productsLink = siteHeader
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Products' });
    await productsLink.focus();
    await page.keyboard.press('ArrowRight');
    await expect(productsLink).toBeFocused();
  });
});

test.describe('SiteHeader — keyboard interactions (mobile)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/components/site-header');
  });

  test('KB-02 — mobile Tab order includes "Open navigation" toggle', async ({
    page,
  }) => {
    await page.locator('body').focus();
    const labels: string[] = [];
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(
        () =>
          (document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ??
          '',
      );
      labels.push(label);
    }
    expect(labels).toContain('Open navigation');
  });

  test('KB-03 — Enter key on toggle opens mobile Sheet', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Navigation' }).first()).toBeVisible();
  });

  test('KB-04 — Space key on toggle opens mobile Sheet', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.focus();
    await page.keyboard.press(' ');
    await expect(page.getByRole('dialog', { name: 'Navigation' }).first()).toBeVisible();
  });

  test('KB-05 — Escape closes open Sheet', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' }).first();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('KB-06 — Tab stays trapped inside open Sheet', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Navigation' }).first();
    await expect(dialog).toBeVisible();
    // Gate: focus trap rAF defer — wait for initial focus to land inside
    await page.waitForTimeout(100);
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab');
      const isInside = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        return dlg?.contains(document.activeElement) ?? false;
      });
      expect(isInside).toBe(true);
    }
  });

  test('KB-07 — Shift+Tab reverse cycle stays trapped', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open navigation' }).first();
    await toggle.click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.waitForTimeout(100);
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab');
    }
    const isInside = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      return dlg?.contains(document.activeElement) ?? false;
    });
    expect(isInside).toBe(true);
  });
});
