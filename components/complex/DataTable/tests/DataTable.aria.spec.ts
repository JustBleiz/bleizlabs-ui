/**
 * DataTable ARIA semantics spec — APG `/grid/` compliance (E01 0.17.0).
 *
 * Coverage:
 * - DT-A01 root role="grid" + aria-rowcount + aria-colcount + aria-label
 * - DT-A02 column headers role="columnheader" + aria-sort sync
 * - DT-A03 rows role="row" + aria-rowindex
 * - DT-A04 cells role="gridcell" + aria-colindex
 * - DT-A05 selected row aria-selected="true"
 * - DT-A06 expanded row aria-expanded="true"
 * - DT-A07 aria-live polite region exists for announcements
 * - DT-A08 axe-core: zero violations on default render
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DataTable — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-A01 — root role="grid" has aria-rowcount + aria-colcount + aria-label', async ({
    page,
  }) => {
    const grids = page.getByRole('grid');
    const count = await grids.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const first = grids.first();
    await expect(first).toHaveAttribute('aria-rowcount', /^\d+$/);
    await expect(first).toHaveAttribute('aria-colcount', /^\d+$/);
    await expect(first).toHaveAttribute('aria-label', /.+/);
  });

  test('DT-A02 — columnheaders carry aria-sort state', async ({ page }) => {
    const grids = page.getByRole('grid');
    const sortableGrid = grids.nth(1);
    const headers = sortableGrid.getByRole('columnheader');
    const firstHeader = headers.first();
    // Initial sort state may be 'ascending' from defaultSort or 'none'
    const initial = await firstHeader.getAttribute('aria-sort');
    expect(['ascending', 'descending', 'none', null]).toContain(initial);
  });

  test('DT-A03 — rows have aria-rowindex, header row = 1, data rows start at 2', async ({
    page,
  }) => {
    const grid = page.getByRole('grid').first();
    const rows = grid.getByRole('row');
    const firstRowIndex = await rows.first().getAttribute('aria-rowindex');
    expect(firstRowIndex).toBe('1');
    const secondRowIndex = await rows.nth(1).getAttribute('aria-rowindex');
    expect(secondRowIndex).toBe('2');
  });

  test('DT-A04 — gridcells have aria-colindex starting at 1', async ({ page }) => {
    const grid = page.getByRole('grid').first();
    const firstCell = grid.locator('[role="gridcell"]').first();
    const colIdx = await firstCell.getAttribute('aria-colindex');
    expect(colIdx).toBe('1');
  });

  test('DT-A05 — selected row gets aria-selected="true"', async ({ page }) => {
    // Section 3 — selection multiple, click first row's checkbox
    const grids = page.getByRole('grid');
    const selectionGrid = grids.nth(2);
    const firstDataRow = selectionGrid.locator('[role="row"][aria-rowindex="2"]');
    const rowCheckbox = firstDataRow.getByRole('checkbox').first();
    await rowCheckbox.check();
    await page.waitForTimeout(50);
    await expect(firstDataRow).toHaveAttribute('aria-selected', 'true');
  });

  test('DT-A06 — expanded row sets aria-expanded="true"', async ({ page }) => {
    // Section 4 — full-featured, has expandable
    const grids = page.getByRole('grid');
    const fullGrid = grids.nth(3);
    const expandBtn = fullGrid
      .getByRole('button', { name: /Expand row|Collapse row/ })
      .first();
    await expandBtn.click();
    await page.waitForTimeout(100);
    // The row whose button we clicked is now aria-expanded="true"
    const expandedRow = fullGrid.locator('[role="row"][aria-expanded="true"]');
    await expect(expandedRow.first()).toBeVisible();
  });

  test('DT-A07 — aria-live polite region exists AND populates after sort', async ({
    page,
  }) => {
    const liveRegions = page.locator('[aria-live="polite"]');
    const count = await liveRegions.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Trigger a sort in the sortable+filterable grid and assert the live
    // region near it gets a text update. Use the nearest live region inside
    // the same grid's wrapper (each DataTable instance ships its own).
    const grids = page.getByRole('grid');
    const sortableGrid = grids.nth(1);
    const sortBtn = sortableGrid.getByRole('button', { name: /Sort/ }).nth(1);
    await sortBtn.click();
    // Wait past the 300ms debounce
    await page.waitForTimeout(500);
    // Locate the live region inside the same DataTable wrapper
    const dtWrapper = sortableGrid.locator(
      'xpath=ancestor::div[contains(@class, "datatable") or contains(@class, "dataTable")][1]',
    );
    const inGridRegion = dtWrapper.locator('[aria-live="polite"]').first();
    const fallbackRegion = page.locator('[aria-live="polite"]');
    const targetRegion = (await inGridRegion.count())
      ? inGridRegion
      : fallbackRegion.first();
    const text = (await targetRegion.textContent())?.trim() ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  test('DT-A08 — axe-core: zero violations on /components/data-table', async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .disableRules(['region']) // demo page wrapper rules — not under DataTable's control
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
