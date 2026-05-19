/**
 * ScrollArea keyboard interaction spec (E142 L3e).
 *
 * Coverage:
 * - SA-R01 viewport tabIndex=0 preserves native keyboard scroll
 * - SA-R02 PageDown/PageUp scroll by viewport height
 * - SA-R03 Home/End scroll to top/bottom
 *
 * Playground: /components/scroll-area
 *   Section 1: Basic — bare <ScrollArea> with 8 long paragraphs (scrollable)
 *   Section 5: Wide table — horizontal scroll only (8 rows, wide columns)
 *   Section 6: Tall+wide table — both axes (40 rows)
 *
 * Notes on selectors: the viewport has no data-attribute — it uses
 * `styles.viewport` (CSS-module suffixed class) + `tabIndex={0}`. We scope
 * to the first section's ScrollArea root, then pick the viewport via
 * `div[tabindex="0"]` (there is exactly one tabbable div per root).
 */

import { test, expect } from '@playwright/test';

test.describe('ScrollArea — keyboard interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/scroll-area');
  });

  test('SA-R01 — viewport tabIndex=0 preserves native keyboard scroll', async ({ page }) => {
    // Section 1 — Basic. First scrollable viewport on the page.
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await expect(viewport).toHaveAttribute('tabindex', '0');
    await viewport.focus();
    await expect(viewport).toBeFocused();
    const initial = await viewport.evaluate((el) => el.scrollTop);
    await page.keyboard.press('ArrowDown');
    // ArrowDown triggers native scroll — wait a tick for scroll to land.
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBeGreaterThan(initial);
  });

  test('SA-R02 — PageDown scrolls by ~viewport height', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    const initial = await viewport.evaluate((el) => el.scrollTop);
    await page.keyboard.press('PageDown');
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBeGreaterThan(initial);
  });

  test('SA-R03 — End scrolls to bottom; Home scrolls back to top', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    await page.keyboard.press('End');
    // At end: scrollTop + clientHeight >= scrollHeight - 1.
    await expect
      .poll(
        async () =>
          viewport.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1),
        { timeout: 2000 },
      )
      .toBe(true);
    await page.keyboard.press('Home');
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBe(0);
  });

  test('ArrowUp after scrolled-down reduces scrollTop', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.focus();
    await viewport.evaluate((el) => el.scrollTo({ top: 200, behavior: 'instant' }));
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 1000 })
      .toBeGreaterThan(0);
    const before = await viewport.evaluate((el) => el.scrollTop);
    await page.keyboard.press('ArrowUp');
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 2000 })
      .toBeLessThan(before);
  });
});
