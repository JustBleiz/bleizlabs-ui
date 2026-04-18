/**
 * ScrollArea ARIA semantics spec (E142 L3e).
 *
 * NOTE: No APG pattern covers scroll regions. WCAG 2.1.1 is satisfied via
 * viewport `tabIndex={0}` + native keyboard scroll. Custom scrollbars are
 * visual + pointer-drag only — they are NOT exposed with role="scrollbar"
 * or aria-valuemin/max/now (per ScrollArea.tsx @a11y docblock).
 *
 * Coverage:
 * - SA-R06 native scrollbar width hidden (scrollbar-width: none)
 * - SA-R07 custom scrollbars only render when content overflows
 * - SA-R08 touch context: scroll preserved [PLAYGROUND-DEP: tap crash —
 *   skipped to match lessons file note about Chromium no-touch]
 * - axe-core zero violations (default playground + after scroll + hover)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('ScrollArea — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/scroll-area');
  });

  test('SA-R06 — native scrollbars hidden (scrollbar-width: none)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    const scrollbarWidth = await viewport.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('scrollbar-width'),
    );
    expect(scrollbarWidth).toBe('none');
  });

  test('SA-R07 — custom scrollbars only render when content overflows', async ({
    page,
  }) => {
    // Section 7 — Content fits, no scrollbars should be rendered.
    const sections = page.locator('section');
    const fitsSection = sections.nth(6);
    // When content fits, the scrollbar <div> is not rendered at all
    // (per ScrollArea.tsx:473 `if (!shouldRender) return null`).
    const thumbsInFitsSection = fitsSection.locator('[data-scroll-area-thumb]');
    await expect(thumbsInFitsSection).toHaveCount(0);

    // Section 1 — overflow, scrollbars render.
    const basicSection = sections.nth(0);
    const basicThumbs = basicSection.locator('[data-scroll-area-thumb]');
    // At least the vertical thumb is rendered.
    expect(await basicThumbs.count()).toBeGreaterThan(0);
  });

  test.skip('SA-R08 — touch pointer: native scroll preserved [PLAYGROUND-DEP: desktop Chromium no-touch]', async () => {
    // Desktop Chromium has no touch context — touchscreen.tap() throws
    // "page does not support tap" per L3a+L3b lessons. Coarse-pointer
    // (visibility="auto") behavior is covered indirectly in focus spec.
  });

  test('Viewport is keyboard-focusable via tabIndex=0 (WCAG 2.1.1)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await expect(viewport).toHaveAttribute('tabindex', '0');
  });

  test('Scrollbar has data-orientation attribute matching prop', async ({ page }) => {
    const sections = page.locator('section');
    const always = sections.nth(1);
    const verticalBar = always.locator('[data-orientation="vertical"]').first();
    await expect(verticalBar).toBeVisible();
  });

  test.skip('Corner renders when both axes scroll [PLAYGROUND-DEP: demo tables compress, no horizontal overflow]', async () => {
    // Corner renders only when both `hasVerticalScroll` AND
    // `hasHorizontalScroll` are true (ScrollArea.tsx:653). Playground
    // table at 960px max-width does not overflow horizontally, so the
    // corner path is never exercised. Skipped alongside SA-R09.
  });

  test('aria snapshot of basic scroll area contains focusable viewport', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    // `ariaSnapshot()` on a scrollable non-semantic div renders its content.
    const snapshot = await viewport.ariaSnapshot();
    // Snapshot should contain the paragraph text we know is inside.
    expect(snapshot.toLowerCase()).toContain('lorem ipsum');
  });

  test('axe-core zero violations — default playground', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after scrolling the basic viewport', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    await viewport.evaluate((el) =>
      el.scrollTo({ top: 300, behavior: 'instant' }),
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after hover activates hover-mode scrollbar', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const hoverSection = sections.nth(2);
    const root = hoverSection.locator('[data-visibility="hover"]').first();
    await root.hover();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
