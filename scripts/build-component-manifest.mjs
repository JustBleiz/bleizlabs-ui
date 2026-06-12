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
 *
 * `--check` mode (CI drift gate): regenerates the manifest IN MEMORY and
 * diffs it against the committed `components/manifest.json` — exits 1 on
 * any difference instead of writing. `generatedAt` is excluded from the
 * comparison (it changes every run by design). Wire: `npm run check:manifest:sync`.
 */

import { execSync } from 'node:child_process';
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
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
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
  const typeOnlyMatch = cleaned.match(/^export\s+type\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]$/);
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
  const namedMatch = cleaned.match(/^export\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]$/);
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
 * Resolve a relative import path (from a family index) to the actual file on
 * disk. Returns absolute file path if found, null otherwise. Used by both
 * export-extraction (`readSubFileExports`) and primary-file-resolution
 * (`resolvePrimaryFile`).
 */
function resolveModulePath(basePathNoExt) {
  const candidates = [
    `${basePathNoExt}.tsx`,
    `${basePathNoExt}.ts`,
    `${basePathNoExt}/index.tsx`,
    `${basePathNoExt}/index.ts`,
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Resolve a family's "primary file" — the .tsx/.ts file that hosts the family's
 * defining component (the source of the top JSDoc block + `'use client'`
 * directive). Resolution order:
 *
 *   1. Read family `index.ts`/`index.tsx`. Find FIRST `export ... from './X'`
 *      statement. Resolve `./X` to an actual file.
 *   2. Fallback: `<familyDir>/<familyName>.tsx` or `.ts`.
 *   3. Fallback²: any single `.tsx` file in the folder.
 *
 * Returns absolute path or null.
 */
function resolvePrimaryFile(familyDir, familyName) {
  // 1. Try via family index re-export
  for (const indexName of ['index.ts', 'index.tsx']) {
    const indexPath = path.join(familyDir, indexName);
    if (!fs.existsSync(indexPath)) continue;
    const src = fs.readFileSync(indexPath, 'utf8');
    const lines = collapseExportLines(src);
    for (const line of lines) {
      const parsed = parseExportStatement(line);
      if (parsed && parsed.sourcePath && parsed.sourcePath.startsWith('./')) {
        // Resolve relative to family dir
        const resolved = resolveModulePath(path.resolve(familyDir, parsed.sourcePath));
        if (resolved) return resolved;
      }
    }
  }
  // 2. Fallback: <familyDir>/<familyName>.tsx or .ts
  for (const ext of ['.tsx', '.ts']) {
    const fallback = path.join(familyDir, `${familyName}${ext}`);
    if (fs.existsSync(fallback)) return fallback;
  }
  // 3. Fallback²: first .tsx file in folder
  if (fs.existsSync(familyDir)) {
    const tsxFiles = fs
      .readdirSync(familyDir)
      .filter((f) => f.endsWith('.tsx'))
      .sort();
    if (tsxFiles.length > 0) return path.join(familyDir, tsxFiles[0]);
  }
  return null;
}

/**
 * Detect whether a primary file is a Client Component. True IFF the file's
 * FIRST non-empty, non-comment line is a `'use client'` or `"use client"`
 * directive (per React 19 / Next.js 16 convention — directive MUST be at top
 * of file before any imports). Robust against:
 *   - single vs double quotes
 *   - leading whitespace
 *   - leading shebang `#!...` (rare in lib but possible)
 *   - leading block comment (we strip comments before checking)
 *
 * Returns false if file unreadable or directive absent.
 */
function detectUseClient(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  const src = fs.readFileSync(filePath, 'utf8');
  // Strip block/line comments (per existing `stripComments`) before line walk.
  // We do NOT strip strings — directive is the first string literal at top.
  const stripped = stripComments(src);
  const lines = stripped.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Match: 'use client' or "use client" with optional trailing ;
    if (/^['"]use client['"]\s*;?\s*$/.test(line)) return true;
    // Hit non-empty non-directive line → directive absent (per React rule).
    return false;
  }
  return false;
}

/**
 * Extract the family's first JSDoc summary line (≤120 chars target, hard cap
 * 240). Looks for the FIRST `/** ... *\/` block in the primary file that
 * appears BEFORE the first `export` keyword (i.e., the file-level / primary-
 * component description, not a per-prop JSDoc on an interface).
 *
 * Summary = first line of the block content (after stripping leading ` * `),
 * truncated at first period at end of line OR at the natural sentence boundary
 * (period followed by space or newline). If truncation needed (>120 chars),
 * truncate at last word boundary before 120 and append ellipsis "…"; logs a
 * WARNING to stderr so the author can hand-edit JSDoc to shorten.
 *
 * Returns string or empty string if no JSDoc found.
 */
function extractJsdocSummary(filePath, familyName) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const src = fs.readFileSync(filePath, 'utf8');
  // Slice at first RUNTIME export (function/const/let/class) rather than ANY
  // export — files sometimes lead with `export type Foo = ...` aliases BEFORE
  // the documented primary component (e.g., Reveal.tsx). Forcing slice at
  // first type-export discards the legitimate primary JSDoc that follows.
  const firstRuntimeExport = src.match(
    /^export\s+(?:async\s+)?(?:default\s+)?(?:function|const|let|var|class)\s/m,
  );
  const sliceEnd = firstRuntimeExport ? firstRuntimeExport.index : src.length;
  const head = src.slice(0, sliceEnd);
  // Match FIRST /** ... */ block in head.
  const blockMatch = head.match(/\/\*\*\s*\n([\s\S]*?)\*\//);
  if (!blockMatch) return '';
  const block = blockMatch[1];
  // Collect content lines (strip leading `* `, drop empty), stop at first JSDoc
  // `@tag` line — those mark structured metadata, NOT prose summary.
  const blockLines = block.split('\n');
  const contentLines = [];
  for (const rawLine of blockLines) {
    const cleaned = rawLine.replace(/^\s*\*\s?/, '').trim();
    if (cleaned.startsWith('@')) break;
    if (cleaned.length === 0) {
      // Blank line ends summary paragraph if we already have content
      if (contentLines.length > 0) break;
      continue;
    }
    contentLines.push(cleaned);
  }
  if (contentLines.length === 0) return '';
  // Join multi-line summary with single space; first sentence may span lines.
  const joined = contentLines.join(' ');
  // Extract first sentence (up to period followed by space/end-of-string)
  const sentenceMatch = joined.match(/^(.+?\.)(?:\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1] : joined;
  // Truncate if >120 chars at last word boundary before 120 + ellipsis
  if (sentence.length > 120) {
    const truncated = sentence.slice(0, 120).replace(/\s+\S*$/, '') + '…';
    console.warn(
      `[build-manifest] WARN: ${familyName} summary truncated (${sentence.length}→${truncated.length} chars). Consider shortening primary JSDoc first sentence.`,
    );
    return truncated;
  }
  return sentence;
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
    // 0.25.0 schema-additive fields per `agent-cheatsheet` work-unit plan v3.
    // `isClient` + `summary` derived from family's primary file (first .tsx
    // referenced from family index, or fallback). Used by `build-agent-
    // inventory.mjs` to populate `docs/AGENT-USAGE.md` Section J table.
    const primaryFile = resolvePrimaryFile(familyDir, family);
    const isClient = detectUseClient(primaryFile);
    const summary = extractJsdocSummary(primaryFile, family);
    components.push({
      family,
      category,
      path: familyPath,
      isClient,
      summary,
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

const CHECK_MODE = process.argv.includes('--check');

const manifest = {
  schemaVersion: '1',
  libVersion,
  generatedAt: new Date().toISOString(),
  categories: categoriesMap,
  components,
  utilities,
  typesOnly,
};

if (CHECK_MODE) {
  if (!fs.existsSync(OUTPUT)) {
    fail(`--check: committed manifest missing (${OUTPUT}). Run: npm run build:manifest`);
  }
  /** Serialize with `generatedAt` dropped — it differs on every regen by design. */
  const stable = (m) => {
    const rest = { ...m };
    delete rest.generatedAt;
    return JSON.stringify(rest, null, 2);
  };
  const committed = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  if (stable(committed) !== stable(manifest)) {
    console.error('[build-manifest] --check FAIL: components/manifest.json is stale.');
    console.error('  The manifest regenerated from current sources differs from the committed');
    console.error('  file (ignoring `generatedAt`). Run `npm run build:manifest` and commit.');
    process.exit(1);
  }
  console.log('[build-manifest] --check OK — committed manifest matches regenerated output.');
  process.exit(0);
}

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

// Emit prettier-clean output: JSON.stringify expands every array multi-line,
// while the committed manifest is prettier-formatted (short arrays collapsed
// to one line) — without this pass every regen dirties `format:check` even
// when content is unchanged (same footgun class as build-agent-inventory.mjs).
// The `--check` mode above is format-independent (parses then re-stringifies
// both sides), so this affects only the written file.
try {
  execSync(`npx prettier --write "${OUTPUT}"`, { cwd: ROOT, stdio: 'pipe' });
} catch (e) {
  fail(`prettier pass on regenerated manifest failed: ${e?.message ?? e}`);
}

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
