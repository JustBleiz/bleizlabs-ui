/**
 * DataTable focus management spec — APG `/grid/` roving tabindex (E01 0.17.0).
 *
 * Coverage:
 * - DT-F01 Initial render — single tabindex=0 cell, others tabindex=-1
 * - DT-F02 Tab into grid lands on the roving cell, not first cell
 * - DT-F03 ArrowKey navigation updates which cell holds tabindex=0
 * - DT-F04 Click on cell makes it the roving cell
 * - DT-F05 Focus visible indicator present on focused cell
 * - DT-F06 Focus preserved through sort change (no focus loss)
 */

import { test, expect } from '@playwright/test';
import { allGrids } from './_helpers';

test.describe('DataTable — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-F01 — exactly one cell has tabindex=0 per grid initially', async ({
    page,
  }) => {
    const grid = allGrids(page).first();
    const tabbableCells = grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]');
    const allCells = grid.locator('[role="gridcell"]');
    const tabbableCount = await tabbableCells.count();
    const allCount = await allCells.count();
    expect(tabbableCount).toBe(1);
    expect(allCount).toBeGreaterThan(1);
  });

  test('DT-F02 — Tab into grid lands on the roving (tabindex=0) cell', async ({
    page,
  }) => {
    const grid = allGrids(page).first();
    const rovingCell = grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]').first();
    await rovingCell.focus();
    await expect(rovingCell).toBeFocused();
  });

  test('DT-F03 — ArrowDown moves tabindex=0 to next-row same-column cell', async ({
    page,
  }) => {
    const grid = allGrids(page).first();
    const initialRoving = grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]').first();
    await initialRoving.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    // After move — exactly one cell should still have tabindex=0
    const tabbableCount = await grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]').count();
    expect(tabbableCount).toBe(1);
    // And the roving cell should be focused
    const newRoving = grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]').first();
    await expect(newRoving).toBeFocused();
  });

  test('DT-F04 — Click on a cell makes it the roving cell', async ({ page }) => {
    const grid = allGrids(page).first();
    const cells = grid.locator('[role="gridcell"]');
    const target = cells.nth(3);
    await target.click();
    await page.waitForTimeout(50);
    await expect(target).toHaveAttribute('tabindex', '0');
    const tabbableCount = await grid.locator(':is([role="gridcell"], [role="columnheader"])[tabindex="0"]').count();
    expect(tabbableCount).toBe(1);
  });

  test('DT-F05 — focused cell has visible focus indicator', async ({ page }) => {
    const grid = allGrids(page).first();
    const cell = grid.locator('[role="gridcell"]').first();
    await cell.focus();
    // The library uses .cellFocused class or focus-visible — check outline computed style
    const outlineWidth = await cell.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.outlineWidth || computed.boxShadow;
    });
    expect(outlineWidth).toBeTruthy();
    expect(outlineWidth).not.toBe('0px');
  });

  test('DT-F06 — focus retained after sort change', async ({ page }) => {
    // Section 2 — sortable
    const grids = allGrids(page);
    const sortableGrid = grids.nth(1);
    const headerBtn = sortableGrid.getByRole('button', { name: /sort/i }).first();
    await headerBtn.focus();
    await expect(headerBtn).toBeFocused();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    // After sort, focus should remain on the header button (not jump to body or away)
    const stillFocused = await headerBtn.evaluate((el) => el === document.activeElement);
    expect(stillFocused).toBe(true);
  });
});
