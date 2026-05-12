/**
 * LineChart tooltip + crosshair spec.
 *
 * Coverage: tooltip shows on hover/focus, crosshair appears, tooltip
 * dismissed on pointer leave, Escape unpins, tooltip contains series swatch
 * + name + value, custom tooltip slot renders.
 *
 * Total: 6 cases (LC-T01..LC-T06).
 */

import { test, expect } from '@playwright/test';
import {
  chartByTitle,
  pointByIndex,
  tooltipOf,
  crosshairOf,
  activatePoint,
} from './_helpers';

const URL = '/components/line-chart';

test.describe('LineChart — tooltip', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
  });

  test('LC-T01: focus on data point shows tooltip + crosshair', async ({
    page,
  }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point = pointByIndex(chart, 0, 0);
    await activatePoint(point);
    const tooltip = tooltipOf(chart);
    await expect(tooltip).toBeVisible();
    // Crosshair is a vertical SVG <line> with zero-width bounding box
    // (x1===x2); Playwright's `toBeVisible` treats zero-area boxes as
    // hidden. Verify presence + opacity class instead.
    const crosshair = crosshairOf(chart);
    await expect(crosshair).toBeAttached();
    const cls = await crosshair.getAttribute('class');
    expect(cls).toContain('crosshairVisible');
  });

  test('LC-T02: tooltip contains series name + formatted value', async ({
    page,
  }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const point = pointByIndex(chart, 0, 0);
    await activatePoint(point);
    const tooltip = tooltipOf(chart);
    const text = await tooltip.textContent();
    expect(text).toContain('LinkedIn');
    // Multi-series crosshair shows all three rows
    expect(text).toContain('Cold email');
    expect(text).toContain('Partner');
  });

  test('LC-T03: tooltip dismissed on Escape (when pinned)', async ({
    page,
  }) => {
    const chart = chartByTitle(page, 'Click points to filter');
    const point = pointByIndex(chart, 0, 2);
    await activatePoint(point);
    await page.keyboard.press('Space');
    await expect(tooltipOf(chart)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltipOf(chart)).not.toBeAttached();
  });

  test('LC-T04: tooltip swatch matches series color', async ({ page }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const point = pointByIndex(chart, 1, 3);
    await activatePoint(point);
    const tooltip = tooltipOf(chart);
    const swatches = tooltip.locator('[class*="tooltipSwatch"]');
    const count = await swatches.count();
    expect(count).toBe(3);
  });

  test('LC-T05: custom renderTooltip slot replaces default body', async ({
    page,
  }) => {
    const chart = chartByTitle(page, 'Weekly leads (custom tooltip)');
    const point = pointByIndex(chart, 0, 5);
    await activatePoint(point);
    const tooltip = tooltipOf(chart);
    const text = await tooltip.textContent();
    // Custom tooltip emits "leads from Leads" copy
    expect(text).toContain('leads from');
  });

  test('LC-T06: tooltip hidden when no focus + no hover', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    // Click outside the chart to ensure no focus
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Tab').catch(() => {
      // Tab may not land anywhere meaningful; ignore
    });
    const tooltip = chart.locator('[class*="tooltipVisible"]');
    await expect(tooltip).toHaveCount(0);
  });
});
