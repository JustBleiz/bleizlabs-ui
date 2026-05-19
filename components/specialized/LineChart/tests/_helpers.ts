/**
 * LineChart test helpers.
 *
 * Demo route at `/components/line-chart`. Each chart is uniquely identified
 * by its `title` prop (rendered as the sr-only `<caption>` of the data
 * table). The root carries `role="img"` + `aria-labelledby` pointing at a
 * span with the title text.
 */

import type { Page, Locator } from '@playwright/test';

export function chartByTitle(page: Page, title: string): Locator {
  // Find the sr-only <span> whose text matches the title exactly, then walk
  // up to the closest [role="img"] root. This sidesteps Playwright's
  // accessibility-tree latency for `getByRole({ name })` in headless mode
  // and avoids substring collision (e.g. "Weekly leads" vs "Weekly leads
  // (custom tooltip)").
  return page.locator(`[role="img"][aria-labelledby]:has(span:text-is("${title}"))`).first();
}

export function svgOf(chart: Locator): Locator {
  return chart.locator('svg');
}

export function pathsOf(chart: Locator): Locator {
  return chart.locator('svg path[stroke]');
}

export function pointsOf(chart: Locator): Locator {
  return chart.locator('svg circle[data-point-series]');
}

export function pointByIndex(chart: Locator, seriesIdx: number, pointIdx: number): Locator {
  return chart.locator(
    `svg circle[data-point-series="${seriesIdx}"][data-point-index="${pointIdx}"]`,
  );
}

/**
 * Focuses an SVG `<circle>` data point. Playwright's `Locator.focus()` does
 * not reliably propagate to React's synthetic `onFocus` handler on SVG
 * elements across browsers — explicit `element.focus()` via `evaluate`
 * always fires the native focus event, which React captures via event
 * delegation.
 */
export async function focusPoint(point: Locator): Promise<void> {
  await point.evaluate((el) => (el as SVGElement).focus());
}

/**
 * Activates an SVG data point for tooltip testing. Playwright's `.click()`
 * on a small SVG `<circle>` (radius ~4px) can miss the hit area in headless
 * mode; `hover()` doesn't reliably fire `pointermove`; `.focus()` doesn't
 * always propagate React's onFocus on SVG children. Dispatching a synthetic
 * MouseEvent via `evaluate` fires React's onClick delegation directly and
 * sets both focused + pinned state inside handlePointClick — guaranteed
 * tooltip render.
 */
export async function activatePoint(point: Locator): Promise<void> {
  await point.evaluate((el) => {
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: r.x + r.width / 2,
        clientY: r.y + r.height / 2,
      }),
    );
    // Focus the circle too so subsequent keyboard events route to the
    // chart root's onKeyDown handler (e.g. Escape to unpin).
    (el as SVGElement).focus();
  });
}

export function tooltipOf(chart: Locator): Locator {
  return chart.locator('[class*="tooltip"][class*="tooltipVisible"]');
}

export function srTableOf(chart: Locator): Locator {
  return chart.locator('table');
}

export function liveRegionOf(chart: Locator): Locator {
  return chart.locator('[role="status"][aria-live="polite"]');
}

export function crosshairOf(chart: Locator): Locator {
  return chart.locator('svg line[class*="crosshair"]');
}
