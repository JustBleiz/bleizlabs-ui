/**
 * Accordion regression spec — heading-wrapped triggers (E04 audit remediation).
 *
 * Coverage:
 * - AC-R01 Trigger button is contained in a heading element (default level 3)
 * - AC-R02 headingLevel prop overrides the heading level (h4 demo variant)
 * - AC-R03 Toggle through the heading-wrapped button still works
 *   (aria-expanded + panel aria-hidden flip)
 * - AC-R04 Heading wrapper carries a full visual reset (margin 0 — UA h3
 *   styles must not shift the pre-existing trigger visual)
 *
 * Demo route: /components/toggles (standalone Accordion sections).
 */

import { test, expect } from '@playwright/test';

test.describe('Accordion — heading-wrapped triggers', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/toggles');
  });

  test('AC-R01 — trigger is contained in a heading element (default h3)', async ({ page }) => {
    // Pre-fix: button was a direct child of the root div — APG accordion
    // requires each header to be contained in a heading-role element.
    const heading = page.getByRole('heading', {
      level: 3,
      name: 'Compact accordion (uncontrolled)',
    });
    await expect(heading).toBeVisible();
    const trigger = heading.getByRole('button', { name: /Compact accordion/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('AC-R02 — headingLevel prop overrides the heading level', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 4, name: 'Custom heading level (h4)' });
    await expect(heading).toBeVisible();
    await expect(heading.getByRole('button')).toBeVisible();
  });

  test('AC-R03 — toggle through the heading-wrapped button works', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Custom heading level (h4)' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panelId = await trigger.getAttribute('aria-controls');
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
  });

  test('AC-R04 — heading wrapper carries a full visual reset', async ({ page }) => {
    const heading = page.getByRole('heading', {
      level: 3,
      name: 'Compact accordion (uncontrolled)',
    });
    const margins = await heading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft];
    });
    expect(margins).toEqual(['0px', '0px', '0px', '0px']);
    // font: inherit — UA heading font-size/weight must not leak into the
    // wrapper (the trigger sets its own font props; wrapper inherits page).
    const fonts = await heading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const parent = window.getComputedStyle(el.parentElement as Element);
      return {
        size: cs.fontSize === parent.fontSize,
        weight: cs.fontWeight === parent.fontWeight,
      };
    });
    expect(fonts).toEqual({ size: true, weight: true });
  });
});
