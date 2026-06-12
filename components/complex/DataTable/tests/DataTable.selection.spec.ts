/**
 * DataTable selection spec — single/multiple modes + stability (E01 0.17.0).
 *
 * Coverage:
 * - DT-SE01 Row checkbox toggles selection state
 * - DT-SE02 Header checkbox selects all visible rows
 * - DT-SE03 Header checkbox indeterminate when partial selection
 * - DT-SE04 Header checkbox clears all when fully selected
 * - DT-SE05 Selection persists across pagination via getRowId
 * - DT-SE06 Selection count label updates ("N rows selected")
 * - DT-SE07 Selection survives sort change
 * - DT-SE08 Controlled selection survives data refetch (fresh object identities)
 * - DT-SE09 No [DataTable] dev-warnings on the healthy demo page (warn probes
 *   must not false-positive on index-independent getRowId)
 */

import { test, expect } from '@playwright/test';
import { allGrids } from './_helpers';

test.describe('DataTable — selection behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-SE01 — row checkbox toggles aria-selected', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const firstDataRow = grid.locator('[role="row"][aria-rowindex="2"]');
    const cb = firstDataRow.getByRole('checkbox').first();
    await cb.check();
    await expect(firstDataRow).toHaveAttribute('aria-selected', 'true');
    await cb.uncheck();
    const afterUncheck = await firstDataRow.getAttribute('aria-selected');
    expect(afterUncheck === 'false' || afterUncheck === null).toBe(true);
  });

  test('DT-SE02 — header checkbox selects all visible page rows', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const headerCb = grid.getByRole('checkbox', { name: /Select all/i });
    await headerCb.check();
    await page.waitForTimeout(100);
    const selected = await grid.locator('[role="row"][aria-selected="true"]').count();
    expect(selected).toBeGreaterThan(0);
  });

  test('DT-SE03 — header checkbox is indeterminate with partial selection', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const firstCb = grid.locator('[role="row"][aria-rowindex="2"]').getByRole('checkbox').first();
    await firstCb.check();
    await page.waitForTimeout(50);
    const headerCb = grid.getByRole('checkbox', { name: /Select all/i });
    const indeterminate = await headerCb.evaluate((el) => (el as HTMLInputElement).indeterminate);
    expect(indeterminate).toBe(true);
  });

  test('DT-SE04 — toggling header when fully selected clears all', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const headerCb = grid.getByRole('checkbox', { name: /Select all/i });
    await headerCb.check();
    await page.waitForTimeout(100);
    await headerCb.click();
    await page.waitForTimeout(100);
    const selectedRows = await grid.locator('[role="row"][aria-selected="true"]').count();
    expect(selectedRows).toBe(0);
  });

  test('DT-SE05 — selection persists across pagination (stable getRowId)', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const section = grid.locator('xpath=ancestor::section[1]');
    const firstRowCb = grid
      .locator('[role="row"][aria-rowindex="2"]')
      .getByRole('checkbox')
      .first();
    await firstRowCb.check();
    await page.waitForTimeout(50);
    // Navigate to next page (unconditional — section 3 has 25 rows / pageSize 8)
    const nextBtn = section.getByRole('button', { name: /next|»/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(100);
    // Navigate back
    const prevBtn = section.getByRole('button', { name: /prev|«/i }).first();
    await prevBtn.click();
    await page.waitForTimeout(100);
    const firstRow = grid.locator('[role="row"][aria-rowindex="2"]');
    await expect(firstRow).toHaveAttribute('aria-selected', 'true');
  });

  test('DT-SE06 — selection count label updates', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const section = grid.locator('xpath=ancestor::section[1]');
    const cb = grid.locator('[role="row"][aria-rowindex="2"]').getByRole('checkbox').first();
    await cb.check();
    await page.waitForTimeout(50);
    const count = section.getByText(/1 row selected/i).first();
    await expect(count).toBeVisible();
  });

  test('DT-SE07 — selection survives column sort', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const firstCb = grid.locator('[role="row"][aria-rowindex="2"]').getByRole('checkbox').first();
    await firstCb.check();
    await page.waitForTimeout(50);
    // Unconditional — selectionColumns "Project" is sortable
    const sortBtn = grid.getByRole('button', { name: /sort/i }).first();
    await sortBtn.click();
    await page.waitForTimeout(100);
    // After sort, total selected should still be >= 1
    const stillSelected = await grid.locator('[role="row"][aria-selected="true"]').count();
    expect(stillSelected).toBeGreaterThanOrEqual(1);
  });

  test('DT-SE08 — controlled selection survives data refetch (fresh object identities)', async ({
    page,
  }) => {
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const section = grid.locator('xpath=ancestor::section[1]');
    const firstRowCb = grid
      .locator('[role="row"][aria-rowindex="2"]')
      .getByRole('checkbox')
      .first();
    await firstRowCb.check();
    await expect(section.getByText(/1 row selected/i).first()).toBeVisible();
    // Replace every data object with a clone — same IDs, new references.
    await section.getByRole('button', { name: 'Simulate refetch' }).click();
    await page.waitForTimeout(100);
    // Pre-fix: computeIdsFromRows dropped rows failing data.indexOf(r) (reference
    // identity) → aria-selected silently lost. Post-fix: ID-based comparison.
    await expect(grid.locator('[role="row"][aria-rowindex="2"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('DT-SE09 — no [DataTable] dev-warnings on the healthy demo page', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('[DataTable]')) {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/data-table');
    // Interact enough to mount every demo instance's selection machinery.
    const grids = allGrids(page);
    const grid = grids.nth(2);
    const firstRowCb = grid
      .locator('[role="row"][aria-rowindex="2"]')
      .getByRole('checkbox')
      .first();
    await firstRowCb.check();
    await page.waitForTimeout(100);
    expect(warnings).toEqual([]);
  });
});
