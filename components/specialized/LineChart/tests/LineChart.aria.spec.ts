/**
 * LineChart ARIA + axe-core spec.
 *
 * Coverage: role="img" + aria-labelledby/describedby chain, sr-only
 * <table> caption + headers + rows, per-point aria-label format, live
 * region presence, axe-core zero violations.
 *
 * Total: 8 cases (LC-A01..LC-A08).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chartByTitle, srTableOf, liveRegionOf, pointsOf } from './_helpers';

const URL = '/components/line-chart';

test.describe('LineChart — ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
  });

  test('LC-A01: root has role="img" with aria-labelledby + aria-describedby', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    await expect(chart).toHaveAttribute('role', 'img');
    const labelledBy = await chart.getAttribute('aria-labelledby');
    const describedBy = await chart.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(describedBy?.split(' ').length).toBeGreaterThanOrEqual(3);
  });

  test('LC-A02: sr-only <table> has caption matching title', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const table = srTableOf(chart);
    await expect(table).toBeAttached();
    const caption = table.locator('caption');
    await expect(caption).toHaveText('Weekly leads');
  });

  test('LC-A03: sr-only <table> has headers per series', async ({ page }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const table = srTableOf(chart);
    const thead = table.locator('thead th');
    // Expect: X + LinkedIn + Cold email + Partner = 4 column headers
    await expect(thead).toHaveCount(4);
    await expect(thead.nth(1)).toHaveText('LinkedIn');
    await expect(thead.nth(2)).toHaveText('Cold email');
    await expect(thead.nth(3)).toHaveText('Partner');
  });

  test('LC-A04: sr-only <table> tbody has row per unified X', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const table = srTableOf(chart);
    const rows = table.locator('tbody tr');
    // weeklyLeads has 12 data points
    await expect(rows).toHaveCount(12);
  });

  test('LC-A05: per-point aria-label includes series name + x label + y value', async ({
    page,
  }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point = pointsOf(chart).first();
    const ariaLabel = await point.getAttribute('aria-label');
    expect(ariaLabel).toContain('Leads');
    expect(ariaLabel).toMatch(/Week 1.*\d+/);
  });

  test('LC-A06: live region exists with role=status + aria-live=polite', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const live = liveRegionOf(chart);
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await expect(live).toHaveAttribute('aria-atomic', 'true');
  });

  test('LC-A07: empty-state chart still has sr-only table with caption', async ({ page }) => {
    const chart = chartByTitle(page, 'No data available');
    const table = srTableOf(chart);
    await expect(table).toBeAttached();
    await expect(table.locator('caption')).toHaveText('No data available');
    // tbody empty (no rows)
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(0);
  });

  test('LC-A08: axe-core zero violations on demo route', async ({ page }) => {
    const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    expect(results.violations).toEqual([]);
  });
});
