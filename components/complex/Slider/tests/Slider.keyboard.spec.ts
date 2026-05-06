/**
 * Slider keyboard interaction spec — APG `/slider/` (E142 L3d2).
 *
 * Coverage:
 * - SL-R01 RTL horizontal: ArrowLeft increases (mirror semantics)
 * - SL-R04 ArrowRight past max clamps at max (no NaN)
 * - SL-R07 ArrowRight fires onValueChange once (dedup via equality)
 * - SL-R08 Home/End no-op when min==max [PLAYGROUND-DEP: no demo — use basic Home]
 * - SL-R11 Shift+ArrowRight uses largeStep
 * - SL-R12 PageUp/PageDown use largeStep
 * - SL-R13 Vertical: ArrowUp always increases
 *
 * Playground: /components/slider
 *   idx 0: Basic defaultValue=25 (step 1, largeStep default 10)
 *   idx 1: Volume controlled (start 30)
 *   idx 2: Price 0-1000 step 10 (largeStep default 100, starts 250)
 *   idx 3: Temperature -20..40 step 0.5 (starts 22)
 *   idx 4: Opacity 0..1 step 0.05 (starts 0.65)
 *   idx 5: RTL (starts 40)
 *   idx 6: Inverted (starts 70)
 *   idx 7: Vertical (starts 50)
 *   idx 8: Disabled + Read-only
 *   idx 9: Commit boundary defaultValue=50
 *   idx 10: Form name="quality" defaultValue=75
 */

import { test, expect } from '@playwright/test';

test.describe('Slider — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
  });

  test('SL-R01 — RTL ArrowLeft increases value', async ({ page }) => {
    // Section 6 — RTL slider, starts at 40
    const sections = page.locator('section');
    const rtl = sections.nth(5);
    const thumb = rtl.getByRole('slider');
    await thumb.focus();
    const before = Number(await thumb.getAttribute('aria-valuenow'));
    await page.keyboard.press('ArrowLeft');
    const after = Number(await thumb.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(before);
  });

  test('Basic ArrowRight advances by 1 step (default step)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await thumb.focus();
    const before = Number(await thumb.getAttribute('aria-valuenow'));
    await page.keyboard.press('ArrowRight');
    const after = Number(await thumb.getAttribute('aria-valuenow'));
    expect(after).toBe(before + 1);
  });

  test('SL-R04 — ArrowRight past max clamps at max (no NaN)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await thumb.focus();
    // Press End to reach max=100, then ArrowRight attempts to exceed
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('ArrowRight');
    const value = await thumb.getAttribute('aria-valuenow');
    expect(value).toBe('100');
    expect(Number.isNaN(Number(value))).toBe(false);
  });

  test('SL-R07 — ArrowRight updates aria-valuenow exactly once (no double-fire)', async ({
    page,
  }) => {
    // Section 2 — Volume controlled, starts at 30. Visible chip reflects state.
    const sections = page.locator('section');
    const volume = sections.nth(1);
    const thumb = volume.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    // One step → 31; chip text matches
    await expect(thumb).toHaveAttribute('aria-valuenow', '31');
    await expect(volume.getByText('31%')).toBeVisible();
  });

  test.skip('SL-R08 — Home/End no-op when min==max [PLAYGROUND-DEP: no min==max demo]', async () => {
    // Playground has no section with min==max. Covered conceptually by
    // clampValue guard in source — documentable via unit test, not E2E.
  });

  test('SL-R11 — Shift+ArrowRight uses largeStep', async ({ page }) => {
    // Section 3 — Price 0-1000 step 10, largeStep default = step*10 = 100
    const sections = page.locator('section');
    const price = sections.nth(2);
    const thumb = price.getByRole('slider');
    await thumb.focus();
    const before = Number(await thumb.getAttribute('aria-valuenow'));
    await page.keyboard.press('Shift+ArrowRight');
    const after = Number(await thumb.getAttribute('aria-valuenow'));
    expect(after).toBe(before + 100);
  });

  test('SL-R12 — PageUp/PageDown use largeStep', async ({ page }) => {
    // Section 1 — Basic (step 1, largeStep default 10)
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await thumb.focus();
    const start = Number(await thumb.getAttribute('aria-valuenow'));
    await page.keyboard.press('PageUp');
    expect(Number(await thumb.getAttribute('aria-valuenow'))).toBe(start + 10);
    await page.keyboard.press('PageDown');
    expect(Number(await thumb.getAttribute('aria-valuenow'))).toBe(start);
  });

  test('SL-R13 — Vertical: ArrowUp increases regardless of layout', async ({
    page,
  }) => {
    // Section 8 — Vertical, starts at 50
    const sections = page.locator('section');
    const vertical = sections.nth(7);
    const thumb = vertical.getByRole('slider');
    await thumb.focus();
    const before = Number(await thumb.getAttribute('aria-valuenow'));
    await page.keyboard.press('ArrowUp');
    const after = Number(await thumb.getAttribute('aria-valuenow'));
    expect(after).toBeGreaterThan(before);
    // ArrowDown decreases
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const later = Number(await thumb.getAttribute('aria-valuenow'));
    expect(later).toBeLessThan(after);
  });

  test('Home/End go to min/max', async ({ page }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('Home');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('End');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
  });

  test('Ctrl/Alt/Meta modifiers ignored (browser hotkey passthrough)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await thumb.focus();
    const before = await thumb.getAttribute('aria-valuenow');
    await page.keyboard.press('Meta+ArrowRight');
    await page.keyboard.press('Control+ArrowRight');
    await page.keyboard.press('Alt+ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', before as string);
  });

  test('Decimal step precision (0.05) — three ArrowRight presses land exactly', async ({
    page,
  }) => {
    // Section 5 — Opacity 0..1 step 0.05, starts 0.65
    const sections = page.locator('section');
    const opacity = sections.nth(4);
    const thumb = opacity.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const value = Number(await thumb.getAttribute('aria-valuenow'));
    // Precision: 0.15 exact, not 0.30000000000000004 style drift
    expect(value).toBe(0.15);
  });
});
