#!/usr/bin/env node
/**
 * Check agent docs — import-identifier integrity gate for `AGENTS.md` +
 * `docs/AGENT-USAGE.md` (the @bleizlabs/ui Agent Cheat-Sheet, 0.25.0+).
 *
 * Scope (explicitly narrow per plan v3 §3 CI gate):
 *   1. Inventory row count in `docs/AGENT-USAGE.md` between INVENTORY:START/
 *      END markers matches `manifest.json` `components.length`.
 *   2. Every `import { Foo } from '@bleizlabs/ui'` identifier in TS/TSX-tagged
 *      code fences resolves to a real export in `components/index.ts` barrel
 *      (via manifest's components/utilities/typesOnly arrays).
 *   3. The §J inventory stamp ("at lib version X") matches `manifest.libVersion`
 *      — a stale stamp means the committed table lags the release (E07: the
 *      stamp previously sat at 0.25.0 across two releases with nobody noticing;
 *      `check:manifest` already pins manifest.libVersion == package.json version,
 *      so this transitively pins the doc to the released version).
 *
 * Explicitly OUT OF SCOPE:
 *   - Does NOT type-check fence contents.
 *   - Does NOT verify prop signatures, variant values, or per-prop drift —
 *     consumer TS strict mode catches that on next minor bump.
 *   - Does NOT exec code.
 *   - Does NOT scan non-TS fences (bash, scss, json, text) for imports —
 *     prevents false positives on lines like `npm install @bleizlabs/ui`
 *     in bash blocks or `@use '@bleizlabs/ui/styles'` in scss blocks.
 *
 * Fence language detection: ONLY fences opening with ```tsx, ```typescript,
 * or ```ts (case-insensitive) are scanned. Untagged ``` fences and other
 * languages are skipped entirely.
 *
 * Exits 0 on PASS, 1 on any error. Designed to run in `prepublishOnly`
 * AFTER `check:manifest` (which validates manifest schema). When this
 * fails, publish is blocked — fix doc drift before retrying.
 *
 * Run: `node scripts/check-agents-doc.mjs`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'components', 'manifest.json');
const AGENTS_MD = path.join(ROOT, 'AGENTS.md');
const AGENT_USAGE_MD = path.join(ROOT, 'docs', 'AGENT-USAGE.md');

const INVENTORY_START = '<!-- INVENTORY:START';
const INVENTORY_END = '<!-- INVENTORY:END';

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error(`[check-agents-doc] ERROR: ${msg}`);
  errors++;
}
function warn(msg) {
  console.warn(`[check-agents-doc] WARN:  ${msg}`);
  warnings++;
}
function info(msg) {
  console.log(`[check-agents-doc] ${msg}`);
}

if (!fs.existsSync(MANIFEST)) {
  err(`Missing manifest: ${MANIFEST}. Run \`npm run build:manifest\` first.`);
  process.exit(1);
}
if (!fs.existsSync(AGENTS_MD)) {
  err(`Missing ${path.relative(ROOT, AGENTS_MD)}. Author the file first.`);
}
if (!fs.existsSync(AGENT_USAGE_MD)) {
  err(`Missing ${path.relative(ROOT, AGENT_USAGE_MD)}. Author the file first.`);
}
if (errors > 0) process.exit(1);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

// Build set of valid exports from manifest (components + utilities +
// typesOnly). Component family export names live in each family's
// `exports` + `types` + `hooks` arrays.
const validExports = new Set();
function collectFamilyExports(families) {
  for (const f of families) {
    for (const name of f.exports || []) validExports.add(name);
    for (const name of f.types || []) validExports.add(name);
    for (const name of f.hooks || []) validExports.add(name);
  }
}
collectFamilyExports(manifest.components || []);
collectFamilyExports(manifest.utilities || []);
collectFamilyExports(manifest.typesOnly || []);

info(
  `manifest exports: ${validExports.size} identifiers across ${manifest.components.length} components + ${manifest.utilities.length} utilities + ${manifest.typesOnly.length} typesOnly`,
);

// -----------------------------------------------------------------------
// Check 1: Inventory row count matches manifest.components.length
// -----------------------------------------------------------------------

const usageSrc = fs.readFileSync(AGENT_USAGE_MD, 'utf8');
const invStartIdx = usageSrc.indexOf(INVENTORY_START);
const invEndIdx = usageSrc.indexOf(INVENTORY_END);
if (invStartIdx === -1 || invEndIdx === -1 || invEndIdx < invStartIdx) {
  err(
    `docs/AGENT-USAGE.md missing INVENTORY:START / INVENTORY:END markers (in correct order). Run \`node scripts/build-agent-inventory.mjs\` to populate the table.`,
  );
} else {
  const inventoryBlock = usageSrc.slice(invStartIdx, invEndIdx);
  // Count rows: lines starting with "| `" (component-name cell) inside
  // inventory block. Header row `| Component |` excluded because it
  // does not start with backtick.
  const rowMatches = inventoryBlock.match(/^\|\s*`[A-Z]/gm) || [];
  const rowCount = rowMatches.length;
  const expected = manifest.components.length;
  if (rowCount !== expected) {
    err(
      `Inventory row count drift: ${rowCount} rows in docs/AGENT-USAGE.md vs ${expected} components in manifest. ` +
        `Re-run \`node scripts/build-agent-inventory.mjs\` to regenerate.`,
    );
  } else {
    info(`inventory rows: ${rowCount} == manifest.components.length ✓`);
  }

  // ---------------------------------------------------------------------
  // Check 3: §J stamp version matches manifest.libVersion
  // ---------------------------------------------------------------------
  const stampMatch = inventoryBlock.match(/at lib version\s+(\d+\.\d+\.\d+(?:-[\w.]+)?)/);
  if (!stampMatch) {
    err(
      `docs/AGENT-USAGE.md inventory block has no "at lib version X" stamp. ` +
        `Re-run \`node scripts/build-agent-inventory.mjs\` to regenerate.`,
    );
  } else if (stampMatch[1] !== manifest.libVersion) {
    err(
      `Inventory stamp drift: §J says "at lib version ${stampMatch[1]}" but manifest.libVersion is ${manifest.libVersion}. ` +
        `Re-run \`node scripts/build-agent-inventory.mjs\` after the version bump.`,
    );
  } else {
    info(`inventory stamp: lib version ${stampMatch[1]} == manifest.libVersion ✓`);
  }
}

// -----------------------------------------------------------------------
// Check 2: TS/TSX-fence imports resolve to manifest exports
// -----------------------------------------------------------------------

/**
 * Iterate fenced code blocks. Yields `{ lang, content, sourceFile, fenceLine }`.
 * `lang` is the fence info-string lowercased. Untagged fences yield `lang=''`.
 * Multiple fences per file are supported. Nested triple-backticks inside
 * fences are NOT supported (treated as ending the fence) — this matches
 * standard CommonMark behavior and is the right model for our docs.
 */
