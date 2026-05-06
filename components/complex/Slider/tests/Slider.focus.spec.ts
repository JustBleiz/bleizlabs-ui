/**
 * Slider focus behavior spec (E142 L3d2 + L4 F11/F12 library fixes).
 *
 * Coverage:
 * - SL-R05 Track click jumps to position AND focuses thumb (rAF-deferred)
 * - SL-R10 Pointer capture cleanup on unmount [PLAYGROUND-DEP: no unmount toggle]
 * - SL-R22 Disabled: aria-disabled + thumb tabIndex=0 (focusable for SR discovery)
 * - Read-only: thumb focusable, keyboard no-op
 *
 * Playground: /components/slider
 *   idx 0: Basic (no label — uses "Basic slider")
 *   idx 8: Disabled + readOnly (two rows)
 *
 * SliderThumb now sets `tabIndex={0}` unconditionally (F11) so disabled
 * sliders stay Tab-reachable for SR discovery (library convention used by
 * Select / Tabs / NavigationMenu — aria-disabled with focus preserved).
 * Track-click focus call is wrapped in `requestAnimationFrame` (F12) so the
 * browser's own pointerdown focus-dispatch settles before we steal focus
 * for the thumb.
 */

import { test, expect } from '@playwright/test';

test.describe('Slider — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
  });

  test('SL-R05 — track click jumps position AND thumb receives focus (F12)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const volume = sections.nth(1);
    const thumb = volume.getByRole('slider');
    const track = volume.locator('span[class*="track"]').first();
    const box = await track.boundingBox();
    if (!box) throw new Error('No track bounds');
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
    const after = Number(await thumb.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(30);
    // F12 — rAF-deferred focus call lands reliably on the thumb now.
    await expect(thumb).toBeFocused();
  });

  test.skip('SL-R10 — pointer capture cleanup on unmount [PLAYGROUND-DEP: no unmount demo]', async () => {
    // Would need a "mount/unmount" toggle button; not present in playground.
  });

  test('SL-R22 — disabled thumb has aria-disabled + tabIndex=0 (focusable for SR, F11)', async ({
    page,
  }) => {
    const thumb = page
      .getByRole('slider', { name: 'Disabled (aria-disabled, focusable)' })
      .first();
    await expect(thumb).toHaveAttribute('aria-disabled', 'true');
    // F11 — disabled thumb stays focusable, aligning runtime with the
    // docblock claim + library convention (Select/Tabs/NavigationMenu).
    const tabindex = await thumb.getAttribute('tabindex');
    expect(tabindex).toBe('0');
  });

  test('Read-only thumb is focusable (tabIndex=0), keyboard no-op', async ({
    page,
  }) => {
    const thumb = page
      .getByRole('slider', { name: 'Read-only (focusable, no changes)' })
      .first();
    await thumb.focus();
    await expect(thumb).toBeFocused();
    const before = await thumb.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', before as string);
  });

  test('Drag updates value AND lands focus on thumb after drag (F12)', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    const track = basic.locator('span[class*="track"]').first();
    const box = await track.boundingBox();
    if (!box) throw new Error('No track bounds');
    await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
    await page.mouse.up();
    const value = Number(await thumb.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThan(30);
    expect(value).toBeLessThan(70);
    // F12 — post-drag thumb focus now reliable under Playwright synthetic events.
    await expect(thumb).toBeFocused();
  });
});
