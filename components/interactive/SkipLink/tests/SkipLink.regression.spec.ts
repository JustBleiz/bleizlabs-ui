/**
 * SkipLink regression spec — SK-R01..SK-R04.
 *
 * Pins the WCAG 2.4.1 contract of the SkipLink atom on the live demo route:
 * sr-only by default, keyboard-only reveal as a fixed top-left pill, native
 * fragment navigation that moves focus to the tabindex="-1" target, and
 * plain-prop forwarding (custom href/label/rest). Axe coverage for the route
 * comes from the filesystem-derived smoke suite (tests/smoke.spec.ts).
 */

import { expect, test } from '@playwright/test';

const ROUTE = '/components/skip-link';

test.describe('SkipLink regression (SK-R01..SK-R04)', () => {
  test('SK-R01: default state is sr-only clipped (1×1px, absolute)', async ({ page }) => {
    await page.goto(ROUTE);
    const link = page.getByTestId('skip-link-default');
    await expect(link).toHaveAttribute('href', '#skip-link-demo-main');
    await expect(link).toHaveText('Skip to main content');
    const geometry = await link.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { position: style.position, width: style.width, height: style.height };
    });
    expect(geometry).toEqual({ position: 'absolute', width: '1px', height: '1px' });
  });

  test('SK-R02: first Tab focuses the link and reveals it as a fixed pill', async ({ page }) => {
    await page.goto(ROUTE);
    await page.keyboard.press('Tab');
    const link = page.getByTestId('skip-link-default');
    await expect(link).toBeFocused();
    const geometry = await link.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        position: style.position,
        zIndex: style.zIndex,
        width: rect.width,
        top: rect.top,
        left: rect.left,
      };
    });
    expect(geometry.position).toBe('fixed');
    expect(geometry.zIndex).toBe('70'); // --z-skip-link — above toast (60)
    expect(geometry.width).toBeGreaterThan(100); // unclipped, real pill
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.top).toBeLessThan(100); // top-left corner of the viewport
    expect(geometry.left).toBeLessThan(100);
  });

  test('SK-R03: Enter navigates to the target and moves focus to it', async ({ page }) => {
    await page.goto(ROUTE);
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('skip-link-default')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#skip-link-demo-main$/);
    // The demo target is <main id tabIndex={-1}> — fragment navigation must
    // move focus there (not merely scroll), per the component's @a11y contract.
    await expect(page.locator('main#skip-link-demo-main')).toBeFocused();
  });

  test('SK-R04: custom href, localized label, and rest props forward to the anchor', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const link = page.getByTestId('skip-link-custom');
    await expect(link).toHaveAttribute('href', '#skip-link-demo-target');
    await expect(link).toHaveText('Przejdź do treści');
    // data-testid itself arrived via {...rest} — assert the element is the
    // native anchor (no wrapper) so rest props land on the <a>.
    expect(await link.evaluate((el) => el.tagName)).toBe('A');
  });
});