function* iterFences(src, sourceFile) {
  const lines = src.split('\n');
  let inFence = false;
  let fenceLang = '';
  let fenceBuffer = [];
  let fenceStartLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceOpen = line.match(/^```\s*([A-Za-z0-9_-]*)\s*$/);
    if (!inFence && fenceOpen) {
      inFence = true;
      fenceLang = (fenceOpen[1] || '').toLowerCase();
      fenceBuffer = [];
      fenceStartLine = i + 1;
      continue;
    }
    if (inFence && line.match(/^```\s*$/)) {
      yield {
        lang: fenceLang,
        content: fenceBuffer.join('\n'),
        sourceFile,
        fenceLine: fenceStartLine,
      };
      inFence = false;
      fenceLang = '';
      fenceBuffer = [];
      continue;
    }
    if (inFence) fenceBuffer.push(line);
  }
}

const TS_TSX_LANGS = new Set(['tsx', 'typescript', 'ts']);

/**
 * Parse named imports from a TS/TSX fence. Returns array of identifier
 * strings. Handles:
 *   import { Foo } from '@bleizlabs/ui';
 *   import { Foo, Bar } from '@bleizlabs/ui';
 *   import { type Foo, Bar } from '@bleizlabs/ui';
 *   import { Foo as Renamed } from '@bleizlabs/ui';   // captures `Foo` (the export name)
 *   import type { Foo } from '@bleizlabs/ui';
 *
 * Multi-line import statements supported — `[^}]*?` allows newlines inside
 * the brace group but stops at the first `}`, preventing the regex from
 * bridging across an intermediate non-@bleizlabs/ui import (e.g., when a
 * tsx fence has `import { A } from '@bleizlabs/ui'` followed by
 * `import { B } from '@/lib/...'` followed by another `'@bleizlabs/ui'`
 * import, the previous `[\s\S]*?` would lazy-bridge across the middle import,
 * pulling in `B` as a false-positive @bleizlabs/ui identifier).
 */
function extractImportedIdentifiers(fenceContent) {
  const re = /import\s+(?:type\s+)?\{([^}]*?)\}\s+from\s+['"]@bleizlabs\/ui['"]/g;
  const ids = [];
  let match;
  while ((match = re.exec(fenceContent)) !== null) {
    const inner = match[1];
    const parts = inner
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    for (const part of parts) {
      // Strip leading `type ` keyword; capture identifier before optional ` as Renamed`.
      const cleaned = part.replace(/^type\s+/, '').trim();
      const idMatch = cleaned.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      if (idMatch) ids.push(idMatch[1]);
    }
  }
  return ids;
}

const docs = [
  { file: AGENTS_MD, label: 'AGENTS.md' },
  { file: AGENT_USAGE_MD, label: 'docs/AGENT-USAGE.md' },
];

let totalChecked = 0;
let totalResolved = 0;

for (const { file, label } of docs) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const fence of iterFences(src, label)) {
    if (!TS_TSX_LANGS.has(fence.lang)) {
      // Yellow-flag: `js` / `jsx` fences look like they MIGHT contain TS-style
      // imports but were probably mis-tagged. Soft warn so author can fix.
      if (
        (fence.lang === 'js' || fence.lang === 'jsx') &&
        /import\s+(?:type\s+)?\{[\s\S]*?\}\s+from\s+['"]@bleizlabs\/ui['"]/.test(fence.content)
      ) {
        warn(
          `${label}:${fence.fenceLine} fence lang \`${fence.lang}\` contains @bleizlabs/ui import — retag as \`tsx\` / \`typescript\` / \`ts\` for the import to be checked.`,
        );
      }
      continue;
    }
    const ids = extractImportedIdentifiers(fence.content);
    for (const id of ids) {
      totalChecked++;
      if (!validExports.has(id)) {
        err(
          `${label}:${fence.fenceLine} (lang=${fence.lang}) — imported identifier \`${id}\` from '@bleizlabs/ui' not found in manifest exports.`,
        );
      } else {
        totalResolved++;
      }
    }
  }
}

info(
  `imports checked: ${totalChecked} (resolved: ${totalResolved}, unresolved: ${totalChecked - totalResolved})`,
);

// -----------------------------------------------------------------------
// Result
// -----------------------------------------------------------------------

if (errors > 0) {
  console.error(`\n[check-agents-doc] FAIL: ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

console.log(`\n[check-agents-doc] PASS — 0 errors, ${warnings} warning(s).`);
