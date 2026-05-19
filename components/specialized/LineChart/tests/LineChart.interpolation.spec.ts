/**
 * LineChart interpolation spec.
 *
 * Coverage: smooth (Catmull-Rom, cubic Beziers in path) vs linear (M+L
 * commands only) path generation.
 *
 * Total: 4 cases (LC-I01..LC-I04).
 */

import { test, expect } from '@playwright/test';
import { chartByTitle, pathsOf } from './_helpers';

const URL = '/components/line-chart';

test.describe('LineChart — interpolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
  });

  test('LC-I01: smooth interpolation emits cubic Bezier commands (C)', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const path = pathsOf(chart).first();
    const d = await path.getAttribute('d');
    expect(d).toBeTruthy();
    expect(d!).toContain('C ');
  });

  test('LC-I02: linear interpolation emits only L commands (no C)', async ({ page }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const path = pathsOf(chart).first();
    const d = await path.getAttribute('d');
    expect(d).toBeTruthy();
    expect(d!).toContain('L ');
    expect(d!).not.toContain('C ');
  });

  test('LC-I03: every series path starts with M command', async ({ page }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const paths = pathsOf(chart);
    const count = await paths.count();
    expect(count).toBe(3);
    for (let i = 0; i < count; i++) {
      const d = await paths.nth(i).getAttribute('d');
      expect(d).toMatch(/^M /);
    }
  });

  test('LC-I04: path has pathLength=1 attribute for animation', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const path = pathsOf(chart).first();
    await expect(path).toHaveAttribute('pathLength', '1');
  });
});
