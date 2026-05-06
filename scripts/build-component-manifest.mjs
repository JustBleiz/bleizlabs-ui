#!/usr/bin/env node
/**
 * Build component manifest — single source of truth for `@bleizlabs/ui` CLI.
 *
 * Parses `components/index.ts` barrel + per-family `<family>/index.ts` files,
 * categorises every public export (component / type / hook), writes
 * `components/manifest.json`. Schema lives at `components/manifest-schema.json`.
 *
 * Strategy: lightweight regex parsing matching `check-barrel.mjs` style — no
 * ts-morph dep needed. Library exports follow regular patterns (verified via
 * E01 audit of all 84+ family index files).
 *
 * Patterns recognised in barrel:
 *   1. `export * from './<category>/<Family>';`
 *   2. `export { Name1, Name2, type T1, ... } from './<path>';`
 *   3. `export type { T1, T2 } from './<path>';`
 *
 * Patterns recognised in per-family index:
 *   - Same as barrel; resolved relative to family folder.
 *   - Sub-file imports (e.g., `from './Card'`) treated as opaque — exports
 *     captured as-is from the index re-export.
 *
 * Categorisation rules:
 *   - `type Foo` keyword OR `export type {...}` block → types[]
 *   - PascalCase + starts with `use[A-Z]` → hooks[]
 *   - PascalCase + not hook + not type → exports[]
 *
 * Run: `npm run build:manifest`. Validates via `npm run check:manifest`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const BARREL = path.join(COMPONENTS_DIR, 'index.ts');
const PKG_JSON = path.join(ROOT, 'package.json');
const OUTPUT = path.join(COMPONENTS_DIR, 'manifest.json');

function fail(msg) {
  console.error(`[build-manifest] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(BARREL)) fail(`Missing barrel: ${BARREL}`);
if (!fs.existsSync(PKG_JSON)) fail(`Missing package.json: ${PKG_JSON}`);

const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf8'));
const libVersion = pkg.version;
if (!libVersion) fail('package.json has no "version" field.');

/**
 * Strip block + line comments from TypeScript source. Preserves strings
 * (we don't have multi-line strings inside our barrels).
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Parse a single export statement (already stripped of comments and
 * collapsed to single line). Returns { kind, names, sourcePath } or null
 * if not an export-from statement.
 *
 * kind: 'star' | 'named' | 'typeOnly'
 * names: array of { name, isType } — only meaningful for named/typeOnly
 * sourcePath: './X/Y' string from `from '...'`
 */
function parseExportStatement(line) {
  const trimmed = line.trim();
  // Strip trailing semicolon for easier matching.
  const cleaned = trimmed.replace(/;\s*$/, '');

  // export * from './path'
  const starMatch = cleaned.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]$/);
  if (starMatch) {
    return { kind: 'star', names: [], sourcePath: starMatch[1] };
  }

  // export type { A, B } from './path'
  const typeOnlyMatch = cleaned.match(
    /^export\s+type\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]$/,
  );
  if (typeOnlyMatch) {
    const inner = typeOnlyMatch[1];
    const names = inner
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((n) => ({ name: n.replace(/^type\s+/, '').trim(), isType: true }));
    return { kind: 'typeOnly', names, sourcePath: typeOnlyMatch[2] };
  }

  // export { A, type B, C } from './path'
  const namedMatch = cleaned.match(
    /^export\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]$/,
  );
  if (namedMatch) {
    const inner = namedMatch[1];
    const names = inner
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((n) => {
        const isType = /^type\s+/.test(n);
        const name = n.replace(/^type\s+/, '').trim();
        return { name, isType };
      });
    return { kind: 'named', names, sourcePath: namedMatch[2] };
  }

  return null;
}

/**
 * Collapse multi-line `export { A, B, ... } from '...'` into single
 * lines. Multiline brace blocks are common in lib (Card index, Sidebar
 * index). Returns array of single-line export statements.
 */
