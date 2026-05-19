// build.mjs
//
// Minimal Sass compile script for Phase 0 visual QA playground.
// Usage: `npm run build` (from dev/) → compiles playground.scss → compiled.css
//
// Node 20+ required. Uses the Sass modern API (`sass.compile`).

import * as sass from 'sass';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';
import { performance } from 'node:perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const entryFile = resolve(__dirname, 'playground.scss');
const outputFile = resolve(__dirname, 'compiled.css');
const stylesDir = resolve(__dirname, '..', 'styles');

const cwd = process.cwd();
const relativeEntry = relative(cwd, entryFile);
const relativeOutput = relative(cwd, outputFile);

console.log(`[bleizlabs-ui] Compiling ${relativeEntry}`);
const t0 = performance.now();

let result;
try {
  result = sass.compile(entryFile, {
    style: 'expanded',
    sourceMap: false,
    loadPaths: [stylesDir],
  });
} catch (error) {
  console.error('[bleizlabs-ui] Sass compile FAILED');
  console.error(error.message);
  if (error.span) {
    console.error(`  at ${error.span.url} line ${error.span.start.line + 1}`);
  }
  process.exit(1);
}

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, result.css, 'utf8');

const t1 = performance.now();
const sizeKb = (result.css.length / 1024).toFixed(2);
const durationMs = (t1 - t0).toFixed(0);

console.log(`[bleizlabs-ui] Wrote ${relativeOutput}  (${sizeKb} KB, ${durationMs} ms)`);

// Quick verification — grep a few expected tokens
const expectedTokens = [
  '--color-bg',
  '--color-surface',
  '--color-brand-500',
  '--color-text-primary',
  '--gap-page',
  '--gap-card',
  '--radius-card',
  '--shadow-brand',
  '--focus-ring',
  '--duration-fast',
  '--font-primary',
  '--font-secondary',
  '--z-modal',
  '@keyframes fadeIn',
  '@keyframes spin',
  '[data-theme=light]',
  '[data-theme=dark]',
];

const missing = expectedTokens.filter((token) => !result.css.includes(token));
if (missing.length > 0) {
  console.error('[bleizlabs-ui] VERIFICATION FAILED — missing expected tokens:');
  missing.forEach((t) => console.error('  -', t));
  process.exit(2);
}

console.log(
  `[bleizlabs-ui] Verification OK — all ${expectedTokens.length} expected tokens present`,
);
