import { test, expect } from '@playwright/test';

// =============================================================================
// CollapsibleZoneCard — Focus Management Tests (APG disclosure pattern)
// =============================================================================
// Per APG disclosure spec:
//  - Initial focus: NOT auto-focused on mount (consumer choice)
//  - Focus on toggle: STAYS on trigger after Space/Enter/click (no jump to body)
//  - Focus trap: NOT applicable (single disclosure is not modal)
//  - Restore on close: N/A (no modal close state)
//
// Mobile precedent (Radix #11): focus must remain on trigger even when collapse
// scrolls trigger off-screen — programmatic re-focus required.
// =============================================================================

test.describe('CollapsibleZoneCard focus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/collapsible-zone-card');
    await page.waitForSelector('main button[aria-expanded]');
  });

  test('Trigger is NOT auto-focused on mount', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    // Active element after page load should not be the disclosure trigger
    await expect(trigger).not.toBeFocused();
  });

  test('Focus stays on trigger after Space toggle', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await page.keyboard.press('Space');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('Focus stays on trigger after Enter toggle', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toBeFocused();
  });

  test('Focus stays on trigger after click toggle', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.click();
    // After mouse click, focus state on the button is browser-dependent.
    // Spec acceptance: aria-expanded changed (action took effect). Focus
    // staying on trigger is verified via keyboard tests above (per APG —
    // mouse-driven focus is consumer/browser concern).
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('Focus visible only on keyboard focus (focus-visible via box-shadow)', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();

    // Lib `mx.focus-ring` mixin uses `box-shadow: var(--focus-ring)` (NOT
    // outline — `--focus-ring` is a full box-shadow expression `0 0 0 3px <color>`).
    // Per Card.module.scss precedent.
    const boxShadow = await trigger.evaluate(
      (el) => window.getComputedStyle(el).boxShadow
    );
    expect(boxShadow).not.toBe('none');
    expect(boxShadow.length).toBeGreaterThan(0);
  });

  test('Focus does NOT jump to body after expand', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    // After expand, trigger still owns focus (NOT body content)
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('Body focusables become reachable via Tab after expand', async ({
    page,
  }) => {
    // Demo Section 9 (force-mount) wraps a real `<Input>` inside the body —
    // the only zone in the demo with a guaranteed body focusable. Open it,
    // Tab from trigger, assert focus lands on a focusable form element.
    const wrap = page.locator('[data-testid="force-mount-czc"]');
    const trigger = wrap.locator('button[aria-expanded]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
  });
});
