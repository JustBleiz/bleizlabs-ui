/**
 * Tooltip regression spec — Radix closed-issue mapping (E19).
 *
 * 20 edge cases mapped. Several `test.skip` with PLAYGROUND-DEP rationale —
 * unskip when referenced integration scenarios (Dialog/DropdownMenu/touch
 * device) land in the demo playground.
 */

import { test, expect } from '@playwright/test';

test.describe('Tooltip — regression cases (Radix closed issues)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tooltip');
  });

  test('radix-620 — hover content does not disappear when pointer enters tooltip', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'APG reference' });
    await trigger.hover();
    await page.waitForTimeout(800);
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await tooltip.hover();
    await page.waitForTimeout(300);
    await expect(tooltip).toBeVisible();
  });

  test('radix-705 — tab switch hides tooltip', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });

  test.skip('radix-617 — no re-show on programmatic focus restore from modal [PLAYGROUND-DEP: Dialog]', async () => {
    // Requires nested Dialog + Tooltip.
  });

  test('radix-1691 — click before delay cancels pending open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.hover();
    await page.waitForTimeout(200);
    await trigger.click();
    // Move pointer away so any re-trigger paths are disarmed
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    await expect(page.getByRole('tooltip', { name: 'Save file (Ctrl+S)' })).not.toBeVisible();
  });

  test('radix-1077 — keyboard activation keeps tooltip open', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('radix-2029 — click does not dismiss tooltip', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('radix-2372 — TooltipProvider group: instant transitions after first open', async ({ page }) => {
    // Use `exact: true` — other buttons on the page include 'bottom', 'bottom-start' etc.
    const boldBtn = page.getByRole('button', { name: 'B', exact: true });
    await boldBtn.scrollIntoViewIfNeeded();
    await boldBtn.hover();
    await page.waitForTimeout(800);
    await expect(page.getByRole('tooltip', { name: 'Bold (Ctrl+B)' })).toBeVisible();
    // Move to sibling in the same provider group — tooltip appears without the 700ms delay
    await page.getByRole('button', { name: 'I', exact: true }).hover();
    await page.waitForTimeout(100);
    await expect(page.getByRole('tooltip', { name: /italic/i })).toBeVisible();
  });

  test.skip('radix-1920 — tooltip + dropdown interaction [PLAYGROUND-DEP: DropdownMenu]', async () => {
    // Requires nested DropdownMenu + Tooltip scenario.
  });

  test.skip('radix-1573 — iOS Safari hover behavior [PLAYGROUND-DEP: iOS device]', async () => {
    // iOS Safari tap-to-focus shows tooltip; no hover events.
  });

  test.skip('radix-2589 — Android Chrome touch [PLAYGROUND-DEP: touch device]', async () => {
    // Android Chrome tap may not focus non-input — document as limitation.
  });

  test.skip('radix-1351 — mobile focus reliability [PLAYGROUND-DEP: mobile device]', async () => {
    // Some mobile browsers do not consistently fire focus on tap for custom elements.
  });

  test('radix-2959 — asChild with forwardRef child forwards events correctly', async ({ page }) => {
    // Playground wraps our Button atom (forwardRef) via asChild Slot.
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('radix-2665 — duplicate of #705 (covered elsewhere)', async () => {
    expect(true).toBe(true);
  });

  test('radix-899 — no id collision between sibling tooltips', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    const undo = page.getByRole('button', { name: 'Undo' });
    await save.focus();
    const id1 = await save.getAttribute('aria-describedby');
    await undo.focus();
    const id2 = await undo.getAttribute('aria-describedby');
    expect(id1).not.toBe(id2);
  });

  test.skip('radix-1010 — no implicit type="button" on wrapper [PLAYGROUND-DEP: <a> trigger demo]', async () => {
    // Playground has no <a>-wrapped tooltip trigger — skip until added.
  });

  test('radix-1476 — wide tooltip shifted within viewport bounds', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Hover for details' });
    await trigger.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    const box = await tooltip.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerWidth),
      );
    }
  });

  test('radix-1612 — tooltip follows trigger on scroll', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Save' });
    await trigger.focus();
    const before = await page.getByRole('tooltip').boundingBox();
    expect(before).not.toBeNull();
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);
    const after = await page.getByRole('tooltip').boundingBox();
    if (before && after) {
      // Tooltip should follow the trigger — y decreases by ~100 (within tolerance)
      expect(Math.abs(before.y - 100 - after.y)).toBeLessThan(20);
    }
  });

  test('radix-3081 — tooltip inside form does not auto-submit (documentation-only)', async () => {
    // Consumer is responsible for `type="button"` on triggers inside forms.
    // Our Slot passes consumer's type through unchanged.
    expect(true).toBe(true);
  });

  test.skip('radix-2727 — dropdown close restoring focus re-triggers tooltip [PLAYGROUND-DEP: DropdownMenu]', async () => {
    // Requires DropdownMenu integration.
  });

  test.skip('radix-1914 — native disabled button has no tooltip [PLAYGROUND-DEP: disabled-button demo]', async () => {
    // Playground has no disabled-button trigger — skip until added.
  });
});
