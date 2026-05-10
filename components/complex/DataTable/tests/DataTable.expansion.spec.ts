/**
 * DataTable expansion spec — renderExpanded + aria-expanded (E01 0.17.0).
 *
 * Coverage:
 * - DT-EX01 Expand button toggles aria-expanded
 * - DT-EX02 Expanded content is rendered after toggle
 * - DT-EX03 Collapse button hides expanded content
 * - DT-EX04 Multiple rows can be expanded independently
 * - DT-EX05 Expand button aria-label reflects state
 */

import { test, expect } from '@playwright/test';

test.describe('DataTable — expansion behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/data-table');
  });

  test('DT-EX01 — clicking expand button toggles aria-expanded on row', async ({
    page,
  }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(3); // full-featured has expandable
    const firstRow = grid.locator('[role="row"][aria-rowindex="2"]');
    const before = await firstRow.getAttribute('aria-expanded');
    expect(before).toBe('false');
    const expandBtn = firstRow.getByRole('button', { name: /Expand row/ }).first();
    await expandBtn.click();
    await page.waitForTimeout(100);
    await expect(firstRow).toHaveAttribute('aria-expanded', 'true');
  });

  test('DT-EX02 — expanded content (description text) renders after toggle', async ({
    page,
  }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(3);
    const firstRow = grid.locator('[role="row"][aria-rowindex="2"]');
    const expandBtn = firstRow.getByRole('button', { name: /Expand row/ }).first();
    await expandBtn.click();
    await page.waitForTimeout(100);
    // Demo expanded content includes "Description" text
    const description = grid.getByText('Description').first();
    await expect(description).toBeVisible();
  });

  test('DT-EX03 — collapse hides expanded content', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(3);
    const firstRow = grid.locator('[role="row"][aria-rowindex="2"]');
    const expandBtn = firstRow.getByRole('button', { name: /Expand row/ }).first();
    await expandBtn.click();
    await page.waitForTimeout(100);
    const collapseBtn = firstRow.getByRole('button', { name: /Collapse row/ }).first();
    await collapseBtn.click();
    await page.waitForTimeout(100);
    await expect(firstRow).toHaveAttribute('aria-expanded', 'false');
  });

  test('DT-EX04 — multiple rows can be expanded simultaneously', async ({ page }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(3);
    const row1 = grid.locator('[role="row"][aria-rowindex="2"]');
    const row2 = grid.locator('[role="row"][aria-rowindex="3"]');
    await row1.getByRole('button', { name: /Expand row/ }).first().click();
    await page.waitForTimeout(50);
    await row2.getByRole('button', { name: /Expand row/ }).first().click();
    await page.waitForTimeout(100);
    await expect(row1).toHaveAttribute('aria-expanded', 'true');
    await expect(row2).toHaveAttribute('aria-expanded', 'true');
  });

  test('DT-EX05 — expand button aria-label flips between "Expand row" and "Collapse row"', async ({
    page,
  }) => {
    const grids = page.getByRole('grid');
    const grid = grids.nth(3);
    const firstRow = grid.locator('[role="row"][aria-rowindex="2"]');
    const btn = firstRow
      .getByRole('button', { name: /Expand row|Collapse row/ })
      .first();
    const before = await btn.getAttribute('aria-label');
    expect(before).toMatch(/Expand row/);
    await btn.click();
    await page.waitForTimeout(100);
    const after = await btn.getAttribute('aria-label');
    expect(after).toMatch(/Collapse row/);
  });
});
