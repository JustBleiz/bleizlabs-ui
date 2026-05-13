#!/usr/bin/env node
/**
 * audit-jsdoc — JSDoc completeness audit for @bleizlabs/ui (0.22.0 baseline).
 *
 * Scans every component file (top-level .tsx in components/<category>/<Name>/)
 * and reports missing JSDoc artifacts:
 *   - Header block on the primary export (description + @layer + @tokens
 *     + @deps + @a11y + @example)
 *   - Per-prop description inside the Props interface
 *
 * Exit codes:
 *   0  — 100% coverage
 *   1  — gaps detected (report printed to stdout)
 *   2  — script error (filesystem / parse failure)
 *
 * Usage:
 *   node scripts/audit-jsdoc.mjs              # human-readable report
 *   node scripts/audit-jsdoc.mjs --json       # JSON output
 *   node scripts/audit-jsdoc.mjs --summary    # one-line per-component status
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');

// Tags required in the header JSDoc block. `@example` counted as present if
// the block contains at least one `@example` line.
const REQUIRED_TAGS = ['@layer', '@tokens', '@deps', '@a11y', '@example'];

// Categories to scan — exclude utils/types subfolders (no public component
// exports there, they're internal).
const SKIP_CATEGORIES = new Set(['utils', 'types', 'tests']);

const args = new Set(process.argv.slice(2));
const OUT_JSON = args.has('--json');
const OUT_SUMMARY = args.has('--summary');

function walk(dir, depth = 0) {
  if (depth > 4) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth === 0 && SKIP_CATEGORIES.has(e.name)) continue;
      results.push(...walk(full, depth + 1));
    } else if (e.isFile() && e.name.endsWith('.tsx') && !e.name.endsWith('.spec.tsx')) {
      // Skip files that aren't the primary component (e.g. internal helpers).
      // Heuristic: primary file matches its parent folder name.
      const parent = path.basename(path.dirname(full));
      const base = path.basename(full, '.tsx');
      // Accept primary file OR compound parts (e.g. CardHeader inside Card/)
      if (
        base === parent ||
        base.startsWith(parent) ||
        // CardBody/CardFooter/CardSection — parent = Card
        (parent.length > 0 && base.startsWith(parent.replace(/s$/, '')))
      ) {
        results.push(full);
      }
    }
  }
  return results;
}

/**
 * Extract the first JSDoc block (`/** ... *\/`) preceding an export. We look
 * for the first `/** ... *\/` in the file (typically the header block).
 */
function extractFirstJSDoc(source) {
  const match = source.match(/\/\*\*([\s\S]*?)\*\//);
  return match ? match[1] : null;
}

/**
 * Extract the Props interface body. Heuristic: first `interface XxxProps {`
 * block (or `export interface XxxProps`).
 */
function extractPropsInterface(source) {
  const ifaceMatch = source.match(/(?:export\s+)?interface\s+\w+Props\b[^{]*\{([\s\S]*?)\n\}/);
  if (!ifaceMatch) return null;
  return ifaceMatch[1];
}

/**
 * Count props in the interface body. A prop is a line matching
 * `propName?: type;` or `'aria-prop'?: type;` — ignore commented lines.
 */
function countProps(interfaceBody) {
  const lines = interfaceBody.split('\n');
  const props = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Skip pure comment lines (single line)
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line) || /^\s*\/\*/.test(line) || line.trim() === '') {
      i++;
      continue;
    }
    // Property: `propName?: type;` or `'aria-prop'?: type;` or `propName: Type;`
    const propMatch = line.match(/^\s*((?:'[\w-]+')|(?:\[?[a-zA-Z_$][\w$-]*\]?))\s*\??\s*:/);
    if (propMatch) {
      // Look upward for JSDoc block immediately above. A "doc" can be:
      //   - Multi-line JSDoc ending with `*/` on its own line: `   */`
      //   - Single-line JSDoc on the line directly above: `/** ... */`
      // Skip blank lines and `//` line comments while searching upward.
      let hasDoc = false;
      let j = i - 1;
      while (j >= 0) {
        const above = lines[j];
        // Multi-line JSDoc close
        if (/^\s*\*\//.test(above)) {
          hasDoc = true;
          break;
        }
        // Single-line JSDoc `/** ... */`
        if (/^\s*\/\*\*[\s\S]*\*\//.test(above)) {
          hasDoc = true;
          break;
        }
        if (above.trim() === '' || /^\s*\/\//.test(above)) {
          j--;
          continue;
        }
        break;
      }
      props.push({ name: propMatch[1].replace(/['[\]]/g, ''), hasDoc, line: i + 1 });
    }
    i++;
  }
  return props;
}

const files = walk(COMPONENTS_DIR);
const report = {
  total: files.length,
  passed: 0,
  failed: 0,
  components: [],
};

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');

  const header = extractFirstJSDoc(source);
  const missingTags = [];
  if (!header) {
    REQUIRED_TAGS.forEach((t) => missingTags.push(t));
    missingTags.unshift('description');
  } else {
    // description = at least one non-empty line before the first @tag
    const beforeFirstTag = header.split(/\n\s*\*\s*@/)[0];
    const descLines = beforeFirstTag.split('\n').filter((l) => l.replace(/^\s*\*\s*/, '').trim().length > 0);
    if (descLines.length === 0) missingTags.push('description');
    for (const tag of REQUIRED_TAGS) {
      if (!header.includes(tag)) missingTags.push(tag);
    }
  }

  const interfaceBody = extractPropsInterface(source);
  const props = interfaceBody ? countProps(interfaceBody) : [];
  const undocumentedProps = props.filter((p) => !p.hasDoc).map((p) => p.name);

  const failed = missingTags.length > 0 || undocumentedProps.length > 0;
  if (failed) report.failed += 1;
  else report.passed += 1;

  report.components.push({
    file: rel,
    headerMissing: missingTags,
    totalProps: props.length,
    undocumentedProps,
    status: failed ? 'FAIL' : 'PASS',
  });
}

if (OUT_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else if (OUT_SUMMARY) {
  for (const c of report.components) {
    const tag = c.status === 'PASS' ? '✓' : '✗';
    console.log(`${tag} ${c.file} — props:${c.totalProps} undoc:${c.undocumentedProps.length} missing:[${c.headerMissing.join(', ')}]`);
  }
  console.log(`\n[audit-jsdoc] ${report.passed}/${report.total} pass, ${report.failed} fail`);
} else {
  console.log(`[audit-jsdoc] scanned ${report.total} component files`);
  console.log(`  PASS: ${report.passed}`);
  console.log(`  FAIL: ${report.failed}`);
  if (report.failed > 0) {
    console.log(`\nFailing components:`);
    for (const c of report.components.filter((x) => x.status === 'FAIL')) {
      console.log(`\n  ${c.file}`);
      if (c.headerMissing.length > 0) {
        console.log(`    missing header: ${c.headerMissing.join(', ')}`);
      }
      if (c.undocumentedProps.length > 0) {
        console.log(`    undocumented props (${c.undocumentedProps.length}): ${c.undocumentedProps.join(', ')}`);
      }
    }
  }
}

process.exit(report.failed > 0 ? 1 : 0);
