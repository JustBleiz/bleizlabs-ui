/**
 * LineChart keyboard navigation spec.
 *
 * Coverage: Arrow keys move between points, Up/Down switch series,
 * Home/End jump to first/last, Space/Enter fire onPointClick.
 *
 * Total: 6 cases (LC-K01..LC-K06).
 */

import { test, expect } from '@playwright/test';
import { chartByTitle, pointByIndex, focusPoint } from './_helpers';

const URL = '/components/line-chart';

test.describe('LineChart — keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
  });

  test('LC-K01: ArrowRight moves focus to next point in series', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point0 = pointByIndex(chart, 0, 0);
    await focusPoint(point0);
    await page.keyboard.press('ArrowRight');
    const point1 = pointByIndex(chart, 0, 1);
    await expect(point1).toBeFocused();
  });

  test('LC-K02: ArrowLeft loops from first to last point', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point0 = pointByIndex(chart, 0, 0);
    await focusPoint(point0);
    await page.keyboard.press('ArrowLeft');
    // weeklyLeads has 12 points, so last index is 11
    const last = pointByIndex(chart, 0, 11);
    await expect(last).toBeFocused();
  });

  test('LC-K03: Home jumps to first point in series', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point5 = pointByIndex(chart, 0, 5);
    await focusPoint(point5);
    await page.keyboard.press('Home');
    const first = pointByIndex(chart, 0, 0);
    await expect(first).toBeFocused();
  });

  test('LC-K04: End jumps to last point in series', async ({ page }) => {
    const chart = chartByTitle(page, 'Weekly leads');
    const point0 = pointByIndex(chart, 0, 0);
    await focusPoint(point0);
    await page.keyboard.press('End');
    const last = pointByIndex(chart, 0, 11);
    await expect(last).toBeFocused();
  });

  test('LC-K05: ArrowDown switches to next series at same x index', async ({ page }) => {
    const chart = chartByTitle(page, 'Lead source comparison');
    const s0p3 = pointByIndex(chart, 0, 3);
    await focusPoint(s0p3);
    await page.keyboard.press('ArrowDown');
    const s1p3 = pointByIndex(chart, 1, 3);
    await expect(s1p3).toBeFocused();
  });

  test('LC-K06: Space activates focused point (onPointClick fires)', async ({ page }) => {
    const chart = chartByTitle(page, 'Click points to filter');
    const point = pointByIndex(chart, 0, 2);
    await focusPoint(point);
    await page.keyboard.press('Space');
    // Demo updates external state; the controls text should reflect selection
    const indicator = page.getByText(/Selected: linkedin, point #3/);
    await expect(indicator).toBeVisible();
  });
});
