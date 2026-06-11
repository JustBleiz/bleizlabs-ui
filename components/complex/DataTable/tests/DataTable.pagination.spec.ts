/**
 * DataTable pagination spec — page navigation + footer contract (E01 0.17.0).
 *
 * Coverage:
 * - DT-P01 Next page button advances pageIndex
 * - DT-P02 Prev page button returns to previous page
 * - DT-P03 First/Last page buttons jump to boundaries
 * - DT-P04 pageSize selector is NOT rendered (v1 reserved API — see
 *   `pageSizeOptions` JSDoc; flip this assertion when the selector lands)
 * - DT-P05 "Page X of Y" label updates on navigation
 * - DT-P06 Pagination footer absent when pagination={false}
 * - DT-P07 Showing N of M label reflects current page
 */

import { test, expect } from '@playwright/test';
import { allGrids } from './_helpers';

test.describe('DataTable — pagination behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-P01 — Next button advances to page 2', async ({ page }) => {
    // Section 2 — 20 rows, pageSize 10 → 2 pages
    const grids = allGrids(page);
    const grid = grids.nth(1);
    // Look for Next button near the grid
    const section = grid.locator('xpath=ancestor::section[1]');
    const nextBtn = section.getByRole('button', { name: /next|następna|»/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(100);
    // Look for "Page 2" label
    const pageLabel = section.getByText(/Page 2/i).first();
    await expect(pageLabel).toBeVisible();
  });

  test('DT-P02 — Prev returns to page 1 after Next', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const section = grid.locator('xpath=ancestor::section[1]');
    const nextBtn = section.getByRole('button', { name: /next|następna|»/i }).first();
    const prevBtn = section.getByRole('button', { name: /prev|poprzednia|«/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(50);
    await prevBtn.click();
    await page.waitForTimeout(50);
    const pageLabel = section.getByText(/Page 1/i).first();
    await expect(pageLabel).toBeVisible();
  });

  test('DT-P03 — Last/First page navigation jumps to boundaries', async ({ page }) => {
    // Section 4 — 47 rows, pageSize 10 → 5 pages
    const grids = allGrids(page);
    const grid = grids.nth(3);
    const section = grid.locator('xpath=ancestor::section[1]');
    // Try to find Last button by accessible name (if exposed)
    const lastBtn = section.getByRole('button', { name: /last|ostatnia|⟫|>>/i }).first();
    const lastVisible = await lastBtn.isVisible().catch(() => false);
    if (lastVisible) {
      await lastBtn.click();
      await page.waitForTimeout(50);
      const pageLabel = section.getByText(/Page 5/i).first();
      await expect(pageLabel).toBeVisible();
    } else {
      // Fallback — click Next 4× to reach page 5
      const nextBtn = section.getByRole('button', { name: /next|następna|»/i }).first();
      for (let i = 0; i < 4; i++) {
        await nextBtn.click();
        await page.waitForTimeout(30);
      }
      const pageLabel = section.getByText(/Page 5/i).first();
      await expect(pageLabel).toBeVisible();
    }
  });

  test('DT-P04 — pageSize selector is NOT rendered (v1 reserved API)', async ({ page }) => {
    // Pre-remediation this test silently no-opped behind an if-guard while the
    // header claimed selector coverage. v1 ships the pagination footer WITHOUT
    // a page-size selector (`pageSizeOptions` is accepted-but-not-rendered) —
    // lock that contract; rewrite to an interaction test when the selector lands.
    const grids = allGrids(page);
    const grid = grids.nth(3);
    const section = grid.locator('xpath=ancestor::section[1]');
    const sizeControl = section.getByRole('combobox', { name: /rows per page/i });
    expect(await sizeControl.count()).toBe(0);
  });

  test('DT-P05 — Page label format "Page X of Y"', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const section = grid.locator('xpath=ancestor::section[1]');
    const label = section.getByText(/Page \d+ of \d+/).first();
    await expect(label).toBeVisible();
  });

  test('DT-P06 — Basic section (pagination=false) has no pagination footer', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.first();
    const section = grid.locator('xpath=ancestor::section[1]');
    const pageLabel = section.getByText(/Page \d+ of \d+/);
    expect(await pageLabel.count()).toBe(0);
  });

  test('DT-P07 — Showing N of M reflects current visible vs total', async ({ page }) => {
    const grids = allGrids(page);
    const grid = grids.nth(1);
    const section = grid.locator('xpath=ancestor::section[1]');
    const label = section.getByText(/Showing \d+ of \d+ rows/).first();
    await expect(label).toBeVisible();
    const text = await label.textContent();
    expect(text).toMatch(/Showing \d+ of 20 rows/);
  });
});
