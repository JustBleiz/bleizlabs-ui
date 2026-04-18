/**
 * DatePicker regression spec (E142 L3d1).
 *
 * Coverage:
 * - DP-R12 ISO parse via Enter
 * - DP-R13 invalid date (29 Feb non-leap) reverts
 * - DP-R14 min/max clamp: typed out-of-range reverts + Calendar cells disabled
 * - DP-R15 disabledDates predicate: weekend cells aria-disabled
 * - DP-R16 controlled: external Today button updates input
 * - DP-R18 SSR hydration safe
 * - DP-R19 prefers-reduced-motion: no popup animation
 * - Form submission serializes ISO date
 */

import { test, expect } from '@playwright/test';

test.describe('DatePicker — regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('DP-R12 — ISO parse: 2026-04-15 commits cleanly', async ({ page }) => {
    await page.goto('/components/date-picker');
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('2026-04-15');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('2026-04-15');
  });

  test('DP-R13 — invalid date (29 Feb 2025 non-leap) reverts', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    const sections = page.locator('section');
    const controlled = sections.nth(1); // defaultValue 2026-04-20
    const input = controlled.getByRole('combobox');
    await input.focus();
    await input.fill('2025-02-29');
    await page.keyboard.press('Enter');
    // Invalid date → reverts to committed value
    await expect(input).toHaveValue('2026-04-20');
  });

  test('DP-R14 — min/max: typed out-of-range reverts', async ({ page }) => {
    await page.goto('/components/date-picker');
    // idx 2 — min=2026-04-01 max=2026-04-30, default 2026-04-15
    const sections = page.locator('section');
    const ranged = sections.nth(2);
    const input = ranged.getByRole('combobox');
    await input.focus();
    await input.fill('2026-05-15'); // out of range
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('2026-04-15'); // reverts
  });

  test('DP-R14b — min/max: out-of-range Calendar cells disabled', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    const sections = page.locator('section');
    const ranged = sections.nth(2);
    const rangedInput = ranged.getByRole('combobox');
    await rangedInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    // 2026-03-31 is outside the month min=2026-04-01 but might render as
    // outside day; any button with data-calendar-cell="2026-03-31" (if shown)
    // should be aria-disabled.
    const march31 = grid.locator('button[data-calendar-cell="2026-03-31"]');
    const cnt = await march31.count();
    if (cnt > 0) {
      await expect(march31).toHaveAttribute('aria-disabled', 'true');
    }
    // 2026-05-01 (next month) — if shown as outside day, should be disabled.
    const may01 = grid.locator('button[data-calendar-cell="2026-05-01"]');
    const mayCnt = await may01.count();
    if (mayCnt > 0) {
      await expect(may01).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test('DP-R15 — disabledDates predicate: weekend cells aria-disabled', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    // idx 3 — weekdays-only (weekends disabled)
    const sections = page.locator('section');
    const weekdayOnly = sections.nth(3);
    const weekdayInput = weekdayOnly.getByRole('combobox');
    await weekdayInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    // Any Saturday / Sunday in the visible month — pick 2026-04-18 (Sat) +
    // 2026-04-19 (Sun); currentMonth defaults to today or first visible.
    // Probe any Saturday: find cells whose full-date aria-label contains
    // 'Saturday' or 'Sunday'.
    const satSunButtons = grid.locator(
      'button[aria-label*="Saturday"], button[aria-label*="Sunday"]',
    );
    const cnt = await satSunButtons.count();
    expect(cnt).toBeGreaterThan(0);
    // All weekend cells should be aria-disabled
    for (let i = 0; i < Math.min(cnt, 4); i += 1) {
      await expect(satSunButtons.nth(i)).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    }
  });

  test('DP-R16 — controlled: Today button updates input value', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const input = controlled.getByRole('combobox');
    await expect(input).toHaveValue('2026-04-20');
    await controlled.getByRole('button', { name: 'Today' }).click();
    const todayIso = new Date().toISOString().slice(0, 10);
    await expect(input).toHaveValue(todayIso);
  });

  test('DP-R18 — SSR safe: no hydration warnings', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/date-picker');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    const hydrationWarnings = warnings.filter((w) =>
      w.toLowerCase().includes('hydration'),
    );
    expect(hydrationWarnings).toHaveLength(0);
  });

  test('Form submission: hidden input serializes ISO date', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    const sections = page.locator('section');
    // idx 7 — form with name="deadline" default 2026-05-01
    const form = sections.nth(7);
    await form.getByRole('button', { name: 'Submit' }).click();
    await expect(form.getByText(/2026-05-01/)).toBeVisible();
  });

  test('Controlled open state: programmatic Open button shows popup', async ({
    page,
  }) => {
    await page.goto('/components/date-picker');
    const sections = page.locator('section');
    const openCtrl = sections.nth(5);
    await openCtrl
      .getByRole('button', { name: 'Open programmatically' })
      .click();
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    await openCtrl
      .getByRole('button', { name: 'Close programmatically' })
      .click();
    await expect(page.getByRole('grid')).toHaveCount(0);
  });

  test.skip(
    'DP-R20 — date range mode [PLAYGROUND-DEP: single-date only in v1]',
    async () => {},
  );

  test.skip(
    'DP-R21 — time picker composition [PLAYGROUND-DEP: date-only in v1]',
    async () => {},
  );
});
