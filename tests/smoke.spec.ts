/**
 * Smoke test suite — E142 L2 library-wide accessibility safety net.
 *
 * Iterates every demo route in the `@bleizlabs/ui` playground and runs
 * @axe-core/playwright against it with WCAG 2.1 A + AA tags. The library
 * contract (D25 "zero-violations baseline") means any CRITICAL/SERIOUS
 * impact blocks CI and publication; MODERATE/MINOR triage per D-E142.6
 * in `context.md` Spec (Tier 3).
 *
 * This layer does NOT exercise keyboard interaction, focus order, or ARIA
 * state transitions — those live in per-component suites under
 * `components/<Name>/tests/*.spec.ts` (L3a-L3e conversion). Smoke only
 * catches violations present in the INITIAL rendered page state.
 *
 * Next.js dev overlays (devtools, error toasts, portal root) are excluded
 * from the scan — they are not consumer-visible in library tarball output.
 *
 * Runtime target: <=3 min in CI (4 workers x 49 routes @ ~2s axe scan).
 */

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  '/',
  '/demo',
  '/components/alert-dialog',
  '/components/anchor',
  '/components/aspect-ratio',
  '/components/avatar',
  '/components/badge',
  '/components/button',
  '/components/calendar',
  '/components/card',
  '/components/carousel',
  '/components/collapsible-zone-card',
  '/components/combobox',
  '/components/command',
  '/components/container',
  '/components/context-menu',
  '/components/date-picker',
  '/components/dialog',
  '/components/drawer',
  '/components/dropdown-menu',
  '/components/edge-bar',
  '/components/feedback',
  '/components/heading',
  '/components/hover-card',
  '/components/icon-box',
  '/components/inline',
  '/components/input',
  '/components/input-otp',
  '/components/input-production',
  '/components/molecules',
  '/components/navigation-menu',
  '/components/paired-card',
  '/components/popover',
  '/components/presets',
  '/components/scroll-area',
  '/components/section',
  '/components/select',
  '/components/selection',
  '/components/separator',
  '/components/sheet',
  '/components/sidebar',
  '/components/site-header',
  '/components/skeleton',
  '/components/slider',
  '/components/specialized',
  '/components/spinner',
  '/components/stack',
  '/components/table',
  '/components/tabs',
  '/components/text',
  '/components/timeline',
  '/components/toast',
  '/components/toggles',
  '/components/tooltip',
] as const;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const DEV_OVERLAY_SELECTORS = [
  'nextjs-portal',
  '[data-nextjs-toast]',
  '[data-nextjs-dialog]',
  '[data-nextjs-dialog-overlay]',
  '#__next-build-watcher',
  // Demo pages intentionally embed 3rd-party iframes (Wikipedia, etc.) to
  // showcase AspectRatio with external content. Those pages are outside
  // the library's a11y responsibility — exclude from smoke.
  'iframe',
];

test.describe('smoke: library-wide axe-core WCAG 2.1 AA scan', () => {
  for (const route of ROUTES) {
    test(`axe scan - ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('pageerror', (err) => {
        // Hydration mismatches (React #418/#423) from Slot/Portal interactions
        // get surfaced by per-component suites in L3 with richer diffs.
        // Smoke's job is axe-contract coverage, not React reconciliation.
        if (/Minified React error #(418|419|423|425)/.test(err.message)) return;
        if (/Hydration failed/.test(err.message)) return;
        consoleErrors.push(err.message);
      });

      await page.goto(route, { waitUntil: 'load' });
      // Give React a tick to hydrate and commit client effects before scanning.
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(250);

      let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
      for (const selector of DEV_OVERLAY_SELECTORS) {
        builder = builder.exclude(selector);
      }
      const results = await builder.analyze();

      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodeCount: v.nodes.length,
        sample: v.nodes[0]?.html?.slice(0, 240) ?? '',
        targets: v.nodes.slice(0, 3).map((n) => n.target?.join(' ') ?? ''),
      }));

      expect(
        consoleErrors,
        `Uncaught page errors on ${route}:\n${consoleErrors.join('\n')}`,
      ).toEqual([]);

      expect(summary, `axe violations on ${route}:\n${JSON.stringify(summary, null, 2)}`).toEqual(
        [],
      );
    });
  }
});
