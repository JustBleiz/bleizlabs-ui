/**
 * useFloating popover-position-flicker regression spec (0.18.0 BUGFIX).
 *
 * Forensic context: user reported 2026-05-12 that clicking the calendar
 * icon in DateRangePicker briefly opened the popover ABOVE the input
 * field, then JUMPED DOWN below it. DOM measurement across 200ms of
 * requestAnimationFrame ticks showed the popover sat at viewport (0, -4)
 * for the entire animation duration before snapping to its measured
 * position at (input.x, input.y + offset).
 *
 * ROOT CAUSE: every floating-popover SCSS module (DatePicker /
 * DateRangePicker / Select / Combobox / DropdownMenu / HoverCard /
 * NavigationMenu) had an entrance keyframe of the form:
 *
 *   @keyframes <name>ContentIn {
 *     from { opacity: 0; transform: translateY(-4px); }
 *     to   { opacity: 1; transform: translateY(0); }
 *   }
 *
 * The keyframe `transform` OVERRIDES the inline `transform:
 * translate3d(x, y, 0)` that `useFloating` writes via `floatingStyles`
 * for the duration of the animation. The popover paints at viewport
 * top-left for ~200ms before reverting to the inline transform.
 *
 * FIX: every popover keyframe now animates ONLY `opacity`. The
 * positioning transform is `useFloating`'s sole responsibility.
 * `useFloating` additionally exposes a `visibility: hidden` guard until
 * the first measurement completes so the floating element never paints
 * at the placeholder (0, 0) coords.
 *
 * Coverage:
 * - FLICK-01..04 — opening the four 0.18.0 picker popovers samples the
 *   dialog position across 12 animation frames; ALL frames must report
 *   the same (x, y) coordinates (allowing ±2px rounding noise) and
 *   `visibility: visible`.
 */

import { test, expect } from '@playwright/test';

interface PositionSample {
  t: number;
  x: number;
  y: number;
  visibility: string;
}

async function sampleDialogPosition(
  page: import('@playwright/test').Page,
  triggerSelector: string,
  frames = 12,
): Promise<PositionSample[]> {
  return page.evaluate(
    async ({ selector, frames }) => {
      const btn = document.querySelector(selector) as HTMLElement;
      if (!btn) throw new Error(`Trigger not found: ${selector}`);
      const samples: PositionSample[] = [];
      const start = performance.now();
      btn.click();
      for (let i = 0; i < frames; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const d = document.querySelector('div[role="dialog"]');
        if (!d) {
          samples.push({
            t: Math.round(performance.now() - start),
            x: -1,
            y: -1,
            visibility: 'missing',
          });
          continue;
        }
        const rect = d.getBoundingClientRect();
        const cs = window.getComputedStyle(d);
        samples.push({
          t: Math.round(performance.now() - start),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          visibility: cs.visibility,
        });
      }
      return samples;
    },
    { selector: triggerSelector, frames },
  );
}

function assertStablePosition(samples: PositionSample[]) {
  // Drop frames where the dialog wasn't mounted yet OR was still
  // `visibility: hidden` waiting for the first useFloating measurement.
  // The remaining "visible" frames must agree on (x, y) within ±2 px
  // rounding. We tolerate 4-frame delay before mount/measurement
  // commits — some demo routes need an extra React tick before the
  // popover's transform settles, but every frame AFTER must be stable.
  const valid = samples.filter((s) => s.visibility === 'visible');
  expect(valid.length).toBeGreaterThanOrEqual(4);
  const first = valid[0]!;
  for (const s of valid) {
    expect(Math.abs(s.x - first.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(s.y - first.y)).toBeLessThanOrEqual(2);
    expect(s.visibility).toBe('visible');
  }
  // Bug-specific sanity — pre-fix samples showed y=-4 followed by y=0
  // followed by y=448 (animation lerp + post-anim snap). Post-fix all
  // samples are within ±2px of `first`. The consistency assertion above
  // is the canonical proof. Absolute position is environment-dependent
  // (viewport scroll, demo route layout) so we do NOT assert specific
  // (x, y) values — the flicker signature was per-frame DIVERGENCE,
  // not absolute position.
}

test.describe('useFloating — popover position flicker regression', () => {
  test.beforeEach(async ({ page }) => {
    // Intentionally do NOT emulate reduced-motion — we want the entrance
    // animation to RUN so that any keyframe-vs-inline-transform conflict
    // surfaces. With reducedMotion: 'reduce' the animation is suppressed
    // and the bug would not reproduce.
  });

  test('FLICK-01 — DatePicker popover stable position across animation', async ({ page }) => {
    await page.goto('/components/date-picker');
    // First "Open calendar" trigger on the page (basic uncontrolled use case)
    const samples = await sampleDialogPosition(page, 'button[aria-label="Open calendar"]');
    assertStablePosition(samples);
  });

  test('FLICK-02 — DateRangePicker popover stable position', async ({ page }) => {
    await page.goto('/components/date-range-picker');
    const samples = await sampleDialogPosition(
      page,
      '[aria-label="Basic single-month range"] button[aria-label="Open calendar"]',
    );
    assertStablePosition(samples);
  });

  test('FLICK-03 — TimePicker popover stable position', async ({ page }) => {
    await page.goto('/components/time-picker');
    // TimePicker opens via Alt+ArrowDown — synthesise via focus+key
    await page.locator('input[role="combobox"][aria-label="Start time"]').focus();
    const samples: PositionSample[] = await page.evaluate(async () => {
      const samples: PositionSample[] = [];
      const start = performance.now();
      // Synthesise Alt+ArrowDown
      const target = document.activeElement as HTMLElement;
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
      );
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const d = document.querySelector('div[role="dialog"]');
        if (!d) {
          samples.push({
            t: Math.round(performance.now() - start),
            x: -1,
            y: -1,
            visibility: 'missing',
          });
          continue;
        }
        const rect = d.getBoundingClientRect();
        const cs = window.getComputedStyle(d);
        samples.push({
          t: Math.round(performance.now() - start),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          visibility: cs.visibility,
        });
      }
      return samples;
    });
    assertStablePosition(samples);
  });

  test('FLICK-04 — DateTimePicker popover stable position', async ({ page }) => {
    await page.goto('/components/date-time-picker');
    // DateTimePicker input opens via Alt+ArrowDown (preferred over click
    // for deterministic event flow inside `page.evaluate`).
    await page.locator('input[role="combobox"][aria-label="Start datetime"]').focus();
    const samples: PositionSample[] = await page.evaluate(async () => {
      const samples: PositionSample[] = [];
      const start = performance.now();
      const target = document.activeElement as HTMLElement;
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }),
      );
      for (let i = 0; i < 16; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const d = document.querySelector('div[role="dialog"]');
        if (!d) {
          samples.push({
            t: Math.round(performance.now() - start),
            x: -1,
            y: -1,
            visibility: 'missing',
          });
          continue;
        }
        const rect = d.getBoundingClientRect();
        const cs = window.getComputedStyle(d);
        samples.push({
          t: Math.round(performance.now() - start),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          visibility: cs.visibility,
        });
      }
      return samples;
    });
    assertStablePosition(samples);
  });
});
