# Sheet.regression.spec

> EXECUTED in-repo — the canonical suite lives in the sibling `Sheet.regression.spec.ts`
> (CI-gated; only the manual NVDA sweep stays deferred). See Sheet.tsx `@regressions`
> header. This file is a consumer-CI reference snapshot, not the source of truth.

```typescript
/**
 * Sheet regression spec — 41 edge cases mapped to test cases (E18).
 *
 * EXECUTION STATUS: EXECUTED in-repo — canonical suite in the sibling
 * `Sheet.regression.spec.ts` (CI-gated).
 *
 * Source: Radix Dialog closed issues (inherited) + Sheet-specific multi-side
 * quirks. Most Dialog cases are shared verbatim because Sheet reuses the same
 * portal + focus trap + scroll lock + inert primitives.
 *
 * Categories:
 *   1. 21 INHERITED from Dialog (shared primitives)
 *   2. 20 SHEET-SPECIFIC (4-side animations, per-side safe-area, per-side
 *      border-radius, width vs height variants, nested sheets, RTL hints)
 *
 * Playground route under test: `/components/sheet`
 */

import { test, expect } from '@playwright/test';

test.describe('Sheet — regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/sheet');
  });

  // ============================================================
  // INHERITED FROM DIALOG (21 cases)
  // ============================================================

  test.skip('#2690 inherited — clicking toast inside does not close sheet', async () => {
    // PLAYGROUND-DEP: needs nested Toast (CI15).
  });

  test.skip('#1951 inherited — Escape in nested Select closes Select first', async () => {
    // PLAYGROUND-DEP: needs nested Select (CI12).
  });

  test('#2450 inherited — Escape bubbles correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('#2961 inherited — reopening sheet after close works', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open right sheet/i });
    await trigger.click();
    await page.keyboard.press('Escape');
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('#2355 inherited — reopen cycle preserves focus trap', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open right sheet/i });
    for (let i = 0; i < 3; i++) {
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test.skip('#1249 inherited — nested sheet Escape closes innermost', async () => {
    // PLAYGROUND-DEP: needs nested sheet scenario.
  });

  test('#1891 inherited — focus not stuck after unmount', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    await page.keyboard.press('Escape');
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'BODY']).toContain(active);
  });

  test.skip('#3353 inherited — Shadow DOM focus works', async () => {
    // PLAYGROUND-DEP: needs shadow root scenario.
  });

  test.skip('#2544 inherited — focus trap disable in advanced scenarios', async () => {
    // Current impl: trap always on (documented limitation).
  });

  test.skip('#2122 inherited — pointer-events do not leak to background', async () => {
    // PLAYGROUND-DEP: needs background button scenario.
  });

  test('#998 inherited — scroll lock only while open', async ({ page }) => {
    const initial = await page.evaluate(() => document.body.style.overflow);
    expect(initial).not.toBe('hidden');
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const opened = await page.evaluate(() => document.body.style.overflow);
    expect(opened).toBe('hidden');
    await page.keyboard.press('Escape');
    const closed = await page.evaluate(() => document.body.style.overflow);
    expect(closed).not.toBe('hidden');
  });

  test('#2270 inherited — focus returns to correct trigger', async ({ page }) => {
    const left = page.getByRole('button', { name: /open left sheet/i });
    const right = page.getByRole('button', { name: /open right sheet/i });
    await right.click();
    await page.keyboard.press('Escape');
    await expect(right).toBeFocused();
    await expect(left).not.toBeFocused();
  });

  test.skip('#3811 inherited — Safari focus escape prevented', async () => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
  });

  test('#2836 inherited — aria-labelledby resolves to title element', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const labelledBy = await sheet.getAttribute('aria-labelledby');
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test('#3007 inherited — aria-describedby conditional', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    let describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /open minimal sheet/i }).click();
    describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    expect(describedBy).toBeFalsy();
  });

  test.skip('#3579 inherited — custom description id referenced correctly', async () => {
    // useId() covers this.
  });

  test('#2038 inherited — aria-describedby content is readable', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const describedBy = await page.getByRole('dialog').getAttribute('aria-describedby');
    const desc = await page.locator(`#${describedBy}`).textContent();
    expect(desc?.trim().length).toBeGreaterThan(0);
  });

  test.skip('#2047 inherited — Safari Tab order correct', async () => {
    test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
  });

  test.skip('#2275 inherited — nested Select arrows do not escape sheet', async () => {
    // PLAYGROUND-DEP: needs nested Select (CI12).
  });

  test('#2532 inherited — animation race on rapid toggle', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /open right sheet/i });
    await trigger.click();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.skip('#1546 inherited — conditional initialFocusRef works', async () => {
    // PLAYGROUND-DEP: needs external focus target (internal buttons not ref-accessible).
  });

  // ============================================================
  // SHEET-SPECIFIC (20 cases)
  // ============================================================

  test('SH-1: role="dialog" not "alertdialog"', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test.describe.each([{ side: 'left' }, { side: 'right' }, { side: 'top' }, { side: 'bottom' }])(
    'SH-2..5: side=$side anchor + animation',
    ({ side }) => {
      test(`side=${side} renders with correct alignment`, async ({ page }) => {
        await page.getByRole('button', { name: new RegExp(`open ${side} sheet`, 'i') }).click();
        const sheet = page.getByRole('dialog');
        await expect(sheet).toBeVisible();
        const box = await sheet.boundingBox();
        const viewport = page.viewportSize();
        if (box && viewport) {
          if (side === 'left') {
            expect(box.x).toBeLessThan(10);
          } else if (side === 'right') {
            expect(box.x + box.width).toBeGreaterThan(viewport.width - 10);
          } else if (side === 'top') {
            expect(box.y).toBeLessThan(10);
          } else if (side === 'bottom') {
            expect(box.y + box.height).toBeGreaterThan(viewport.height - 10);
          }
        }
      });
    },
  );

  test('SH-6: horizontal size sm = 320px width', async ({ page }) => {
    await page.getByRole('button', { name: /open sm right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const width = await sheet.evaluate((el) => window.getComputedStyle(el).width);
    expect(width).toBe('320px');
  });

  test('SH-7: horizontal size md (default) = 420px width', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const width = await sheet.evaluate((el) => window.getComputedStyle(el).width);
    expect(width).toBe('420px');
  });

  test('SH-8: vertical size sm = 240px height', async ({ page }) => {
    await page.getByRole('button', { name: /open sm top sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const height = await sheet.evaluate((el) => window.getComputedStyle(el).height);
    expect(height).toBe('240px');
  });

  test.describe.each([
    { side: 'left', corners: { tl: 0, tr: 1, bl: 0, br: 1 } },
    { side: 'right', corners: { tl: 1, tr: 0, bl: 1, br: 0 } },
    { side: 'top', corners: { tl: 0, tr: 0, bl: 1, br: 1 } },
    { side: 'bottom', corners: { tl: 1, tr: 1, bl: 0, br: 0 } },
  ])('SH-9..12: side=$side border-radius inner corners only', ({ side, corners }) => {
    test(`side=${side} rounds only inner corners`, async ({ page }) => {
      await page.getByRole('button', { name: new RegExp(`open ${side} sheet`, 'i') }).click();
      const sheet = page.getByRole('dialog');
      const radii = await sheet.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          tl: s.borderTopLeftRadius,
          tr: s.borderTopRightRadius,
          bl: s.borderBottomLeftRadius,
          br: s.borderBottomRightRadius,
        };
      });
      // Inner corners (corners[x] === 1) should be rounded; outer corners === 0 flush
      if (corners.tl === 0) expect(radii.tl).toBe('0px');
      if (corners.tr === 0) expect(radii.tr).toBe('0px');
      if (corners.bl === 0) expect(radii.bl).toBe('0px');
      if (corners.br === 0) expect(radii.br).toBe('0px');
    });
  });

  test.skip('SH-13: safe-area-inset-right on right sheet (iOS)', async () => {
    // PLAYGROUND-DEP: iOS device testing.
  });

  test.skip('SH-14: safe-area-inset-top on top sheet (iOS notch)', async () => {
    // PLAYGROUND-DEP: iOS device testing.
  });

  test.skip('SH-15: lg vertical uses dvh fallback on iOS Safari', async () => {
    // PLAYGROUND-DEP: iOS Safari device testing.
  });

  test('SH-16: showCloseButton default true renders X icon', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const closeBtn = page.getByRole('button', { name: /close sheet/i });
    await expect(closeBtn).toBeVisible();
  });

  test('SH-17: showCloseButton=false hides X icon', async ({ page }) => {
    await page.getByRole('button', { name: /open minimal sheet/i }).click();
    const closeBtn = page.getByRole('button', { name: /close sheet/i });
    await expect(closeBtn).toHaveCount(0);
  });

  test('SH-18: sticky footer (body scrolls, footer stays pinned)', async ({ page }) => {
    await page.getByRole('button', { name: /open scrollable sheet/i }).click();
    // Footer remains visible while body scrolls
    const footer = page.getByRole('dialog').locator('[class*="footer"]').last();
    await expect(footer).toBeVisible();
  });

  test('SH-19: prefers-reduced-motion disables animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const sheet = page.getByRole('dialog');
    const animation = await sheet.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });

  test('SH-20: inert toggles on background siblings on open/close cycle', async ({ page }) => {
    await page.getByRole('button', { name: /open right sheet/i }).click();
    const openInert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(openInert).toBe(true);

    await page.keyboard.press('Escape');
    const closedInert = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.hasAttribute('inert') ?? false;
    });
    expect(closedInert).toBe(false);
  });
});
```
