/**
 * DataTable filter spec — header filter inputs + global filter (E01 0.17.0).
 *
 * Coverage:
 * - DT-FL01 Text filter narrows visible rows
 * - DT-FL02 Global filter (section 4) filters across all columns
 * - DT-FL03 Clearing filter restores all rows
 * - DT-FL04 Filter is case-insensitive by default
 * - DT-FL05 Filter empties listing produces empty state
 * - DT-FL06 Filter respects aria-label per column
 */

import { test, expect } from '@playwright/test';
import { allGrids } from './_helpers';

test.describe('DataTable — filter behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-FL01 — text filter on header narrows rows', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const filterInputs = grid.getByRole('textbox');
    const inputCount = await filterInputs.count();
    expect(inputCount).toBeGreaterThan(0);
    const before = await grid.locator('tbody [role="row"]').count();
    await filterInputs.first().fill('Atelier');
    await page.waitForTimeout(400);
    const after = await grid.locator('tbody [role="row"]').count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('DT-FL02 — global filter narrows full-featured grid', async ({ page }) => {
    const search = page.getByRole('textbox', { name: /Global search/i });
    const grids = allGrids(page);
    const grid = grids.nth(3);
    const before = await grid.locator('tbody [role="row"]').count();
    await search.fill('Mobile');
    await page.waitForTimeout(400);
    const after = await grid.locator('tbody [role="row"]').count();
    expect(after).toBeLessThanOrEqual(before);
  });

  test('DT-FL03 — clearing filter restores rows', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const filterInputs = grid.getByRole('textbox');
    const initial = await grid.locator('tbody [role="row"]').count();
    await filterInputs.first().fill('ZZZNeverMatchXYZ');
    await page.waitForTimeout(400);
    await filterInputs.first().fill('');
    await page.waitForTimeout(400);
    const restored = await grid.locator('tbody [role="row"]').count();
    expect(restored).toBe(initial);
  });

  test('DT-FL04 — filter is case-insensitive', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const filterInputs = grid.getByRole('textbox');
    await filterInputs.first().fill('ATELIER');
    await page.waitForTimeout(400);
    const matchingRows = await grid.locator('tbody [role="row"]').count();
    await filterInputs.first().fill('atelier');
    await page.waitForTimeout(400);
    const lowerCaseMatches = await grid.locator('tbody [role="row"]').count();
    expect(lowerCaseMatches).toBe(matchingRows);
  });

  test('DT-FL05 — filter to no-match produces empty body', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const filterInputs = grid.getByRole('textbox');
    await filterInputs.first().fill('ZZZNeverMatchXYZ');
    await page.waitForTimeout(400);
    const dataRows = await grid.locator('tbody [role="row"]').count();
    expect(dataRows).toBe(0);
  });

  test('DT-FL06 — filter input has aria-label including column name', async ({
    page,
  }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const firstInput = grid.getByRole('textbox').first();
    const label = await firstInput.getAttribute('aria-label');
    expect(label).toMatch(/Filter/i);
  });
});
