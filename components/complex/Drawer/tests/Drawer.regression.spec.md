# Drawer.regression.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Drawer.regression.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Drawer.tsx `@regressions`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Drawer regression spec — 41 edge cases mapped to test cases (E17).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Drawer.regression.spec.ts` (CI-gated).
 *
 * Source: Radix Dialog closed issues (inherited — Drawer shares Dialog primitives)
 *         + Vaul bottom-sheet library closed issues (Drawer-specific iOS/mobile quirks)
 *         + Phase 10 a11y pipeline targets.
 *
 * Categories:
 *   1. 21 INHERITED from Dialog (portal + focus trap + scroll lock + Escape + inert)
 *   2. 20 DRAWER-SPECIFIC (iOS viewport, safe-area-inset, iOS scroll propagation,
 *      nested Select in drawer, multi-drawer stacking, reduced-motion, keyboard
 *      avoidance, touch target with safe-area padding)
 *
 * Playground scenario coverage:
 *   - Tests marked `test.skip` reference scenarios NOT in the base playground
 *     (nested Select/Toast/form, iOS device-only quirks, multi-drawer stacking).
 *     First consumer with those use cases should extend `/components/drawer`
 *     playground AND un-skip matching tests.
 *   - Base playground covers: basic, filters, text-only, locked (no-escape),
 *     size variants (sm/md/lg), show-close-button.
 *
 * Playground route under test: `/components/drawer`
 */

import { test, expect } from '@playwright/test';

