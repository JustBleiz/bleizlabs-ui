/**
 * DataTable sort spec — column header sort cycle (E01 0.17.0).
 *
 * Coverage:
 * - DT-S01 Click on sortable header cycles asc → desc → none
 * - DT-S02 aria-sort attribute syncs with sort state
 * - DT-S03 defaultSort respected on initial render
 * - DT-S04 Only one column sorted at a time (multi-sort deferred)
 * - DT-S05 Clicking unsortable column header does NOT sort
 * - DT-S06 Sort order reflects in rendered row order
 */

import { test, expect } from '@playwright/test';

test.describe('DataTable — sort behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-S01 — click cycles asc → desc → none', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(1); // sortable+filterable
    // Find a header that is NOT initially sorted
    const headers = grid.getByRole('columnheader');
    // defaultSort sorts 'name' asc; pick another column
    const sortButtons = grid.getByRole('button', { name: /Sort/ });
    const btnCount = await sortButtons.count();
    expect(btnCount).toBeGreaterThan(1);
    const secondBtn = sortButtons.nth(1);
    // Find the columnheader ancestor of the second button
    await secondBtn.click();
    await page.waitForTimeout(50);
    const header = headers.filter({ has: secondBtn }).first();
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await secondBtn.click();
    await page.waitForTimeout(50);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await secondBtn.click();
    await page.waitForTimeout(50);
    const finalSort = await header.getAttribute('aria-sort');
    expect(['none', null]).toContain(finalSort);
  });

  test('DT-S02 — aria-sort initially ascending due to defaultSort', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(1); // defaultSort: { columnId: 'name', direction: 'asc' }
    const ascHeader = grid.locator('[role="columnheader"][aria-sort="ascending"]');
    await expect(ascHeader).toHaveCount(1);
  });

  test('DT-S03 — defaultSort sets initial visible row order', async ({ page }) => {
    // Section 2: defaultSort name asc — rows should be alphabetical
    const grids = page.getByRole('grid');
    const grid = grids.nth(1);
    const firstCell = grid.locator('[role="row"][aria-rowindex="2"] [role="gridcell"]').first();
    const secondCell = grid.locator('[role="row"][aria-rowindex="3"] [role="gridcell"]').first();
    const t1 = (await firstCell.textContent())?.trim() ?? '';
    const t2 = (await secondCell.textContent())?.trim() ?? '';
    expect(t1.localeCompare(t2)).toBeLessThanOrEqual(0);
  });

  test('DT-S04 — only one column has aria-sort != none at a time', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(1);
    const sortBtns = grid.getByRole('button', { name: /Sort/ });
    await sortBtns.nth(2).click();
    await page.waitForTimeout(50);
    const activeHeaders = grid.locator(
      '[role="columnheader"][aria-sort="ascending"], [role="columnheader"][aria-sort="descending"]',
    );
    await expect(activeHeaders).toHaveCount(1);
  });

  test('DT-S05 — unsortable column header has no sort button', async ({ page }) => {
    // Section 1 — basic columns are not sortable
    const grids = page.getByRole('grid');
    const grid = grids.first();
    const headers = grid.getByRole('columnheader');
    const sortBtnsInBasic = grid.getByRole('button', { name: /Sort/ });
    expect(await sortBtnsInBasic.count()).toBe(0);
    await expect(headers.first()).toBeVisible();
  });

  test('DT-S06 — desc sort reverses visible row order', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(1);
    const sortBtns = grid.getByRole('button', { name: /Sort/ });
    // Click name header twice — defaultSort is asc, second click → desc
    await sortBtns.first().click();
    await page.waitForTimeout(50);
    const header = grid
      .locator('[role="columnheader"][aria-sort="descending"]')
      .first();
    await expect(header).toBeVisible();
    const firstCell = grid.locator('[role="row"][aria-rowindex="2"] [role="gridcell"]').first();
    const secondCell = grid.locator('[role="row"][aria-rowindex="3"] [role="gridcell"]').first();
    const t1 = (await firstCell.textContent())?.trim() ?? '';
    const t2 = (await secondCell.textContent())?.trim() ?? '';
    expect(t1.localeCompare(t2)).toBeGreaterThanOrEqual(0);
  });
});
