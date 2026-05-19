#!/usr/bin/env node
/**
 * Manifest validator — gate run by `prepublishOnly` and CI.
 *
 * Verifies:
 *   1. `components/manifest.json` exists
 *   2. JSON parses
 *   3. Schema-shape conformance (light validation — required fields, types,
 *      patterns) — full JSON Schema validation deferred to formal lint job
 *   4. `libVersion` matches `package.json` version (drift = stale manifest)
 *   5. Manifest barrel coverage matches actual `components/index.ts` star-exports
 *      (drift = lib added family without rerunning `build:manifest`)
 *
 * Exits non-zero on any issue. Designed for `prepublishOnly` so stale
 * manifests cannot be published.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const MANIFEST = path.join(COMPONENTS_DIR, 'manifest.json');
const BARREL = path.join(COMPONENTS_DIR, 'index.ts');
const PKG_JSON = path.join(ROOT, 'package.json');

const errors = [];

function err(msg) {
  errors.push(msg);
}

if (!fs.existsSync(MANIFEST)) {
  console.error(`[check-manifest] FAIL: manifest.json missing. Run: npm run build:manifest`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
} catch (e) {
  console.error(`[check-manifest] FAIL: manifest.json invalid JSON: ${e.message}`);
  process.exit(1);
}

// --- 1. Top-level shape -----------------------------------------------------
const requiredTop = [
  'schemaVersion',
  'libVersion',
  'generatedAt',
  'categories',
  'components',
  'utilities',
  'typesOnly',
];
for (const key of requiredTop) {
  if (!(key in manifest)) err(`Missing top-level field: ${key}`);
}
if (manifest.schemaVersion !== '1') {
  err(`schemaVersion must be "1", got "${manifest.schemaVersion}"`);
}
if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(manifest.libVersion ?? '')) {
  err(`libVersion not semver: "${manifest.libVersion}"`);
}
if (!Array.isArray(manifest.components)) err(`components must be array`);
if (!Array.isArray(manifest.utilities)) err(`utilities must be array`);
if (!Array.isArray(manifest.typesOnly)) err(`typesOnly must be array`);

// --- 2. Per-family shape ----------------------------------------------------
function checkFamily(f, src) {
  const required = ['family', 'category', 'path', 'exports', 'types', 'hooks'];
  for (const key of required) {
    if (!(key in f)) err(`${src} family missing field "${key}": ${JSON.stringify(f)}`);
  }
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(f.family ?? '')) {
    err(`${src} invalid family name: "${f.family}"`);
  }
  if (!/^[a-z]+\/[A-Za-z][A-Za-z0-9]*$/.test(f.path ?? '')) {
    err(`${src} invalid path: "${f.path}" (family ${f.family})`);
  }
  if (!Array.isArray(f.exports) || !Array.isArray(f.types) || !Array.isArray(f.hooks)) {
    err(`${src} arrays malformed for ${f.family}`);
    return;
  }
  // Hooks must match useXxx pattern.
  for (const h of f.hooks) {
    if (!/^use[A-Z][A-Za-z0-9]*$/.test(h)) {
      err(`${src} hook name doesn't match useXxx: "${h}" (family ${f.family})`);
    }
  }
  // Empty family = warn (manifest builder also warns).
  if (f.exports.length === 0 && f.types.length === 0 && f.hooks.length === 0) {
    err(`${src} family "${f.family}" has zero exports — likely barrel parse miss`);
  }
}

for (const f of manifest.components ?? []) checkFamily(f, 'components');
for (const f of manifest.utilities ?? []) checkFamily(f, 'utilities');
for (const f of manifest.typesOnly ?? []) checkFamily(f, 'typesOnly');

// --- 3. libVersion vs package.json -----------------------------------------
const pkg = JSON.parse(fs.readFileSync(PKG_JSON, 'utf8'));
if (manifest.libVersion !== pkg.version) {
  err(
    `Manifest libVersion drift: manifest=${manifest.libVersion}, package.json=${pkg.version}. ` +
      `Run: npm run build:manifest`,
  );
}

// --- 4. Barrel coverage -----------------------------------------------------
const barrelSrc = fs.readFileSync(BARREL, 'utf8');
const stripped = barrelSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const barrelStarPaths = [];
const starRegex = /export\s+\*\s+from\s+['"]\.\/(\S+?)['"];/g;
let m;
while ((m = starRegex.exec(stripped)) !== null) {
  barrelStarPaths.push(m[1]);
}

const manifestPaths = (manifest.components ?? []).map((f) => f.path);
const missingFromManifest = barrelStarPaths.filter((p) => !manifestPaths.includes(p));
const missingFromBarrel = manifestPaths.filter((p) => !barrelStarPaths.includes(p));
if (missingFromManifest.length) {
  err(
    `Barrel star-exports not in manifest: ${missingFromManifest.join(', ')}. ` +
      `Run: npm run build:manifest`,
  );
}
if (missingFromBarrel.length) {
  err(
    `Manifest paths not in barrel star-exports: ${missingFromBarrel.join(', ')}. ` +
      `Stale manifest — run: npm run build:manifest`,
  );
}

// --- 5. Named/typeOnly barrel coverage --------------------------------------
const namedRegex = /export\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"]\.\/(\S+?)['"];/g;
const barrelNamedPaths = [];
while ((m = namedRegex.exec(stripped)) !== null) {
  barrelNamedPaths.push(m[1]);
}
const utilOrTypePaths = [
  ...(manifest.utilities ?? []).map((f) => f.path),
  ...(manifest.typesOnly ?? []).map((f) => f.path),
];
const namedMissing = barrelNamedPaths.filter((p) => !utilOrTypePaths.includes(p));
if (namedMissing.length) {
  err(`Barrel named exports not in manifest utilities/typesOnly: ${namedMissing.join(', ')}.`);
}

// --- Output -----------------------------------------------------------------
if (errors.length) {
  console.error('[check-manifest] FAIL');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('[check-manifest] OK');
console.log(
  `  ${manifest.components.length} components + ${manifest.utilities.length} utilities + ${manifest.typesOnly.length} types-only families`,
);
console.log(`  libVersion: ${manifest.libVersion}`);
console.log(`  generated:  ${manifest.generatedAt}`);
