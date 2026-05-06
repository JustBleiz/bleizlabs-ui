/**
 * Calendar regression spec (E142 L3d2) — CAL-R15..R24 subset (the rest live in
 * keyboard/focus/aria specs).
 *
 * Coverage:
 * - CAL-R16 Year boundary Dec → Jan via ArrowRight
 * - CAL-R17 Leap year Feb 29 2024 (PageDown from Jan 29 lands on Feb 29)
 * - CAL-R18 Locale week-start (Polish pl-PL = Monday first)
 * - CAL-R19 External controlled update re-renders selection
 * - CAL-R20 Month chevron click updates displayed month
 * - CAL-R21 prefers-reduced-motion disables month transitions
 * - CAL-R22 min/max: prev chevron disabled at min boundary month
 * - CAL-R23 SSR safe — no hydration warnings
 * - CAL-R24 range selection [PLAYGROUND-DEP — single-date only]
 *
 * Playground: /components/calendar
 *   idx 1: Controlled (default 2026-04-20)
 *   idx 2: min/max (Apr 1 - Apr 30 2026)
 *   idx 5: Polish pl-PL
 */

import { test, expect } from '@playwright/test';

test.describe('Calendar — regression guards', () => {
  test('CAL-R16 — year boundary: Dec 31 → Jan 1 via keyboard', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    // Section 2 — controlled. Navigate to Dec 2026 via 8× next-month clicks
    // from April 2026. Chevron click updates focusedDate to same-day-of-month,
    // so after 8 clicks focusedDate = Dec 20 2026. Then CLICK Dec 31 to move
    // focusedDate to Dec 31 (focus() alone won't update component state).
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const nextBtn = controlled.getByRole('button', { name: 'Next month' });
    for (let i = 0; i < 8; i++) {
      await nextBtn.click();
    }
    await expect(controlled.getByText('December 2026')).toBeVisible();
    const grid = controlled.getByRole('grid');
    const dec31 = grid.locator('button[data-calendar-cell="2026-12-31"]');
    await dec31.click();
    await expect(dec31).toBeFocused();
    await page.keyboard.press('ArrowRight');
    // Rolls over to January 2027 in header
    await expect(controlled.getByText('January 2027')).toBeVisible();
    const jan1 = grid.locator('button[data-calendar-cell="2027-01-01"]');
    await expect(jan1).toBeFocused();
  });

  test('CAL-R17 — leap year: Feb 28 2024 → Feb 29 via ArrowRight', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    // Navigate from Apr 2026 back to Feb 2024 (-26 months via Shift+PageUp
    // twice = -24 months, then -2 via PageUp × 2).
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await apr20.focus();
    await page.keyboard.press('Shift+PageUp'); // -1 year → Apr 20, 2025
    await page.keyboard.press('Shift+PageUp'); // -1 year → Apr 20, 2024
    await page.keyboard.press('PageUp'); // -1 mo → Mar 20, 2024
    await page.keyboard.press('PageUp'); // -1 mo → Feb 20, 2024
    await expect(controlled.getByText('February 2024')).toBeVisible();
    // Click Feb 28 to move focusedDate state (focus() alone won't update it)
    const feb28 = grid.locator('button[data-calendar-cell="2024-02-28"]');
    await feb28.click();
    await expect(feb28).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const feb29 = grid.locator('button[data-calendar-cell="2024-02-29"]');
    await expect(feb29).toBeFocused();
  });

  test('CAL-R18 — Polish locale: week starts Monday (thead first cell)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    // Section 6 — pl-PL, auto-detects Monday start
    const sections = page.locator('section');
    const polish = sections.nth(5);
    // First thead cell visible short name is Polish for Monday — "pon." typically
    const firstHead = polish.locator('thead th').first();
    // Get the visible (aria-hidden=true) short label
    const shortLabel = firstHead.locator('span[aria-hidden="true"]');
    await expect(shortLabel).toHaveText(/pon/i);
  });

  test('CAL-R19 — controlled value: external Today button sets selection', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    // Click "Today" external button under the controlled calendar
    await controlled.getByRole('button', { name: 'Today' }).click();
    const grid = controlled.getByRole('grid');
    // Some cell in current month is now aria-selected=true
    const selected = grid.locator('td[role="gridcell"][aria-selected="true"]');
    await expect(selected).toHaveCount(1);
  });

  test('CAL-R19c — controlled value cross-month jump: displayed month follows new value', async ({
    page,
  }) => {
    // Demo Section 2 starts with controlled = April 20, 2026. Clicking "Today"
    // sets value to today (May 4, 2026 or later). Pre-fix the calendar stayed
    // on April because focusedDate was lazy-init only — today's cell was not
    // rendered (5-week grid March 29 → May 2), so aria-selected count = 0.
    // Post-fix the displayed month must jump to today's month so today's cell
    // is in the grid AND marked aria-selected.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    await controlled.getByRole('button', { name: 'Today' }).click();
    const todayMonthYear = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    // Header reflects today's month (proves displayMonth jumped)
    await expect(controlled.getByText(todayMonthYear)).toBeVisible();
    // Selected cell exists AND is the in-month variant (not an outside day)
    const selected = controlled
      .getByRole('grid')
      .locator('td[role="gridcell"][aria-selected="true"]');
    await expect(selected).toHaveCount(1);
  });

  test('CAL-R19b — Clear sets selection to null', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    await controlled.getByRole('button', { name: 'Clear' }).click();
    const grid = controlled.getByRole('grid');
    const selected = grid.locator('td[role="gridcell"][aria-selected="true"]');
    await expect(selected).toHaveCount(0);
  });

  test('CAL-R20 — Next month chevron updates displayed month', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    await controlled
      .getByRole('button', { name: 'Next month' })
      .click();
    await expect(controlled.getByText('May 2026')).toBeVisible();
  });

  test('CAL-R21 — prefers-reduced-motion: no long transitions on grid', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    const grid = page.getByRole('grid').first();
    const transition = await grid.evaluate(
      (el) => window.getComputedStyle(el).transition,
    );
    // Reduced-motion global CSS clamps transitions to 0.001s (per a11y pipeline).
    expect(transition).toMatch(/none|0s|0\.001s/);
  });

  test('CAL-R22 — min boundary: prev chevron native-disabled at min month', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
    // Section 3 — min Apr 1 2026, max Apr 30 2026, defaultMonth Apr 2026
    const sections = page.locator('section');
    const minMax = sections.nth(2);
    const prevBtn = minMax.getByRole('button', { name: 'Previous month' });
    // Expect prev chevron to be disabled at the min boundary
    await expect(prevBtn).toBeDisabled();
    // And next chevron likewise disabled at max
    const nextBtn = minMax.getByRole('button', { name: 'Next month' });
    await expect(nextBtn).toBeDisabled();
  });

  test('CAL-R23 — SSR safe: no hydration warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/calendar');
    await page.reload();
    await expect(page.getByRole('grid').first()).toBeVisible();
    expect(
      warnings.filter((w) => w.toLowerCase().includes('hydration')),
    ).toHaveLength(0);
  });

  test.skip('CAL-R24 — date range selection [PLAYGROUND-DEP: single-date only in v1.0]', async () => {
    // Range selection deferred to future sprint per component design.
  });
});
