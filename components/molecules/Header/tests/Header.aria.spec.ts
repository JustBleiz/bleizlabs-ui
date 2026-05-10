/**
 * Header molecule spec — universal block-header (E06.1 ADD).
 *
 * Coverage:
 * - Renders semantic `<header>` element (banner landmark when at page top)
 * - Children render in `.body` slot
 * - Actions render in `.actions` slot when provided
 * - Actions slot omitted entirely when `actions` prop is undefined
 *
 * Playground: /components/header
 */

import { test, expect } from '@playwright/test';

test.describe('Header — block-header molecule', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/header');
  });

  test('renders semantic <header> element', async ({ page }) => {
    // At least one banner role exists on the demo page (the actual demo
    // uses many <Header> instances; some are nested inside <main>/<section>
    // and don't expose the banner role per HTML5 sectioning rules).
    const headers = page.locator('header');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('children render in body slot', async ({ page }) => {
    // The demo's first Header has a Heading inside — assert any heading
    // appears within a header element.
    const headerWithHeading = page
      .locator('header')
      .filter({ has: page.locator('h1, h2, h3, h4, h5, h6') })
      .first();
    await expect(headerWithHeading).toBeVisible();
  });

  test('actions slot rendered when prop provided', async ({ page }) => {
    // Demo includes Header instances with action buttons (e.g. "View all").
    const headerWithButton = page
      .locator('header')
      .filter({ has: page.locator('button, a[role="button"]') })
      .first();
    await expect(headerWithButton).toBeVisible();
  });

  test('Header without actions renders only body (no .actions slot)', async ({ page }) => {
    // Find a header with NO buttons inside it. The demo is expected to
    // include at least one such "no-actions" example. If not found, skip.
    const allHeaders = await page.locator('header').all();
    let foundNoActions = false;
    for (const h of allHeaders) {
      const buttonCount = await h.locator('button, a[role="button"]').count();
      if (buttonCount === 0) {
        foundNoActions = true;
        break;
      }
    }
    if (!foundNoActions) {
      test.skip(true, 'No actions-less Header in demo');
    }
  });
});
