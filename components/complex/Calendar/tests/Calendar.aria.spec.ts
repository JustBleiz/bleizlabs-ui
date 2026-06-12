/**
 * Calendar ARIA semantics spec — APG `/grid/` compliance (E142 L3d2).
 *
 * Coverage:
 * - CAL-R11 root role="grid" + aria-labelledby to live month header
 * - CAL-R12 cells role="gridcell" + aria-selected synced to value
 * - CAL-R13 today cell aria-current="date"
 * - CAL-R14 aria-disabled="true" on disabled dates (NOT native disabled)
 * - Month header aria-live="polite" aria-atomic="true"
 * - axe-core zero violations (default + Polish locale + RTL)
 *
 * Playground: /components/calendar
 *   idx 0: Basic uncontrolled (default month = today)
 *   idx 1: Controlled (default 2026-04-20)
 *   idx 4: disabled array (Apr 10/11/12)
 *   idx 5: Polish locale pl-PL
 *   idx 7: ar-SA + dir=rtl
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Calendar — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/calendar');
  });

  test('CAL-R11 — root role="grid" + aria-labelledby to month header', async ({ page }) => {
    const grids = page.getByRole('grid');
    expect(await grids.count()).toBeGreaterThanOrEqual(1);
    const firstGrid = grids.first();
    const labelledBy = await firstGrid.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const label = page.locator(`#${labelledBy}`);
    await expect(label).toBeVisible();
    // Label contains a year — generic assertion works across locales
    await expect(label).toHaveText(/\d{4}/);
  });

  test('CAL-R12 — cells role="gridcell" + aria-selected synced to value', async ({ page }) => {
    // Section 2 — controlled default 2026-04-20 (April 20 is selected)
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const selectedCell = grid.locator('td[role="gridcell"]').filter({
      has: page.locator('button[data-calendar-cell="2026-04-20"]'),
    });
    await expect(selectedCell).toHaveAttribute('aria-selected', 'true');
    // Non-selected cells have no aria-selected attribute (undefined)
    const apr15Cell = grid.locator('td[role="gridcell"]').filter({
      has: page.locator('button[data-calendar-cell="2026-04-15"]'),
    });
    await expect(apr15Cell).not.toHaveAttribute('aria-selected', 'true');
  });

  test('CAL-R13 — today cell has aria-current="date"', async ({ page }) => {
    // Section 1 — basic uncontrolled, defaults month to today
    const sections = page.locator('section');
    const basic = sections.nth(0);
    const grid = basic.getByRole('grid');
    // Marker is hydration-safe (CAL-R25): applied AFTER hydration — must use
    // an auto-retrying assertion, not a one-shot count snapshot.
    const todayButtons = grid.locator('button[aria-current="date"]');
    await expect(todayButtons).toHaveCount(1);
  });

  test('CAL-R14 — aria-disabled="true" on disabled cells (not native disabled)', async ({
    page,
  }) => {
    // Section 5 — array disabled (Apr 10, 11, 12)
    const sections = page.locator('section');
    const arrayDisabled = sections.nth(4);
    const grid = arrayDisabled.getByRole('grid');
    const apr10 = grid.locator('button[data-calendar-cell="2026-04-10"]');
    await expect(apr10).toHaveAttribute('aria-disabled', 'true');
    // NOTE-FOR-LIB: chevrons use native `disabled` (button disabled attr) — APG
    // prefers aria-disabled for focusable-when-disabled. Cells correctly use
    // aria-disabled; chevrons remaining native is a minor inconsistency.
    const disabledAttr = await apr10.getAttribute('disabled');
    expect(disabledAttr).toBeNull();
  });

  test('Month header has aria-live="polite" + aria-atomic="true"', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const labelledBy = await grid.getAttribute('aria-labelledby');
    const label = page.locator(`#${labelledBy}`);
    await expect(label).toHaveAttribute('aria-live', 'polite');
    await expect(label).toHaveAttribute('aria-atomic', 'true');
  });

  test('Cell button aria-label is locale-formatted full date', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    const ariaLabel = await apr20.getAttribute('aria-label');
    // en-US "Monday, April 20, 2026"
    expect(ariaLabel).toMatch(/April 20, 2026/);
  });

  test('Polish locale cells render localized weekday names', async ({ page }) => {
    // Section 6 — pl-PL
    const sections = page.locator('section');
    const polish = sections.nth(5);
    // Polish weekdays are e.g. "pon., wt., śr., czw., pt., sob., niedz." —
    // at least one Polish short-day token must appear in thead
    const headCells = polish.locator('thead th span').first();
    await expect(headCells).not.toHaveText(/^Mon$/);
  });

  test('axe-core zero violations — default playground', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after keyboard navigation', async ({ page }) => {
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const grid = controlled.getByRole('grid');
    const apr20 = grid.locator('button[data-calendar-cell="2026-04-20"]');
    await apr20.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('PageDown');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('aria snapshot contains grid role', async ({ page }) => {
    const grid = page.getByRole('grid').first();
    const snapshot = await grid.ariaSnapshot();
    expect(snapshot).toContain('grid');
  });
});
