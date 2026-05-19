/**
 * ScrollArea regression spec (E142 L3e).
 *
 * Coverage:
 * - SA-R09 orientation both: horizontal + vertical scrollbars render independently
 * - SA-R10 autoHide: thumb opacity fades after scroll settles [visibility="scroll"]
 * - SA-R11 prefers-reduced-motion: track-click uses behavior:'instant'
 * - SA-R12 content mutation: ResizeObserver recalculates thumb size
 *   [PLAYGROUND-DEP: no "Add content" toggle — skipped]
 * - SA-R13 RTL: dir=rtl passed through to root
 *   [PLAYGROUND-DEP: no dir toggle — skipped]
 * - SA-R14 scroll shadow indicators [PLAYGROUND-DEP: data-overflow not emitted — skipped]
 * - SA-R15 SSR safe: no hydration warnings
 * - SA-R16 virtualized list [PLAYGROUND-DEP: no virtual demo — skipped]
 * - Extra: visibility="always" thumb stays visible when idle
 * - Extra: explicit composition slot renders all parts
 */

import { test, expect } from '@playwright/test';

test.describe('ScrollArea — regression cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/scroll-area');
  });

  test.skip('SA-R09 — both axes: horizontal + vertical scrollbars [PLAYGROUND-DEP: demo tables do not horizontally overflow at 960px max-width]', async () => {
    // Sections 5/6 render 8-column tables inside a max-width:960px page
    // wrapper. Measured `scrollWidth === clientWidth === 960` — the table
    // compresses instead of overflowing, so `shouldRender` for the
    // horizontal scrollbar is false. To exercise horizontal scroll we'd
    // need a demo scenario with `min-width` forcing overflow (e.g., 40+
    // narrow columns or `white-space: nowrap` long rows). Skipping rather
    // than relaxing the assertion — test intent preserved for the day the
    // playground adds a true horizontal-overflow scenario.
  });

  test('SA-R10 — visibility="scroll": thumb hidden after scroll settles (hideDelay=600ms)', async ({
    page,
  }) => {
    // Section 1 — Basic, default visibility="scroll".
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const viewport = basic.locator('div[tabindex="0"]').first();
    const scrollbar = basic.locator('[data-orientation="vertical"]').first();
    // Trigger scroll -> isScrolling=true -> data-visible='true'.
    await viewport.evaluate((el) => el.scrollTo({ top: 100, behavior: 'instant' }));
    // Dispatch a scroll event explicitly because programmatic scrollTo does
    // fire scroll but we want deterministic timing before the hide timer.
    await expect(scrollbar).toHaveAttribute('data-visible', 'true', {
      timeout: 2000,
    });
    // After 600ms + small margin, hide timer fires -> data-visible removed.
    await page.waitForTimeout(900);
    await expect(scrollbar).not.toHaveAttribute('data-visible', 'true');
  });

  test('SA-R11 — prefers-reduced-motion: track-click uses instant scroll', async ({ page }) => {
    // reducedMotion set in beforeEach. Section 2 (always-visible scrollbar).
    const sections = page.locator('section');
    const always = sections.nth(1);
    const scrollbar = always.locator('[data-orientation="vertical"][data-visible="true"]').first();
    await scrollbar.scrollIntoViewIfNeeded();
    const viewport = always.locator('div[tabindex="0"]').first();
    const box = await scrollbar.boundingBox();
    if (!box) throw new Error('No scrollbar box');
    // Click near the bottom of the track — should page down. With PRM,
    // ScrollArea.tsx:446 picks 'instant' behavior, so scroll lands on the
    // same frame without smooth interpolation.
    const initial = await viewport.evaluate((el) => el.scrollTop);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height - 10);
    // Instant behavior — scrollTop should be > initial without long poll.
    await expect
      .poll(async () => viewport.evaluate((el) => el.scrollTop), { timeout: 1000 })
      .toBeGreaterThan(initial);
  });

  test.skip('SA-R12 — content mutation triggers ResizeObserver [PLAYGROUND-DEP: no Add-content toggle]', async () => {
    // Playground has no mutate-content button. ResizeObserver is wired in
    // ScrollArea.tsx:234 and observes viewport + first-child; would need a
    // demo that appends content at runtime to assert thumb resize.
  });

  test.skip('SA-R13 — RTL mirror [PLAYGROUND-DEP: no dir=rtl toggle in playground]', async () => {
    // Playground does not expose a dir toggle. ScrollArea accepts dir="rtl"
    // and passes it to the root element, but we cannot drive it from the
    // demo surface.
  });

  test.skip('SA-R14 — scroll shadow indicators [PLAYGROUND-DEP: data-overflow attribute not emitted by source]', async () => {
    // Source does not expose data-overflow / shadow indicators — not in
    // v1.0 feature set. Keeping the test id as a marker for future work.
  });

  test('SA-R15 — SSR safe: no hydration warnings on reload', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    page.on('pageerror', (err) => warnings.push(err.message));
    await page.goto('/components/scroll-area');
    await page.reload();
    const hydrationIssues = warnings.filter((w) => w.toLowerCase().includes('hydration'));
    expect(hydrationIssues).toEqual([]);
  });

  test.skip('SA-R16 — virtualized list integration [PLAYGROUND-DEP: no virtualized demo]', async () => {
    // Plain scroll area in v1.0. Virtualization integration deferred.
  });

  test('visibility="always" keeps scrollbar visible regardless of scroll activity', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const always = sections.nth(1);
    const scrollbar = always.locator('[data-orientation="vertical"]').first();
    // Already visible on load because shouldBeVisible -> visibility=always -> true.
    await expect(scrollbar).toHaveAttribute('data-visible', 'true');
    await page.waitForTimeout(800);
    // Still visible after idle — no autohide for always.
    await expect(scrollbar).toHaveAttribute('data-visible', 'true');
  });

  test('Explicit composition slot renders viewport + scrollbar + thumb', async ({ page }) => {
    // Section 8 — explicit composition. Viewport + vertical scrollbar +
    // thumb all render. Horizontal scrollbar is present in the JSX but
    // `shouldRender` returns false (no horizontal overflow at 960px max).
    const sections = page.locator('section');
    const explicit = sections.nth(7);
    const viewport = explicit.locator('div[tabindex="0"]').first();
    await expect(viewport).toBeVisible();
    // Exactly one vertical thumb (scrollbar + thumb both carry
    // data-orientation, so select the thumb specifically).
    await expect(
      explicit.locator('[data-scroll-area-thumb][data-orientation="vertical"]'),
    ).toHaveCount(1);
    // Scrollbar with visibility="always" -> data-visible="true".
    await expect(
      explicit.locator('[data-visible="true"][data-orientation="vertical"]'),
    ).toHaveCount(1);
  });

  test('Content-fits viewport renders no scrollbars (section 7)', async ({ page }) => {
    const sections = page.locator('section');
    const fits = sections.nth(6);
    const viewport = fits.locator('div[tabindex="0"]').first();
    await expect(viewport).toBeVisible();
    // No scrollbars rendered (shouldRender returns false when !hasScroll).
    await expect(fits.locator('[data-scroll-area-thumb]')).toHaveCount(0);
  });
});
