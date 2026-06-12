#!/usr/bin/env node
/**
 * Inject doc version — replaces `__VERSION__` tokens with current
 * `package.json` `version` in agent docs at publish time.
 *
 * Lifecycle:
 *   - Committed sources contain literal `__VERSION__` (template form).
 *   - `prepublishOnly` runs this script in `inject` mode → tokens replaced
 *     with current version in place (working tree dirty, npm publish
 *     reads files from working tree).
 *   - After a SUCCESSFUL publish, npm's `postpublish` hook runs this script
 *     in `revert` mode (`git checkout -- AGENTS.md docs/AGENT-USAGE.md`) to
 *     restore the template state. npm has NO lifecycle hook for a FAILED
 *     publish — in that case the working tree stays dirty and the operator
 *     must run `node scripts/inject-doc-version.mjs --revert` manually.
 *
 * Usage:
 *   node scripts/inject-doc-version.mjs          # default: inject
 *   node scripts/inject-doc-version.mjs --inject
 *   node scripts/inject-doc-version.mjs --revert
 *
 * Exits 0 on success, 1 on error (missing files, no `__VERSION__` token
 * found in inject mode — fails fast so a misconfigured publish does NOT
 * silently ship `__VERSION__` as the literal version string).
 *
 * Target files (relative to repo root):
 *   - AGENTS.md
 *   - docs/AGENT-USAGE.md
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PKG_JSON = path.join(ROOT, 'package.json');

const TARGETS = [path.join(ROOT, 'AGENTS.md'), path.join(ROOT, 'docs', 'AGENT-USAGE.md')];

const TOKEN = '__VERSION__';

function fail(msg) {
  console.error(`[inject-doc-version] ${msg}`);
  process.exit(1);
}

function parseMode(argv) {
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--inject') return 'inject';
    if (argv[i] === '--revert') return 'revert';
  }
  return 'inject'; // default
}

const mode = parseMode(process.argv);

// ---------------------------------------------------------------------------
// REVERT — restore committed state via `git checkout`
// ---------------------------------------------------------------------------

if (mode === 'revert') {
  const relPaths = TARGETS.map((t) => path.relative(ROOT, t).replace(/\\/g, '/'));
  try {
    execSync(`git -C "${ROOT}" checkout -- ${relPaths.map((p) => `"${p}"`).join(' ')}`, {
      stdio: 'inherit',
    });
    console.log(`[inject-doc-version] revert OK — restored: ${relPaths.join(', ')}`);
    process.exit(0);
  } catch (e) {
    fail(`git checkout failed in revert mode: ${e?.message ?? e}`);
  }
}

// ---------------------------------------------------------------------------
// INJECT — replace __VERSION__ with package.json version
// ---------------------------------------------------------------------------

if (!fs.existsSync(PKG_JSON)) fail(`Missing package.json: ${PKG_JSON}`);
const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf8'));
const version = pkg.version;
if (!version) fail('package.json has no `version` field.');

let totalReplacements = 0;
const filesProcessed = [];

for (const target of TARGETS) {
  if (!fs.existsSync(target)) {
    fail(`Missing target: ${target}. Author the doc first.`);
  }
  const src = fs.readFileSync(target, 'utf8');
  if (!src.includes(TOKEN)) {
    fail(
      `Target ${path.relative(ROOT, target)} contains no \`${TOKEN}\` token. Did you commit the template form, or did a previous run already inject without reverting?`,
    );
  }
  // Count BEFORE replace for accurate reporting.
  const count = (src.match(new RegExp(TOKEN, 'g')) || []).length;
  const next = src.replaceAll(TOKEN, version);
  fs.writeFileSync(target, next, 'utf8');
  totalReplacements += count;
  filesProcessed.push({ file: path.relative(ROOT, target), count });
}

console.log(`[inject-doc-version] inject OK`);
console.log(`  version:        ${version}`);
console.log(`  replacements:   ${totalReplacements}`);
for (const { file, count } of filesProcessed) {
  console.log(`    ${file}: ${count}`);
}
console.log(
  `  NOTE: working tree now dirty. Run \`node scripts/inject-doc-version.mjs --revert\` after publish to restore template state.`,
);
