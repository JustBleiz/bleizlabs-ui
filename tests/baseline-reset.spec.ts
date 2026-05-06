/**
 * Baseline reset regression test.
 *
 * Verifies that `@use '@bleizlabs/ui/styles'` provides a conservative body
 * reset (zero margin, zero padding, viewport-tall min-height) and an html
 * `scroll-behavior: smooth` (with `prefers-reduced-motion` honored).
 *
 * Forensic: pre-fix the BASE STYLES section in `_semantics.scss` only
 * targeted `:root`, leaving `body` with browser-default `margin: 8px`.
 * Every consumer needed an `app/globals.scss` workaround. This test
 * pins the baseline so the regression cannot reintroduce silently.
 */

import { expect, test } from '@playwright/test';

test.describe('baseline reset', () => {
  test('body has zero margin + padding + min-height: 100dvh', async ({ page }) => {
    await page.goto('/');

    const body = await page.evaluate(() => {
      const cs = window.getComputedStyle(document.body);
      const dvh = window.innerHeight; // 100dvh resolves to viewport height
      return {
        marginTop: cs.marginTop,
        marginRight: cs.marginRight,
        marginBottom: cs.marginBottom,
        marginLeft: cs.marginLeft,
        paddingTop: cs.paddingTop,
        paddingRight: cs.paddingRight,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        minHeight: cs.minHeight,
        viewportHeight: dvh,
      };
    });

    expect(body.marginTop).toBe('0px');
    expect(body.marginRight).toBe('0px');
    expect(body.marginBottom).toBe('0px');
    expect(body.marginLeft).toBe('0px');

    expect(body.paddingTop).toBe('0px');
    expect(body.paddingRight).toBe('0px');
    expect(body.paddingBottom).toBe('0px');
    expect(body.paddingLeft).toBe('0px');

    // 100dvh resolves to the dynamic viewport height; allow ±1px for
    // browser rounding.
    const minHeightPx = parseFloat(body.minHeight);
    expect(Math.abs(minHeightPx - body.viewportHeight)).toBeLessThanOrEqual(1);
  });

  test('html honors prefers-reduced-motion for scroll-behavior', async ({ browser }) => {
    // No reduced motion → smooth
    const ctxSmooth = await browser.newContext({ reducedMotion: 'no-preference' });
    const pageSmooth = await ctxSmooth.newPage();
    await pageSmooth.goto('/');
    const smoothBehavior = await pageSmooth.evaluate(
      () => window.getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(smoothBehavior).toBe('smooth');
    await ctxSmooth.close();

    // Reduced motion → auto (instant)
    const ctxReduced = await browser.newContext({ reducedMotion: 'reduce' });
    const pageReduced = await ctxReduced.newPage();
    await pageReduced.goto('/');
    const reducedBehavior = await pageReduced.evaluate(
      () => window.getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(reducedBehavior).toBe('auto');
    await ctxReduced.close();
  });
});
