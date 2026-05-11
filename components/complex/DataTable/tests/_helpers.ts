/**
 * Test helpers for DataTable Playwright suites.
 *
 * `allGrids` returns every DataTable landmark on the demo page regardless of
 * whether it renders `role="grid"` (default) or `role="treegrid"` (when
 * `expandable` is provided per WAI-ARIA 1.2 + axe `aria-conditional-attr`).
 *
 * Using `page.getByRole('grid')` alone would skip the full-featured demo
 * (USE CASE 4) and shift every subsequent index by `-1`, silently re-targeting
 * downstream tests onto the wrong demo grid.
 */

import type { Page, Locator } from '@playwright/test';

export function allGrids(page: Page): Locator {
  return page.locator('[role="grid"], [role="treegrid"]');
}
