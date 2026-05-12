/**
 * FileUpload ARIA + keyboard + focus + axe-core spec.
 *
 * Coverage: role=button, aria-disabled, aria-describedby live-region link,
 * Space/Enter activate picker, Tab order, axe-core zero violations.
 *
 * Total: 11 cases (FU-A01..FU-A11).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { zoneBy, hiddenInputOf, liveRegionOf } from './_helpers';

const URL = '/components/file-upload';

test.describe('FileUpload — ARIA + keyboard + focus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('FU-A01: drop zone is plain div (NOT role=button — axe nested-interactive) + accessible name', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await expect(zone).toBeVisible();
    // Drop zone deliberately has NO role=button — see FileUpload.tsx @a11y
    // header comment for rationale. axe-core nested-interactive +
    // no-focusable-content violations would otherwise fire (zone contains
    // consumer-rendered Browse <button> + hidden <input>).
    const role = await zone.getAttribute('role');
    expect(role).toBeNull();
    await expect(zone).toHaveAttribute('aria-label', 'Upload single file');
  });

  test('FU-A02: drop zone is tab-stop (tabIndex=0)', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await expect(zone).toHaveAttribute('tabindex', '0');
  });

  test('FU-A03: disabled drop zone has aria-disabled=true + tabIndex=-1', async ({ page }) => {
    const zone = zoneBy(page, 'Disabled file upload');
    await expect(zone).toHaveAttribute('aria-disabled', 'true');
    await expect(zone).toHaveAttribute('tabindex', '-1');
  });

  test('FU-A04: drop zone points to live region via aria-describedby (default)', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    const describedby = await zone.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    // Live region exists with the same id.
    const live = page.locator(`#${describedby}`);
    await expect(live).toHaveAttribute('role', 'status');
    await expect(live).toHaveAttribute('aria-live', 'polite');
  });

  test('FU-A05: hidden input is tabIndex=-1 + aria-hidden', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    const input = hiddenInputOf(zone);
    await expect(input).toHaveAttribute('tabindex', '-1');
    await expect(input).toHaveAttribute('aria-hidden', 'true');
    await expect(input).toHaveAttribute('type', 'file');
  });

  test('FU-A06: Space on drop zone triggers picker click on hidden input', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    const input = hiddenInputOf(zone);
    // Spy on the click event on the hidden input.
    await zone.evaluate((el) => {
      const inp = el.querySelector('input[type="file"]');
      (window as unknown as { __clicked: boolean }).__clicked = false;
      inp?.addEventListener('click', (e) => {
        (window as unknown as { __clicked: boolean }).__clicked = true;
        e.preventDefault(); // suppress real picker dialog
      });
    });
    await zone.focus();
    await page.keyboard.press('Space');
    const clicked = await page.evaluate(
      () => (window as unknown as { __clicked: boolean }).__clicked,
    );
    expect(clicked).toBe(true);
    // Native picker would have opened; we suppressed via preventDefault.
    await expect(input).toBeAttached();
  });

  test('FU-A07: Enter on drop zone triggers picker click on hidden input', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await zone.evaluate((el) => {
      const inp = el.querySelector('input[type="file"]');
      (window as unknown as { __clicked: boolean }).__clicked = false;
      inp?.addEventListener('click', (e) => {
        (window as unknown as { __clicked: boolean }).__clicked = true;
        e.preventDefault();
      });
    });
    await zone.focus();
    await page.keyboard.press('Enter');
    const clicked = await page.evaluate(
      () => (window as unknown as { __clicked: boolean }).__clicked,
    );
    expect(clicked).toBe(true);
  });

  test('FU-A08: Space on disabled drop zone does NOT trigger picker', async ({ page }) => {
    const zone = zoneBy(page, 'Disabled file upload');
    await zone.evaluate((el) => {
      const inp = el.querySelector('input[type="file"]');
      (window as unknown as { __clicked: boolean }).__clicked = false;
      inp?.addEventListener('click', (e) => {
        (window as unknown as { __clicked: boolean }).__clicked = true;
        e.preventDefault();
      });
    });
    // Force focus even though tabIndex=-1 — confirms keyboard ignores anyway.
    await zone.evaluate((el) => (el as HTMLDivElement).focus());
    await page.keyboard.press('Space');
    const clicked = await page.evaluate(
      () => (window as unknown as { __clicked: boolean }).__clicked,
    );
    expect(clicked).toBe(false);
  });

  test('FU-A09: live region exists and is empty initially', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    const live = liveRegionOf(zone);
    await expect(live).toHaveText('');
    await expect(live).toHaveAttribute('aria-atomic', 'true');
  });

  test('FU-A10: data-state="idle" by default', async ({ page }) => {
    const zone = zoneBy(page, 'Upload single file');
    await expect(zone).toHaveAttribute('data-state', 'idle');
  });

  test('FU-A11: axe-core zero violations on demo route', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .disableRules([
        // Pre-existing rule turned off in lib-wide axe baseline; consumer pages handle landmarks.
        'region',
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
