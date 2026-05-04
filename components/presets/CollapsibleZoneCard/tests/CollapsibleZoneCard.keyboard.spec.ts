import { test, expect } from '@playwright/test';

// =============================================================================
// CollapsibleZoneCard — Keyboard Interaction Tests (APG disclosure pattern)
// =============================================================================
// Spec: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
//
// Required keyboard interactions:
//  - Space when trigger has focus → toggles open state
//  - Enter when trigger has focus → toggles open state
//  - Tab → moves focus AWAY from trigger (no trap)
//  - Shift+Tab → moves focus TO trigger from after-trigger element
//
// All tests run against /components/collapsible-zone-card demo page.
// =============================================================================

test.describe('CollapsibleZoneCard keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/collapsible-zone-card');
    await page.waitForSelector('main button[aria-expanded]');
  });

  test('Space toggles open state on minimal example', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Enter toggles open state on minimal example', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Tab moves focus away from trigger (no trap)', async ({ page }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(trigger).not.toBeFocused();
  });

  test('Shift+Tab returns focus to trigger from after-trigger element', async ({
    page,
  }) => {
    // Open the first card to expose body focusables
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Tab into body, then Shift+Tab back; trigger eventually regains focus
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();
  });

  test('Space does NOT submit a wrapping <form> (Radix #15)', async ({
    page,
  }) => {
    // Demo Section 8 wraps a CollapsibleZoneCard inside <form onSubmit={preventDefault}>;
    // wraps a marker we assert against. Trigger must have type="button".
    const formCard = page.locator('[data-testid="form-wrapped-czc"] button[aria-expanded]');
    await formCard.focus();

    let submitFired = false;
    await page.exposeFunction('__czcSubmitFlag', () => {
      submitFired = true;
    });
    await page.evaluate(() => {
      const form = document.querySelector(
        '[data-testid="form-wrapped-czc"] form'
      );
      form?.addEventListener('submit', () => {
        // @ts-expect-error — exposed via Playwright
        window.__czcSubmitFlag();
      });
    });

    await page.keyboard.press('Space');
    expect(submitFired).toBe(false);
  });

  test('Rapid Space+Space+Space toggles do not stutter or skip state (Radix #17)', async ({
    page,
  }) => {
    const trigger = page.locator('main button[aria-expanded]').first();
    await trigger.focus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Space');
    }
    // 6 toggles from false → end at false (even count)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