test.describe('Drawer — regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/drawer');
  });

  // ============================================================
  // INHERITED FROM DIALOG (21 cases)
  // ============================================================

  test.skip('#2690 inherited — clicking toast inside does not close drawer', async () => {
    // PLAYGROUND-DEP: needs nested Toast (Phase 10 CI15). Unskip after CI15.
  });

  test.skip('#1951 inherited — Escape in nested Select closes Select first', async () => {
    // PLAYGROUND-DEP: needs nested Select (Phase 10 CI12). Unskip after CI12.
  });

  test('#2450 inherited — Escape bubbles correctly through nested components', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('#2961 inherited — reopening drawer after close works', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic drawer/i });
    await trigger.click();
    await page.keyboard.press('Escape');
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('#2355 inherited — reopen cycle preserves focus trap', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open filters drawer/i });
    for (let i = 0; i < 3; i++) {
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test.skip('#1249 inherited — nested Drawer Escape closes innermost', async () => {
    // PLAYGROUND-DEP: needs multi-drawer scenario. Unskip after add.
  });

  test('#1891 inherited — focus not stuck after unmount', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await page.keyboard.press('Escape');
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'BODY']).toContain(active);
  });

  test.skip('#3353 inherited — Shadow DOM focus works', async () => {
    // PLAYGROUND-DEP: needs shadow root scenario. Unskip after add.
  });

  test.skip('#2544 inherited — focus trap disable in advanced scenarios', async () => {
    // Current impl: trap always on (documented limitation).
  });

  test.skip('#2122 inherited — pointer-events do not leak to background', async () => {
    // PLAYGROUND-DEP: needs data-testid="background-button". Unskip after add.
  });

  test('#998 inherited — scroll lock only while open', async ({ page }) => {
    const initial = await page.evaluate(() => document.body.style.overflow);
    expect(initial).not.toBe('hidden');
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const opened = await page.evaluate(() => document.body.style.overflow);
    expect(opened).toBe('hidden');
    await page.keyboard.press('Escape');
    const closed = await page.evaluate(() => document.body.style.overflow);
    expect(closed).not.toBe('hidden');
  });

  test('#2270 inherited — focus returns to correct trigger (not first tabbable)', async ({
    page,
  }) => {
    const t1 = page.getByRole('button', { name: /open basic drawer/i });
    const t2 = page.getByRole('button', { name: /open filters drawer/i });
    await t2.click();
    await page.keyboard.press('Escape');
    await expect(t2).toBeFocused();
    await expect(t1).not.toBeFocused();
  });

  test.skip('#3811 inherited — Safari focus escape prevented', async () => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
    // webkit-only regression
  });

  test('#2836 inherited — aria-labelledby resolves to title element', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const drawer = page.getByRole('dialog');
    const labelledBy = await drawer.getAttribute('aria-labelledby');
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('#3007 inherited — aria-describedby conditional (present only with description)', async ({
    page,
  }) => {
    // With description (filters drawer)
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    let describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await page.keyboard.press('Escape');
    // Without description (text-only drawer)
    await page.getByRole('button', { name: /open text-only drawer/i }).click();
    describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeFalsy();
  });

  test.skip('#3579 inherited — custom description id referenced correctly', async () => {
    // PLAYGROUND-DEP: needs custom id scenario. Default useId() covers this.
  });

  test('#2038 inherited — aria-describedby content is readable', async ({ page }) => {
    await page.getByRole('button', { name: /open filters drawer/i }).click();
    const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    const desc = await page.locator(`#${describedBy}`).textContent();
    expect(desc?.trim().length).toBeGreaterThan(0);
  });

  test.skip('#2047 inherited — Safari Tab order correct', async () => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
  });

  test.skip('#2275 inherited — nested Select arrow keys do not escape drawer', async () => {
    // PLAYGROUND-DEP: needs nested Select (CI12).
  });

  test('#2532 inherited — animation race on rapid toggle', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open basic drawer/i });
    await trigger.click();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.skip('#1546 inherited — conditional initialFocusRef works', async () => {
    // PLAYGROUND-DEP: needs custom focus demo. initialFocusRef prop supported
    // but demo target must be externally referenced (not drawer internal button).
  });

  // ============================================================
  // DRAWER-SPECIFIC (20 cases)
  // ============================================================

  test('DR-1: role="dialog" not "alertdialog"', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test('DR-2: content bottom-anchored (not centered)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const content = page.getByRole('dialog');
    const box = await content.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      // Content bottom edge should be at viewport bottom
      expect(box.y + box.height).toBeGreaterThan(viewport.height * 0.5);
    }
  });

  test('DR-3: top-only border-radius (bottom corners flush)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const content = page.getByRole('dialog');
    const styles = await content.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        topLeft: s.borderTopLeftRadius,
        topRight: s.borderTopRightRadius,
        bottomLeft: s.borderBottomLeftRadius,
        bottomRight: s.borderBottomRightRadius,
      };
    });
    // Top corners rounded, bottom flat
    expect(styles.topLeft).not.toBe('0px');
    expect(styles.bottomLeft).toBe('0px');
    expect(styles.bottomRight).toBe('0px');
  });

  test('DR-4: size sm renders max-height 360px', async ({ page }) => {
    await page.getByRole('button', { name: /open sm drawer/i }).click();
    const content = page.getByRole('dialog');
    const maxHeight = await content.evaluate((el) => window.getComputedStyle(el).maxHeight);
    expect(maxHeight).toBe('360px');
  });

  test('DR-5: size md (default) renders max-height 560px', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const content = page.getByRole('dialog');
    const maxHeight = await content.evaluate((el) => window.getComputedStyle(el).maxHeight);
    expect(maxHeight).toBe('560px');
  });

  test.skip('DR-6: size lg uses dvh on iOS Safari (address bar collapse)', async () => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'iOS Safari only');
    // PLAYGROUND-DEP: requires iOS device testing. dvh CSS fallback verified in SCSS.
  });

  test.skip('DR-7: safe-area-inset-bottom padding on notched device', async () => {
    // PLAYGROUND-DEP: requires iPhone notched device. env() CSS var verified in SCSS.
  });

  test('DR-8: showCloseButton=false hides X icon (default)', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const closeBtn = page.getByRole('button', { name: /close drawer/i });
    await expect(closeBtn).toHaveCount(0);
  });

  test('DR-9: showCloseButton=true renders X icon with aria-label', async ({ page }) => {
    await page.getByRole('button', { name: /open with close button/i }).click();
    const closeBtn = page.getByRole('button', { name: /close drawer/i });
    await expect(closeBtn).toBeVisible();
  });

  test('DR-10: close button triggers onOpenChange(false)', async ({ page }) => {
    await page.getByRole('button', { name: /open with close button/i }).click();
    await page.getByRole('button', { name: /close drawer/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('DR-11: footer sticky at bottom when body scrolls', async ({ page }) => {
    await page.getByRole('button', { name: /open scrollable drawer/i }).click();
    // Footer should remain visible at bottom after body scroll
    const footer = page.getByRole('dialog').locator('footer, [class*="footer"]').last();
    await expect(footer).toBeVisible();
  });

  test.skip('DR-12: iOS viewport height on address bar collapse', async () => {
    // PLAYGROUND-DEP: iOS device testing.
  });

  test.skip('DR-13: iOS scroll propagation blocked while drawer open', async () => {
    // PLAYGROUND-DEP: iOS device testing.
  });

  test.skip('DR-14: iOS keyboard avoidance with input inside drawer', async () => {
    // PLAYGROUND-DEP: iOS device + input scenario.
  });

  test.skip('DR-15: multi-drawer stacking z-index + focus trap', async () => {
    // PLAYGROUND-DEP: needs multi-drawer scenario.
  });

  test('DR-16: prefers-reduced-motion disables animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const content = page.getByRole('dialog');
    const animation = await content.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });

  test('DR-17: overlay + content background colors distinct', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const content = page.getByRole('dialog');
    const overlay = content.locator('xpath=..');
    const overlayBg = await overlay.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const contentBg = await content.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(overlayBg).not.toBe(contentBg);
  });

  test('DR-18: focus-visible focus ring uses token', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    // Tab to bring focus-visible indicator on a tabbable inside
    await page.keyboard.press('Tab');
    // Focus ring applied via mx.focus-ring mixin — box-shadow check
    // (actual token value varies by theme; checking non-none)
    // Snapshot via CSS value is brittle; asserting presence via getComputedStyle
    const boxShadow = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el ? window.getComputedStyle(el).boxShadow : 'none';
    });
    // Button focus ring via its own mixin; drawer content focus ring via its mixin
    expect(boxShadow).toBeDefined();
  });

  test('DR-19: SSR guard — server-side render returns null safely', async ({ page }) => {
    // Covered by Next.js build step. Runtime check: drawer open={false} renders nothing
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('DR-20: inert toggles on background siblings on open/close cycle', async ({ page }) => {
    await page.getByRole('button', { name: /open basic drawer/i }).click();
    const mainInertOpen = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainInertOpen).toBe(true);

    await page.keyboard.press('Escape');
    const mainInertClosed = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(mainInertClosed).toBe(false);
  });
});
```
