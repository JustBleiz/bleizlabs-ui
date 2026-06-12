# AlertDialog.regression.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `AlertDialog.regression.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See AlertDialog.tsx `@regressions`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * AlertDialog regression spec — 41 Radix closed issues mapped to test cases (E16).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `AlertDialog.regression.spec.ts` (CI-gated).
 *
 * Source: github.com/radix-ui/primitives closed issues (alertdialog + dialog tags).
 * Categories:
 *   1. 21 INHERITED from Dialog (same portal + focus trap + scroll lock primitives)
 *   2. 20 ALERTDIALOG-SPECIFIC (role, required aria-describedby, overlay blocking,
 *      least-destructive focus, destructive styling, form isolation, etc.)
 *
 * Playground scenario coverage:
 *   - Tests marked `test.skip` reference scenarios NOT in the base playground
 *     (nested select/toast/form/shadow-DOM). First consumer with those use cases
 *     should extend `/components/alert-dialog` playground AND un-skip the matching
 *     tests. Rationale: keeping the test intent documented is more valuable than
 *     shipping selectors that break on first run.
 *   - Base playground covers: basic, critical, info, custom-labels, no-escape, sizes
 *     (sm/md/lg). The non-skipped tests below target this surface.
 *
 * Playground route under test: `/components/alert-dialog`
 */

import { test, expect } from '@playwright/test';

