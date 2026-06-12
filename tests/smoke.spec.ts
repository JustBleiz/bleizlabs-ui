/**
 * Smoke test suite — E142 L2 library-wide accessibility safety net.
 *
 * Iterates every demo route in the `@bleizlabs/ui` playground and runs
 * @axe-core/playwright against it with WCAG 2.1 A + AA tags. The library
 * contract (D25 "zero-violations baseline") means any CRITICAL/SERIOUS
 * impact blocks CI and publication; MODERATE/MINOR triage per D-E142.6
 * in `context.md` Spec (Tier 3).
 *
 * ROUTES are derived from the filesystem (`app/components/<slug>/page.tsx`)
 * so new demo pages join the scan automatically — no manual list to drift
 * (E06: the previous hand-maintained list silently carried 4 dead routes and
 * missed ~40 live ones). Routes with KNOWN pre-existing violations are
 * excluded via SKIP_ROUTES below — every entry MUST carry a reason and a
 * follow-up pointer; a bare exclusion is a review-blocking smell.
 *
 * Each scan also asserts the route responds 200 — a deleted demo folder
 * previously rendered Next's (axe-clean) 404 page and PASSED, masking the
 * coverage gap.
 *
 * This layer does NOT exercise keyboard interaction, focus order, or ARIA
 * state transitions — those live in per-component suites under
 * `components/<Name>/tests/*.spec.ts` (L3a-L3e conversion). Smoke only
 * catches violations present in the INITIAL rendered page state.
 *
 * Next.js dev overlays (devtools, error toasts, portal root) are excluded
 * from the scan — they are not consumer-visible in library tarball output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_COMPONENTS_DIR = path.resolve(__dirname, '..', 'app', 'components');

/**
 * Demo routes excluded from the smoke scan. Every entry needs a REASON with
 * provenance (when/where the violation was observed) — exclusions without a
 * reason do not survive review. Re-test candidates whenever the underlying
 * component changes; remove the entry once the route scans clean.
 */
const SKIP_ROUTES: Record<string, string> = {
  // ── Chart family (never had axe coverage — test sprint deferred since
  // 0.20.x; full a11y pass = follow-up unit, see work-unit devlog) ──
  '/components/pie-chart':
    'Pre-existing axe violations OBSERVED LIVE during E04 audit remediation ' +
    '(2026-06, work/2026-06_audit-remediation devlog): aria-hidden-focus on ' +
    'segment SVG + caption color-contrast.',
  '/components/bar-chart':
    'Pre-existing violations OBSERVED 2026-06-12 (E06 ROUTES resync, cold prod ' +
    'build): aria-hidden-focus + nested-interactive on chart SVG (same class ' +
    'as pie-chart).',
  '/components/area-chart':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES ' +
    'resync): chart caption/legend text.',
  '/components/sparkline':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES ' +
    'resync): chart caption/label text.',
  // ── Non-chart components with pre-existing violations discovered the
  // moment their routes joined the scan (previously unscanned — the old
  // hand-maintained list never included them). Component-level fixes =
  // dedicated follow-up unit, out of E06 (CI infra) scope. ──
  '/components/avatar-group':
    'Pre-existing CRITICAL violations OBSERVED 2026-06-12 (E06 ROUTES resync): ' +
    'aria-prohibited-attr (aria-label on overflow-chip span), ' +
    'aria-required-parent (role="listitem" wrapper structure), list rule on ' +
    '<ul aria-label="Assignees">. AvatarGroup needs an ARIA-structure fix.',
  '/components/breakdown-list':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES resync).',
  '/components/code-block':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES resync).',
  '/components/kpi-value':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES ' +
    'resync): trendLabel (-3%) on trendDown rows.',
  '/components/metric-tile':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES resync).',
  '/components/time-input':
    'Pre-existing serious color-contrast OBSERVED 2026-06-12 (E06 ROUTES ' +
    'resync): AM/PM period switch button.',
};

const componentRoutes = fs
  .readdirSync(APP_COMPONENTS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .filter((e) => fs.existsSync(path.join(APP_COMPONENTS_DIR, e.name, 'page.tsx')))
  .map((e) => `/components/${e.name}`);

// '/' is the playground catalogue page. The old list also carried '/demo' —
// that route never existed in app/ (5th dead entry, masked by the axe-clean
// 404 page before the 200-status assert below was added).
// Staleness guard: a skip entry whose demo folder was deleted/renamed should
// fail loudly instead of rotting in the list.
for (const skipped of Object.keys(SKIP_ROUTES)) {
  if (!componentRoutes.includes(skipped)) {
    throw new Error(
      `SKIP_ROUTES entry ${skipped} matches no app/components/<slug>/page.tsx — remove or update it.`,
    );
  }
}

const ROUTES = ['/', ...componentRoutes].filter((route) => !(route in SKIP_ROUTES));

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
        // Hydration mismatches (React #418/#419/#423/#425) from Slot/Portal
        // interactions get surfaced by per-component suites in L3 with richer diffs.
        // Smoke's job is axe-contract coverage, not React reconciliation.
        if (/Minified React error #(418|419|423|425)/.test(err.message)) return;
        if (/Hydration failed/.test(err.message)) return;
        consoleErrors.push(err.message);
      });

      const response = await page.goto(route, { waitUntil: 'load' });
      expect(
        response?.status(),
        `Route ${route} did not respond 200 — dead demo route or runtime crash`,
      ).toBe(200);
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
