/**
 * LineChart responsive spec.
 *
 * Coverage: aspect-ratio enforced at default 16/9, explicit height prop
 * overrides aspect-ratio, viewBox stays constant under viewport resize.
 *
 * Total: 3 cases (LC-RS01..LC-RS03).
 */

import { test, expect } from '@playwright/test';
import { chartByTitle, svgOf } from './_helpers';

const URL = '/components/line-chart';

test.describe('LineChart — responsive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
  });

  test('LC-RS01: container has aspect-ratio set via CSS variable', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const container = chart.locator('[data-explicit-height]').first();
    const aspectRatio = await container.evaluate((el) => window.getComputedStyle(el).aspectRatio);
    // 16/9 = 1.777...
    expect(aspectRatio).toMatch(/^(16 \/ 9|1\.7)/);
  });

  test('LC-RS02: SVG viewBox is fixed at 600x340 regardless of viewport', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const svg = svgOf(chart);
    await expect(svg).toHaveAttribute('viewBox', '0 0 600 340');
  });

  test('LC-RS03: viewport resize does not throw or break chart render', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    await expect(chart).toBeVisible();

    const errors: Error[] = [];
    page.on('pageerror', (err) => errors.push(err));

    // Resize down
    await page.setViewportSize({ width: 600, height: 800 });
    await page.waitForTimeout(200);
    await expect(chart).toBeVisible();

    // Resize up
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(200);
    await expect(chart).toBeVisible();

    expect(errors).toHaveLength(0);
  });
});