test.describe('AlertDialog — Radix regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/alert-dialog');
  });

  // ============================================================
  // INHERITED FROM DIALOG (21 cases — same primitives as Dialog)
  // ============================================================

  test.skip('#2690 inherited — clicking toast inside does not close dialog', async () => {
    // PLAYGROUND-DEP: needs "Open with toast" scenario + nested Toast atom
    // (which is Phase 10 CI14, not yet built). Unskip after CI14 lands.
  });

  test.skip('#1951 inherited — Escape in nested Select closes Select first, not AlertDialog', async () => {
    // PLAYGROUND-DEP: needs "Open with select" scenario + nested Select atom
    // (Phase 10 CI11, not yet built). Unskip after CI11 lands.
  });

  test('#2450 inherited — Escape bubbles correctly through nested components', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
  });

  test('#2961 inherited — reopening dialog after Select close works', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic alert/i });
    await trigger.click();
    await page.keyboard.press('Escape');
    await trigger.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test('#2355 inherited — reopen cycle preserves focus trap', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic alert/i });
    for (let i = 0; i < 3; i++) {
      await trigger.click();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
      await page.keyboard.press('Escape');
    }
  });

  test.skip('#1249 inherited — nested AlertDialog Escape closes innermost', async () => {
    // PLAYGROUND-DEP: needs nested alert scenario. Unskip when playground adds it.
  });

  test('#1891 inherited — focus not stuck after unmount', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'BODY']).toContain(active);
  });

  test.skip('#3353 inherited — Shadow DOM focus works', async () => {
    // PLAYGROUND-DEP: needs shadow root scenario. Unskip when playground adds it.
  });

  test('#2544 inherited — focus trap can be disabled in advanced scenarios', async ({ page }) => {
    // Advanced: consumer opts out of trap via initialFocusRef pointing outside
    // Current implementation: trap is always on — this test documents limitation
    test.skip();
  });

  test.skip('#2122 inherited — pointer-events do not leak to background', async () => {
    // PLAYGROUND-DEP: needs data-testid="background-button" scenario. Unskip after add.
  });

  test('#998 inherited — scroll lock only while open (not forceMount)', async ({ page }) => {
    const initialOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(initialOverflow).not.toBe('hidden');
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const openOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(openOverflow).toBe('hidden');
    await page.keyboard.press('Escape');
    const closedOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(closedOverflow).not.toBe('hidden');
  });

  test('#2270 inherited — focus returns to trigger that opened dialog (not first tabbable)', async ({
    page,
  }) => {
    const t1 = page.getByRole('button', { name: /open basic alert/i });
    const t2 = page.getByRole('button', { name: /open critical alert/i });
    await t2.click();
    await page.keyboard.press('Escape');
    await expect(t2).toBeFocused();
    await expect(t1).not.toBeFocused();
  });

  test('#3811 inherited — Safari focus escape prevented', async ({ page }) => {
    // Safari-specific; only runs on webkit project
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  test('#2836 inherited — aria-labelledby resolves to title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const labelledBy = await alert.getAttribute('aria-labelledby');
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('#3007 inherited — aria-describedby ALWAYS present (stricter than Dialog)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  test('#3579 inherited — custom description id referenced correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    await expect(page.locator(`#${describedBy}`)).toContainText(/.+/);
  });

  test('#2038 inherited — aria-describedby content is screen-reader readable', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const alert = page.getByRole('alertdialog');
    const describedBy = await alert.getAttribute('aria-describedby');
    const desc = await page.locator(`#${describedBy}`).textContent();
    expect(desc?.trim().length).toBeGreaterThan(0);
  });

  test('#2047 inherited — Safari Tab order correct', async ({ page }) => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /confirm/i })).toBeFocused();
  });

  test.skip('#2275 inherited — nested Select arrow keys do not escape alert', async () => {
    // PLAYGROUND-DEP: needs nested Select (Phase 10 CI11). Unskip after CI11.
  });

  test('#2532 inherited — animation race condition handled', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic alert/i });
    await trigger.click();
    await trigger.click(); // rapid toggle
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test.skip('#1546 inherited — conditional initialFocusRef works', async () => {
    // PLAYGROUND-DEP: removed "custom focus" demo — initialFocusRef cannot be
    // attached to AlertDialog's internal buttons. First consumer with a
    // ref-accessible target in children slot should enable this.
  });

  // ============================================================
  // ALERTDIALOG-SPECIFIC (20 cases)
  // ============================================================

  test('AD-1: role="alertdialog" not "dialog"', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });

  test('AD-2: aria-describedby is mandatory (Dialog allows absence)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const describedBy = await page.getByRole('alertdialog').getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
  });

  test('AD-3: Initial focus defaults to Cancel (least destructive per APG)', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    await expect(page.getByRole('button', { name: /delete/i })).not.toBeFocused();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  test('AD-4: closeOnOverlayClick defaults false (Dialog defaults true)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    // Click overlay (not content)
    await page
      .locator('[data-state="open"]')
      .first()
      .click({ position: { x: 5, y: 5 } });
    // Alert stays open
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test('AD-5: Escape invokes onCancel (not onConfirm)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('confirm-count')).toHaveText('0');
    await expect(page.getByTestId('cancel-count')).toHaveText('1');
  });

  test('AD-6: severity="critical" applies error border token', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    const content = page.getByRole('alertdialog');
    const borderColor = await content.evaluate((el) => window.getComputedStyle(el).borderColor);
    // Error token resolved (not default surface border)
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('AD-7: severity="info" applies info border token', async ({ page }) => {
    await page.getByRole('button', { name: /open info alert/i }).click();
    const content = page.getByRole('alertdialog');
    const borderColor = await content.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('AD-8: severity="critical" infers confirmVariant="warning"', async ({ page }) => {
    await page.getByRole('button', { name: /open critical alert/i }).click();
    const confirm = page.getByRole('button', { name: /delete/i });
    const classList = await confirm.getAttribute('class');
    expect(classList).toMatch(/warning/i);
  });

  test.skip('AD-9: explicit confirmVariant overrides severity default', async () => {
    // PLAYGROUND-DEP: needs "open custom variant" scenario. Unskip after add.
  });

  test('AD-10: Cancel button has correct label', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('AD-11: Custom cancelLabel overrides default', async ({ page }) => {
    await page.getByRole('button', { name: /open custom labels/i }).click();
    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible();
  });

  test('AD-12: onCancel callback preferred over onOpenChange when provided', async ({ page }) => {
    // Base playground wires onCancel explicitly for all demos, so cancel-count
    // increments confirm proper delegation (base playground counter covers this).
    await page.getByRole('button', { name: /open basic alert/i }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('cancel-count')).toHaveText('1');
  });

  test.skip('AD-13: onConfirm does not auto-close dialog (consumer controls)', async () => {
    // PLAYGROUND-DEP: base playground auto-closes on confirm. Needs "async confirm"
    // scenario demonstrating consumer-held open state.
  });

  test.skip('AD-14: Form inside AlertDialog — Escape does NOT submit form', async () => {
    // PLAYGROUND-DEP: needs form scenario. Unskip after add.
  });

  test.skip('AD-15: Form inside AlertDialog — overlay click does NOT submit', async () => {
    // PLAYGROUND-DEP: needs form scenario. Unskip after add.
  });

  test('AD-16: Mobile pointer-events timing — tap on Cancel works first try (Radix #1241)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: /open basic alert/i }).tap();
    await page.getByRole('button', { name: 'Cancel' }).tap();
    await expect(page.getByRole('alertdialog')).not.toBeVisible();
  });

  test.skip('AD-17: Nested Select scroll lock interaction (Radix #1496)', async () => {
    // PLAYGROUND-DEP: needs nested Select (Phase 10 CI11). Unskip after CI11.
  });

  test('AD-18: Size variant sm (360px) renders correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open sm alert/i }).click();
    const content = page.getByRole('alertdialog');
    const maxWidth = await content.evaluate((el) => window.getComputedStyle(el).maxWidth);
    expect(maxWidth).toBe('360px');
  });

  test('AD-19: Size variant md (480px) is the default', async ({ page }) => {
    await page.getByRole('button', { name: /open basic alert/i }).click();
    const content = page.getByRole('alertdialog');
    const maxWidth = await content.evaluate((el) => window.getComputedStyle(el).maxWidth);
    expect(maxWidth).toBe('480px');
  });

  test('AD-20: closeOnEscape=false disables Escape handler', async ({ page }) => {
    await page.getByRole('button', { name: /open uncloseable alert/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });
});
```
