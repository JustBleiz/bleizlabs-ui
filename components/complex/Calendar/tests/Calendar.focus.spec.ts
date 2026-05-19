/**
 * Calendar focus behavior spec (E142 L3d2).
 *
 * Coverage:
 * - CAL-R08 Roving tabindex: only focused cell has tabindex=0, others -1
 * - CAL-R09 Tab moves focus OUT of grid (single tabstop semantic)
 * - CAL-R10 Disabled cells remain focusable (APG focusable-when-disabled)
 * - Chevron click does NOT steal focus to grid (focus persistence)
 *
 * Playground: /components/calendar
 *   idx 1: Controlled (default 2026-04-20)
 *   idx 3: disabled weekends predicate (no default)
 *   idx 4: disabled array (Apr 10/11/12, defaultMonth Apr 2026)
 */

import { test, expect } from '@playwright/test';

test.describe('Calendar — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
  });

  test('CAL-R08 — roving tabindex: only focused cell has tabindex=0', async ({ page }) => {
    // Section 2 — controlled default 2026-04-20 → that cell is focused
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await expect(apr20).toHaveAttribute('tabindex', '0');
    const apr15 = grid.locator('button[data-calendar-cell="2026-04-15"]');
    await expect(apr15).toHaveAttribute('tabindex', '-1');
    const apr10 = grid.locator('button[data-calendar-cell="2026-04-10"]');
    await expect(apr10).toHaveAttribute('tabindex', '-1');
  });

  test('CAL-R08b — tabindex flips after arrow nav', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await apr20.focus();
    await page.keyboard.press('ArrowRight');
    const apr21 = grid.locator('button[data-calendar-cell="2026-04-21"]');
    await expect(apr21).toHaveAttribute('tabindex', '0');
    await expect(apr20).toHaveAttribute('tabindex', '-1');
  });

  test('CAL-R09 — Tab moves focus OUT of grid (single tabstop)', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await apr20.focus();
    await page.keyboard.press('Tab');
    // Focus leaves calendar cell; active element should not be a gridcell button
    const activeDataCell = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-calendar-cell'),
    );
    expect(activeDataCell).toBeNull();
  });

  test('CAL-R10 — disabled cells remain focusable (aria-disabled only)', async ({ page }) => {
    // Section 5 — disabled array includes Apr 10, 11, 12
    const sections = page.locator('section');
    const arrayDisabled = sections.nth(4);
    const grid = arrayDisabled.getByRole('grid');
    const apr10 = grid.locator('button[data-calendar-cell="2026-04-10"]');
    await expect(apr10).toHaveAttribute('aria-disabled', 'true');
    // Native disabled must NOT be set (APG focusable-when-disabled)
    await expect(apr10).not.toHaveAttribute('disabled', '');
    await apr10.focus();
    await expect(apr10).toBeFocused();
  });

  test('Chevron click keeps focus on chevron (no steal to grid)', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const nextBtn = controlled.getByRole('button', { name: 'Next month' });
    await nextBtn.click();
    await expect(nextBtn).toBeFocused();
    // Grid is now showing May 2026 — inner tabindex=0 cell is May 20 equivalent
    const grid = controlled.getByRole('grid');
    await expect(grid.locator('button[data-calendar-cell="2026-05-20"]')).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  test('Prev chevron click updates focused date (PageUp equivalent via mouse)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const prevBtn = controlled.getByRole('button', { name: 'Previous month' });
    await prevBtn.click();
    await expect(controlled.getByText('March 2026')).toBeVisible();
  });
});
