/**
 * Slider regression spec (E142 L3d2) — subset mapping to SL-R02..R29.
 *
 * Coverage:
 * - SL-R02 React 19 refs: no ref warnings
 * - SL-R03 No setState-in-render warnings [PLAYGROUND-DEP: no "external change" button]
 * - SL-R06 Drag past viewport clamps to bounds (no NaN)
 * - SL-R09 Decimal step precision (covered in keyboard spec — skip here)
 * - SL-R14 Controlled external override [PLAYGROUND-DEP]
 * - SL-R15 Uncontrolled defaultValue initializes correctly
 * - SL-R16 Touch drag [desktop Chromium no-touch — skip]
 * - SL-R21 Multi-thumb range [PLAYGROUND-DEP]
 * - SL-R23 prefers-reduced-motion no long transitions
 * - SL-R24 Form participation: hidden input syncs with value
 * - SL-R25 onValueCommit fires on keyboard keyup
 * - Inverted rendering keeps aria-valuenow value unchanged
 *
 * Playground: /components/slider
 */

import { test, expect } from '@playwright/test';

test.describe('Slider — regression guards', () => {
  test('SL-R02 — React 19 refs: no console warnings on mount', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/slider');
    await expect(page.getByRole('slider').first()).toBeVisible();
    expect(
      warnings.filter((w) => w.toLowerCase().includes('ref')),
    ).toHaveLength(0);
  });

  test.skip('SL-R03 — no setState-in-render warnings [PLAYGROUND-DEP: no external value change button]', async () => {
    // Requires a button that mutates controlled value mid-render; not present.
  });

  test('SL-R06 — drag past viewport clamps to min (no NaN)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    const box = await thumb.boundingBox();
    if (!box) throw new Error('No thumb bounds');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Drag far past viewport bounds
    await page.mouse.move(-500, -500);
    await page.mouse.up();
    const value = Number(await thumb.getAttribute('aria-valuenow'));
    expect(Number.isNaN(value)).toBe(false);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
    // Clamped at min
    expect(value).toBe(0);
  });

  test.skip('SL-R14 — controlled external override mid-drag [PLAYGROUND-DEP: no external setter]', async () => {});

  test('SL-R15 — uncontrolled defaultValue initializes aria-valuenow', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const thumb = basic.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '25');
  });

  test.skip('SL-R16 — touch pointer drag [Desktop Chromium has no touch context]', async () => {
    // Playground is desktop-only per L3a/L3b lessons. Touch testing belongs
    // in a mobile project if added.
  });

  test.skip('SL-R21 — multi-thumb range slider [PLAYGROUND-DEP: single-thumb only in v1.0]', async () => {});

  test('SL-R23 — prefers-reduced-motion: no long transitions on thumb', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    const thumb = page.getByRole('slider').first();
    const transition = await thumb.evaluate(
      (el) => window.getComputedStyle(el).transition,
    );
    // Reduced-motion global CSS clamps transitions to 0.001s (per a11y pipeline).
    expect(transition).toMatch(/none|0s|0\.001s/);
  });

  test('SL-R24 — form participation: hidden input syncs value', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    // Section 11 — form with name="quality" defaultValue=75
    const section = page.locator('section').nth(10);
    const hidden = section.locator('input[name="quality"][type="range"]');
    // Native value is 75 initially (source uses type="range")
    await expect(hidden).toHaveValue('75');
    // Change via keyboard and hidden input follows
    const thumb = section.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(hidden).toHaveValue('76');
  });

  test('SL-R25 — onValueCommit fires on keyboard commit', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    // Section 10 — Commit boundary defaultValue=50, logs to "Last commits" text
    const section = page.locator('section').nth(9);
    const thumb = section.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    // "Last commits: 51" becomes visible
    await expect(section.getByText(/Last commits:.*51/)).toBeVisible();
  });

  test('Inverted rendering preserves aria-valuenow semantics', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/slider');
    const sections = page.locator('section');
    const inverted = sections.nth(6);
    const thumb = inverted.getByRole('slider');
    // Starts at 70 (playground state)
    await expect(thumb).toHaveAttribute('aria-valuenow', '70');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuenow', '71');
  });

  test('SSR safe — no hydration warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/slider');
    await page.reload();
    await expect(page.getByRole('slider').first()).toBeVisible();
    expect(
      warnings.filter((w) => w.toLowerCase().includes('hydration')),
    ).toHaveLength(0);
  });
});
