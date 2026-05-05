/**
 * HoverCard regression spec — Radix-style closed-issue mapping (E23).
 *
 * Spec originally referenced @acme / @beta / @bare triggers which the
 * playground does not contain — tests remapped onto @jane / @leo / @mira
 * and the provider feed section where the skip-delay group applies.
 * Nested HoverCard and transformed-parent scenarios remain skipped.
 */

import { test, expect } from '@playwright/test';

test.describe('HoverCard — regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/hover-card');
  });

  test('HC-R01 — hover delay timing respects openDelay prop', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.hover();
    // Default openDelay = 700ms. Content should NOT be visible before delay.
    await page.waitForTimeout(350);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // After delay, content appears
    await page.waitForTimeout(500);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('HC-R02 — grace area: content pointer enter cancels close timer', async ({
    page,
  }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.hover();
    await page.waitForTimeout(800);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Move pointer from trigger toward content — triggers closeDelay timer
    await page.mouse.move(0, 0); // leave trigger
    // Before closeDelay elapses, fire pointerenter on content — timer cancelled.
    // dispatchEvent (synchronous) avoids the Playwright hover() actionability
    // delay that can race the closeDelay window.
    await dialog.dispatchEvent('pointerenter');
    await page.waitForTimeout(400);
    await expect(dialog).toBeVisible();
  });

  test('HC-R06 — visibilitychange hidden closes (tab switch)', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('HC-R07 — window blur closes (alt-tab)', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('HC-R09 — Provider skip-delay window after first open', async ({ page }) => {
    // Provider section has @jane / @leo / @mira. @leo exists only inside the
    // provider (once). @mira appears twice (provider + controlled section below).
    // Use first() to target provider-scoped @mira.
    const providerLeo = page.getByRole('link', { name: '@leo' });
    const providerMira = page.getByRole('link', { name: '@mira' }).first();
    await providerLeo.scrollIntoViewIfNeeded();
    await providerLeo.hover();
    await page.waitForTimeout(800);
    await expect(page.getByRole('dialog').filter({ hasText: 'Leo Park' })).toBeVisible();
    // Move to sibling within skipDelayDuration — should open INSTANTLY
    await providerMira.hover();
    await page.waitForTimeout(150);
    await expect(page.getByRole('dialog').filter({ hasText: 'Mira Singh' })).toBeVisible();
  });

  test('HC-R10 — controlled mode fires onOpenChange consistently', async ({ page }) => {
    // Playground controlled section uses React state; verify the observable
    // behavior: external Force open / Force close button reflects state.
    const externalButton = page.getByRole('button', { name: /Force open/ });
    await externalButton.scrollIntoViewIfNeeded();
    await externalButton.click();
    await expect(page.getByRole('dialog').filter({ hasText: 'Mira Singh' })).toBeVisible();
    // Button text changes to "Force close" once state is true
    await expect(page.getByRole('button', { name: /Force close/ })).toBeVisible();
  });

  test('HC-R11 — placement data-placement attribute exposed on content', async ({
    page,
  }) => {
    const trigger = page.getByRole('link', { name: '@jane' }).first();
    await trigger.focus();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const placement = await dialog.getAttribute('data-placement');
    expect(placement).toMatch(/^(top|bottom|left|right)/);
  });

  test.skip('HC-R14 — nested HoverCard [PLAYGROUND-DEP: nested composition demo]', async () => {
    // Requires playground route with HoverCard inside HoverCard content.
  });

  test.skip('HC-R15 — portal positioning under transformed parent [PLAYGROUND-DEP: transform demo]', async () => {
    // Requires playground with trigger inside a CSS transform ancestor.
  });
});
