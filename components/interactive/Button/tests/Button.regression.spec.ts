/**
 * Button regression spec — disabled href onClick suppression + asChild
 * onClick forwarding (E01 audit remediation).
 *
 * Coverage (BT-R01..BT-R05):
 * - BT-R01: enabled `<Button href onClick>` keeps href, fires handler, navigates
 * - BT-R02: disabled `<Button href onClick>` strips href, keeps role="link" +
 *   aria-disabled + tabIndex=-1, and does NOT fire the handler on
 *   PROGRAMMATIC activation (el.click() — the assistive-tech proxy;
 *   real pointer clicks were already blocked by CSS pointer-events)
 * - BT-R03: disabled href button carries pointer-events: none (CSS layer lock)
 * - BT-R04: disabled native `<button>` does not fire the handler (contrast)
 * - BT-R05: asChild forwards onClick to the child when enabled, suppresses
 *   it when disabled (pre-fix: onClick was silently dropped entirely)
 *
 * Root cause fixed in E01 (audit remediation work-unit): the anchor branch
 * attached `onClick` regardless of `disabled` (only CSS blocked real
 * pointers — programmatic and AT activation leaked through), and the
 * asChild branch never forwarded `onClick` at all (destructured, never
 * spread).
 */

import { expect, test } from '@playwright/test';

test.describe('Button — disabled href + asChild onClick', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/button');
  });

  test('BT-R01: enabled href — keeps href, fires handler, navigates', async ({ page }) => {
    const btn = page.getByTestId('btn-href-enabled');
    await expect(btn).toHaveAttribute('href', '#clicked');
    const tagName = await btn.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
    await btn.click();
    await expect(page.getByTestId('btn-click-count')).toContainText('Handler calls: 1');
    expect(page.url()).toContain('#clicked');
  });

  test('BT-R02: disabled href — no href, role=link kept, handler suppressed', async ({ page }) => {
    const btn = page.getByTestId('btn-href-disabled');
    await expect(btn).not.toHaveAttribute('href');
    await expect(btn).toHaveRole('link');
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await expect(btn).toHaveAttribute('tabindex', '-1');
    // Programmatic click = AT-activation proxy. A real Playwright .click()
    // would just time out on pointer-events: none, proving nothing.
    await btn.evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('btn-click-count')).toContainText('Handler calls: 0');
    expect(page.url()).not.toContain('#clicked');
  });

  test('BT-R03: disabled href — pointer-events: none (CSS layer)', async ({ page }) => {
    const btn = page.getByTestId('btn-href-disabled');
    await expect(btn).toHaveCSS('pointer-events', 'none');
  });

  test('BT-R04: disabled native button — handler suppressed (contrast)', async ({ page }) => {
    const btn = page.getByTestId('btn-native-disabled');
    await expect(btn).toBeDisabled();
    await btn.evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('btn-click-count')).toContainText('Handler calls: 0');
  });

  test('BT-R05: asChild — onClick forwarded when enabled, suppressed when disabled', async ({
    page,
  }) => {
    const enabled = page.getByTestId('btn-aschild-enabled');
    const disabled = page.getByTestId('btn-aschild-disabled');

    // Pre-fix regression: onClick was destructured and never forwarded —
    // this click incremented nothing.
    await enabled.evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('btn-click-count')).toContainText('Handler calls: 1');

    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('data-disabled', 'true');
    await disabled.evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('btn-click-count')).toContainText('Handler calls: 1');
  });
});