function collapseExportLines(src) {
  const stripped = stripComments(src);
  const lines = [];
  let buffer = '';
  let inBrace = false;

  for (const rawLine of stripped.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      if (!inBrace) {
        if (buffer) {
          lines.push(buffer);
          buffer = '';
        }
      }
      continue;
    }

    if (!inBrace && /^export\s/.test(line)) {
      buffer = line;
      if (line.includes('{') && !line.includes('}')) {
        inBrace = true;
      } else if (/;\s*$/.test(line) || (!line.includes('{') && line.includes('from'))) {
        lines.push(buffer);
        buffer = '';
      }
      continue;
    }

    if (inBrace) {
      buffer += ' ' + line;
      if (line.includes('}')) {
        inBrace = false;
        if (/;\s*$/.test(buffer) || /from\s+['"][^'"]+['"]/.test(buffer)) {
          lines.push(buffer);
          buffer = '';
        }
      }
      continue;
    }

    if (buffer) {
      // Continuation of previous (non-brace) line.
      buffer += ' ' + line;
      if (/;\s*$/.test(line)) {
        lines.push(buffer);
        buffer = '';
      }
    }
  }

  if (buffer) lines.push(buffer);
  return lines;
}

/**
 * Categorise raw exports into { exports, types, hooks } per manifest schema.
 * - hooks: name matches /^use[A-Z]/
 * - types: isType === true
 * - exports: everything else (PascalCase components, lowercase utility funcs)
 */
function categoriseNames(rawNames) {
  const exportsArr = [];
  const types = [];
  const hooks = [];
  const seen = new Set();
  for (const { name, isType } of rawNames) {
    if (seen.has(name)) continue;
    seen.add(name);
    if (isType) {
      types.push(name);
    } else if (/^use[A-Z]/.test(name)) {
      hooks.push(name);
    } else {
      exportsArr.push(name);
    }
  }
  return {
    exports: exportsArr.sort(),
    types: types.sort(),
    hooks: hooks.sort(),
  };
}

/**
 * Resolve and parse a per-family index file. Returns { exports, types, hooks }.
 */
function readFamilyIndex(familyDir, familyName) {
  const candidates = ['index.ts', 'index.tsx'];
  for (const candidate of candidates) {
    const filePath = path.join(familyDir, candidate);
    if (fs.existsSync(filePath)) {
      const src = fs.readFileSync(filePath, 'utf8');
      const lines = collapseExportLines(src);
      const collected = [];
      for (const line of lines) {
        const parsed = parseExportStatement(line);
        if (!parsed) continue;
        if (parsed.kind === 'star') {
          // Recurse into pointed file (sub-file like ./Card or ./CardHeader).
          const subPath = path.resolve(familyDir, parsed.sourcePath);
          const subExports = readSubFileExports(subPath);
          collected.push(...subExports);
        } else {
          collected.push(...parsed.names);
        }
      }
      return categoriseNames(collected);
    }
  }
  // No index file — try to read FamilyName.tsx / FamilyName.ts directly.
  const tsxPath = path.join(familyDir, `${familyName}.tsx`);
  const tsPath = path.join(familyDir, `${familyName}.ts`);
  for (const filePath of [tsxPath, tsPath]) {
    if (fs.existsSync(filePath)) {
      return readSubFileExports(filePath);
    }
  }
  fail(`Cannot resolve family ${familyName} at ${familyDir}`);
}

/**
 * Read exports from a single sub-file (e.g., `./Card.tsx` referenced from
 * family `index.ts`). Captures top-level export declarations.
 */
function readSubFileExports(basePathNoExt) {
  const candidates = [
    `${basePathNoExt}.tsx`,
    `${basePathNoExt}.ts`,
    `${basePathNoExt}/index.ts`,
    `${basePathNoExt}/index.tsx`,
  ];
  let src = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      src = fs.readFileSync(candidate, 'utf8');
      break;
    }
  }
  if (src == null) {
    return [];
  }
  const stripped = stripComments(src);
  const collected = [];

  // Top-level function / const / class / interface / type declarations.
  // export function Foo(...) / export const Foo = / export class Foo / export interface Foo / export type Foo
  const declRegex =
    /^export\s+(?:async\s+)?(function|const|let|var|class|interface|type|enum)\s+([A-Za-z][A-Za-z0-9]*)/gm;
  let match;
  while ((match = declRegex.exec(stripped)) !== null) {
    const kind = match[1];
    const name = match[2];
    const isType = kind === 'type' || kind === 'interface';
    collected.push({ name, isType });
  }

  // Re-export blocks within the sub-file (e.g., Sidebar.tsx might re-export sub-utilities).
  const lines = collapseExportLines(stripped);
  for (const line of lines) {
    const parsed = parseExportStatement(line);
    if (parsed && (parsed.kind === 'named' || parsed.kind === 'typeOnly')) {
      collected.push(...parsed.names);
    }
  }

  return collected;
}

