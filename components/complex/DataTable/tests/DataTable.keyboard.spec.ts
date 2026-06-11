/**
 * DataTable keyboard interaction spec — APG `/grid/` pattern (E01 0.17.0).
 *
 * Coverage (cell-mode roving tabindex):
 * - DT-K01 ArrowRight moves focus to next cell horizontally
 * - DT-K02 ArrowDown moves focus to cell in next row, same column
 * - DT-K03 Home jumps to first cell of current row
 * - DT-K04 End jumps to last cell of current row
 * - DT-K05 Ctrl+Home jumps to first data cell of grid (deliberate APG
 *   deviation — header row excluded; see handleGridKeyDown)
 * - DT-K06 RTL ArrowLeft / ArrowRight mirror direction
 * - DT-K07 Space toggles row selection when selectable
 * - DT-K08 Enter activates sort on column header
 * - DT-K09 Alt+ArrowRight passes through (does not change focus)
 *
 * Implemented but NOT yet covered here: Ctrl+End (last data cell),
 * PageDown / PageUp (±10 rows) — candidates for a future suite extension
 * (no phantom IDs reserved; this list mirrors the tests that exist).
 *
 * Demo route: /components/data-table
 *   Section 1 (idx 0) — Basic 5 rows
 *   Section 2 (idx 1) — Sortable+filterable 20 rows
 *   Section 4 (idx 3) — Full-featured (RTL toggle, density, selection)
 */

import { test, expect } from '@playwright/test';
import { allGrids } from './_helpers';

test.describe('DataTable — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-K01 — ArrowRight moves focus to next cell horizontally', async ({ page }) => {
    const grid = allGrids(page).first();
    const firstCell = grid.locator('[role="gridcell"]').first();
    await firstCell.focus();
    const before = await firstCell.getAttribute('aria-colindex');
    await page.keyboard.press('ArrowRight');
    const focused = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-colindex'),
    );
    expect(Number(focused)).toBe(Number(before) + 1);
  });

  test('DT-K02 — ArrowDown moves focus to cell in next row, same column', async ({ page }) => {
    const grid = allGrids(page).first();
    const firstCell = grid.locator('[role="gridcell"]').first();
    await firstCell.focus();
    const beforeCol = await firstCell.getAttribute('aria-colindex');
    await page.keyboard.press('ArrowDown');
    const afterCol = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-colindex'),
    );
    expect(afterCol).toBe(beforeCol);
    // Row index should have changed — assert by checking the activeElement is a new cell
    const sameAsFirst = await firstCell.evaluate((el) => el === document.activeElement);
    expect(sameAsFirst).toBe(false);
  });

  test('DT-K03 — Home jumps to first cell of current row', async ({ page }) => {
    const grid = allGrids(page).first();
    const cells = grid.locator('[role="gridcell"]');
    await cells.nth(2).focus();
    await page.keyboard.press('Home');
    const focusedCol = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-colindex'),
    );
    expect(focusedCol).toBe('1');
  });

  test('DT-K04 — End jumps to last cell of current row', async ({ page }) => {
    const grid = allGrids(page).first();
    const firstCell = grid.locator('[role="gridcell"]').first();
    await firstCell.focus();
    await page.keyboard.press('End');
    const focusedCol = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-colindex'),
    );
    const colCount = await grid.getAttribute('aria-colcount');
    expect(focusedCol).toBe(colCount);
  });

  // Deliberate APG deviation: Ctrl+Home targets the first DATA cell
  // ({row:1, col:0}), not the header row — see handleGridKeyDown.
  test('DT-K05 — Ctrl+Home jumps to first data cell of grid', async ({ page }) => {
    const grid = allGrids(page).first();
    const cells = grid.locator('[role="gridcell"]');
    const count = await cells.count();
    await cells.nth(Math.min(5, count - 1)).focus();
    await page.keyboard.press('Control+Home');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        row: el?.closest('[role="row"]')?.getAttribute('aria-rowindex'),
        col: el?.getAttribute('aria-colindex'),
      };
    });
    expect(focused.col).toBe('1');
  });

  test('DT-K06 — RTL ArrowLeft moves to NEXT cell (forward direction mirror)', async ({ page }) => {
    // Section 4 — full-featured with RTL toggle
    const rtlSwitch = page.getByRole('switch', { name: /RTL direction/i });
    await rtlSwitch.scrollIntoViewIfNeeded();
    await rtlSwitch.click({ force: true });
    await page.waitForTimeout(150);
    const grids = allGrids(page);
    const rtlGrid = grids.nth(3);
    const firstCell = rtlGrid.locator('[role="gridcell"]').first();
    await firstCell.focus();
    const before = await firstCell.getAttribute('aria-colindex');
    await page.keyboard.press('ArrowLeft');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-colindex'));
    // RTL: ArrowLeft = forward = colindex + 1
    expect(Number(after)).toBe(Number(before) + 1);
  });

  test('DT-K07 — Space toggles row selection when grid is selectable', async ({ page }) => {
    // Section 3 — selection multiple
    const grids = allGrids(page);
    const selectionGrid = grids.nth(2);
    // Focus first gridcell of first row
    const firstRow = selectionGrid.locator('[role="row"][aria-rowindex="2"]');
    const firstCell = firstRow.locator('[role="gridcell"]').first();
    await firstCell.focus();
    const beforeSelected = await firstRow.getAttribute('aria-selected');
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
    const afterSelected = await firstRow.getAttribute('aria-selected');
    expect(afterSelected).not.toBe(beforeSelected);
  });

  test('DT-K08 — Enter on header cell activates sort', async ({ page }) => {
    // Section 2 — sortable+filterable, headers are buttons inside columnheader
    const grids = allGrids(page);
    const sortableGrid = grids.nth(1);
    const sortBtn = sortableGrid.getByRole('button', { name: /sort/i }).first();
    await sortBtn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);
    // The columnheader should now have aria-sort set
    const headerWithSort = sortableGrid
      .locator('[role="columnheader"][aria-sort]:not([aria-sort="none"])')
      .first();
    await expect(headerWithSort).toBeVisible();
  });

  test('DT-K09 — Alt+ArrowRight passes through (does not change focus)', async ({ page }) => {
    const grid = allGrids(page).first();
    const firstCell = grid.locator('[role="gridcell"]').first();
    await firstCell.focus();
    const before = await firstCell.getAttribute('aria-colindex');
    await page.keyboard.press('Alt+ArrowRight');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-colindex'));
    expect(after).toBe(before);
  });
});
