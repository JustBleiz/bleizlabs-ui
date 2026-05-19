#!/usr/bin/env node
/**
 * Phase 4.5 demo-coverage audit — verifies every shipped lib component has
 * a matching demo route under `app/components/<kebab-case-name>/page.tsx`.
 *
 * Walks `components/<category>/<Name>/` (skipping `utils/` and `types/`),
 * converts each component PascalCase folder to kebab-case, and asserts the
 * corresponding route exists. Exits 1 with a punch list when gaps remain.
 *
 * Compound exports that ship as a single demo route (e.g. `Card` covers
 * `CardHeader` / `CardBody`, `Timeline` covers `TimelineItem`) are handled
 * by the explicit alias map below — add to it whenever a new compound is
 * promoted.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const APP_COMPONENTS_DIR = path.join(ROOT, 'app', 'components');

const SKIP_CATEGORIES = new Set(['types', 'tests']);

// utils/ holds both internal helpers (Slot, cn, mergeRefs, floating, gesture,
// locale, match-media — building blocks consumers don't demo) AND user-facing
// utility components (VisuallyHidden). Skip the helpers; audit user-facing
// utility components like any other family.
const UTILS_SKIP = new Set([
  'Slot',
  'cn.ts',
  'date.ts',
  'masks.ts',
  'mergeRefs.ts',
  'useFloating.ts',
  'position.ts',
  'floating',
  'gesture',
  'locale',
  'match-media',
  'tests',
]);

// Component → demo-route slug. Use when the route name differs from the
// PascalCase-to-kebab default (compound parts covered by a single demo,
// shorter shared routes, intentional aggregation pages).
const ROUTE_ALIASES = {
  CardHeader: 'card',
  CardBody: 'card',
  CardFooter: 'card',
  CardSection: 'card',
  TableHeader: 'table',
  TableBody: 'table',
  TableFooter: 'table',
  TableRow: 'table',
  TableCell: 'table',
  KpiValueAnimated: 'kpi-value',
  AvatarGroup: 'avatar-group',
  // Phase 6 specialized — bundled landing
  Dot: 'specialized',
  Kbd: 'specialized',
  Sparkline: 'specialized',
  ThemeToggle: 'specialized',
  UsageDonut: 'specialized',
  MetricBar: 'specialized',
  AvailabilityBar: 'specialized',
  AnimatedCounter: 'specialized',
  // Form parts share a single page
  FormSurface: 'form-surface',
  // Feedback aggregator
  Alert: 'feedback',
  Empty: 'feedback',
  Progress: 'feedback',
  // Selection aggregator
  Checkbox: 'selection',
  RadioGroup: 'selection',
  Switch: 'selection',
  // Toggles aggregator
  Toggle: 'toggles',
  ToggleGroup: 'toggles',
  // Molecules landing
  AccordionGroup: 'molecules',
  BackLink: 'molecules',
  DataRow: 'molecules',
  SectionDivider: 'molecules',
  Accordion: 'molecules',
  // Input production aggregator
  InputGroup: 'input-production',
  MaskedInput: 'input-production',
  NumberInput: 'input-production',
  PasswordInput: 'input-production',
  PhoneInput: 'input-production',
  // Specialized aggregator additions
  Breadcrumb: 'specialized',
  Pagination: 'specialized',
};

function pascalToKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function listComponentFolders() {
  const out = [];
  for (const cat of fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    if (SKIP_CATEGORIES.has(cat.name)) continue;
    const catDir = path.join(COMPONENTS_DIR, cat.name);
    for (const comp of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (!comp.isDirectory()) continue;
      if (cat.name === 'utils' && UTILS_SKIP.has(comp.name)) continue;
      const compDir = path.join(catDir, comp.name);
      if (!fs.existsSync(path.join(compDir, 'index.ts'))) continue;
      out.push({ category: cat.name, name: comp.name });
    }
  }
  return out;
}

function routeExists(slug) {
  return fs.existsSync(path.join(APP_COMPONENTS_DIR, slug, 'page.tsx'));
}

function main() {
  const components = listComponentFolders();
  const missing = [];
  for (const c of components) {
    const slug = ROUTE_ALIASES[c.name] ?? pascalToKebab(c.name);
    if (!routeExists(slug)) {
      missing.push({ ...c, slug });
    }
  }

  if (missing.length === 0) {
    console.log(
      `[audit-demo-coverage] OK — ${components.length} components, every one has a demo route.`,
    );
    process.exit(0);
  }

  console.error(`[audit-demo-coverage] FAIL — ${missing.length} component(s) missing demo route:`);
  for (const m of missing) {
    console.error(`  • ${m.category}/${m.name} → expected app/components/${m.slug}/page.tsx`);
  }
  console.error(
    '\nFix: add the missing route OR add the component to ROUTE_ALIASES in scripts/audit-demo-coverage.mjs.',
  );
  process.exit(1);
}

main();