// ---------------------------------------------------------------------------
// Main barrel walk
// ---------------------------------------------------------------------------

const barrelSrc = fs.readFileSync(BARREL, 'utf8');
const barrelLines = collapseExportLines(barrelSrc);

const components = [];
const utilities = [];
const typesOnly = [];
const categoriesMap = {};

for (const line of barrelLines) {
  const parsed = parseExportStatement(line);
  if (!parsed) continue;

  // Path shape: './<category>/<Family>' OR './<path>' for utils/types
  const segments = parsed.sourcePath.replace(/^\.\//, '').split('/');
  if (segments.length < 2) continue;

  const category = segments[0];
  const family = segments[1];
  const familyPath = `${category}/${family}`;
  const familyDir = path.join(COMPONENTS_DIR, category, family);

  if (parsed.kind === 'star') {
    // Component / molecule / preset / complex family.
    if (!fs.existsSync(familyDir)) {
      fail(`Barrel references missing family dir: ${familyDir}`);
    }
    const { exports, types, hooks } = readFamilyIndex(familyDir, family);
    if (exports.length === 0 && types.length === 0 && hooks.length === 0) {
      console.warn(`[build-manifest] WARN: family ${familyPath} has zero exports`);
    }
    components.push({
      family,
      category,
      path: familyPath,
      exports,
      types,
      hooks,
    });
    if (!categoriesMap[category]) categoriesMap[category] = [];
    categoriesMap[category].push(family);
  } else if (parsed.kind === 'named') {
    // Utility (e.g., './utils/Slot' → Slot + SlotProps).
    const { exports, types, hooks } = categoriseNames(parsed.names);
    utilities.push({
      family,
      category,
      path: familyPath,
      exports,
      types,
      hooks,
    });
  } else if (parsed.kind === 'typeOnly') {
    // Type-only re-export (e.g., './types/spacing' → SpaceIndex).
    const { exports, types, hooks } = categoriseNames(parsed.names);
    typesOnly.push({
      family,
      category,
      path: familyPath,
      exports,
      types,
      hooks,
    });
  }
}

// Alphabetise within each category.
for (const cat of Object.keys(categoriesMap)) {
  categoriesMap[cat].sort();
}

// Stable ordering: components by category then family, utilities + typesOnly by family.
const categoryOrder = [
  'layout',
  'typography',
  'display',
  'interactive',
  'feedback',
  'specialized',
  'molecules',
  'presets',
  'complex',
  'utils',
  'types',
];
components.sort((a, b) => {
  const ca = categoryOrder.indexOf(a.category);
  const cb = categoryOrder.indexOf(b.category);
  if (ca !== cb) return ca - cb;
  return a.family.localeCompare(b.family);
});
utilities.sort((a, b) => a.family.localeCompare(b.family));
typesOnly.sort((a, b) => a.family.localeCompare(b.family));

const manifest = {
  schemaVersion: '1',
  libVersion,
  generatedAt: new Date().toISOString(),
  categories: categoriesMap,
  components,
  utilities,
  typesOnly,
};

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const componentCount = components.length;
const utilCount = utilities.length;
const typeOnlyCount = typesOnly.length;
const totalExports =
  components.reduce((n, f) => n + f.exports.length + f.types.length + f.hooks.length, 0) +
  utilities.reduce((n, f) => n + f.exports.length + f.types.length + f.hooks.length, 0) +
  typesOnly.reduce((n, f) => n + f.exports.length + f.types.length + f.hooks.length, 0);

console.log(`[build-manifest] OK`);
console.log(`  components:  ${componentCount} families`);
console.log(`  utilities:   ${utilCount} families`);
console.log(`  types-only:  ${typeOnlyCount} families`);
console.log(`  total names: ${totalExports}`);
console.log(`  output:      ${path.relative(ROOT, OUTPUT)}`);
console.log(`  lib version: ${libVersion}`);
