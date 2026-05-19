import fs from 'node:fs';
import { NEXT_CONFIG_PATCH_MARKER } from './templates.js';
import { writeFileIdempotent, type WriteFileResult } from './file-ops.js';
import type { ProjectInfo } from './project-detector.js';

export interface NextConfigPatchResult {
  status: 'applied' | 'already-patched' | 'no-config' | 'manual-required';
  configPath: string | null;
  message: string;
  fileResult?: WriteFileResult;
  manualSnippet?: string;
}

/**
 * Patch next.config.{js,mjs,ts} to add `transpilePackages: ['@bleizlabs/ui']`
 * and `sassOptions.loadPaths`.
 *
 * Strategy:
 *   1. Detect simple object-literal export pattern (`const config = {...}; export default config;`
 *      or `export default {...};` or `module.exports = {...};`).
 *   2. If keys already present → idempotent skip.
 *   3. If pattern matches → text-based patch via simple anchor regex.
 *   4. If pattern doesn't match (complex config, dynamic, async function) →
 *      'manual-required' with printed snippet.
 */
export function patchNextConfig(info: ProjectInfo): NextConfigPatchResult {
  if (!info.nextConfigPath || !info.nextConfigFormat) {
    return {
      status: 'no-config',
      configPath: null,
      message:
        'No next.config.{js,mjs,ts} found. Skipping. Create one with the snippet below for SCSS + transpile support.',
      manualSnippet: buildManualSnippet(info.nextConfigFormat ?? 'mjs'),
    };
  }

  const raw = fs.readFileSync(info.nextConfigPath, 'utf8');

  if (raw.includes(NEXT_CONFIG_PATCH_MARKER)) {
    return {
      status: 'already-patched',
      configPath: info.nextConfigPath,
      message: 'next.config already patched — marker present, skipping.',
    };
  }

  // Detect simple object-literal config. Match patterns:
  //   const nextConfig = { ... };
  //   const config = { ... };
  //   export default { ... };
  //   module.exports = { ... };
  const literalMatch =
    raw.match(
      /(const\s+(?:nextConfig|config)\s*(?::\s*[A-Za-z<>{}\[\]\s,|]+)?\s*=\s*)\{([\s\S]*?)\n\}\s*;?/,
    ) ||
    raw.match(/(export\s+default\s*)\{([\s\S]*?)\n\}\s*;?/) ||
    raw.match(/(module\.exports\s*=\s*)\{([\s\S]*?)\n\}\s*;?/);

  if (!literalMatch) {
    return {
      status: 'manual-required',
      configPath: info.nextConfigPath,
      message: `next.config format too complex for auto-patch — manual merge required.`,
      manualSnippet: buildManualSnippet(info.nextConfigFormat),
    };
  }

  const objectBody = literalMatch[2] ?? '';
  if (/transpilePackages\s*:/.test(objectBody) || /sassOptions\s*:/.test(objectBody)) {
    return {
      status: 'manual-required',
      configPath: info.nextConfigPath,
      message:
        'next.config already defines transpilePackages or sassOptions — auto-merge avoided to prevent overwrite. Merge manually.',
      manualSnippet: buildManualSnippet(info.nextConfigFormat),
    };
  }

  const insert = buildInsertSnippet(info.nextConfigFormat);
  // Inject before the closing `}` of the object literal.
  const matchIndex = raw.indexOf(literalMatch[0]);
  const before = raw.slice(0, matchIndex);
  const matched = literalMatch[0];
  const after = raw.slice(matchIndex + matched.length);

  // Split matched at last `}` to insert.
  const lastBrace = matched.lastIndexOf('}');
  const head = matched.slice(0, lastBrace);
  const tail = matched.slice(lastBrace);
  const trimmedHead = head.trimEnd();

  // Determine if a trailing comma is needed.
  // Strip trailing comments + whitespace iteratively to find the last meaningful char.
  // Cases:
  //   `{ }` (empty)                        -> last meaningful = `{` -> NO comma
  //   `{ /* comment */ }` (only comment)   -> last meaningful = `{` -> NO comma
  //   `{ key: val }` (no trailing comma)   -> last meaningful = value char -> YES comma
  //   `{ key: val, }` (already has comma)  -> last meaningful = `,` -> NO comma
  let stripped = trimmedHead;
  let prev: string;
  do {
    prev = stripped;
    stripped = stripped.trimEnd();
    // Strip trailing block comment(s)
    stripped = stripped.replace(/\/\*[\s\S]*?\*\/$/, '');
    // Strip trailing line comment
    stripped = stripped.replace(/\/\/[^\n]*$/, '');
  } while (stripped !== prev);
  stripped = stripped.trimEnd();

  const lastChar = stripped.length > 0 ? stripped[stripped.length - 1] : '';
  const trailingComma = lastChar === '{' || lastChar === ',' || lastChar === '' ? '' : ',';
  const newMatched = `${trimmedHead}${trailingComma}\n${insert}\n${tail}`;

  const next = before + newMatched + after;
  const fileResult = writeFileIdempotent(info.nextConfigPath, next, 'overwrite');

  return {
    status: 'applied',
    configPath: info.nextConfigPath,
    message: `next.config patched (transpilePackages + sassOptions added). Backup at ${info.nextConfigPath}.bak.`,
    fileResult,
  };
}

function buildInsertSnippet(format: 'cjs' | 'mjs' | 'ts'): string {
  // Use indent matching typical config (2 spaces).
  if (format === 'cjs') {
    return [
      `  ${NEXT_CONFIG_PATCH_MARKER}`,
      `  transpilePackages: ['@bleizlabs/ui'],`,
      `  sassOptions: {`,
      `    loadPaths: [require('node:path').join(__dirname, 'node_modules')],`,
      `  },`,
    ].join('\n');
  }
  // ESM (mjs / ts) — fileURLToPath of import.meta.url.
  return [
    `  ${NEXT_CONFIG_PATCH_MARKER}`,
    `  transpilePackages: ['@bleizlabs/ui'],`,
    `  sassOptions: {`,
    `    loadPaths: [new URL('./node_modules', import.meta.url).pathname],`,
    `  },`,
  ].join('\n');
}

function buildManualSnippet(format: 'cjs' | 'mjs' | 'ts'): string {
  const insert = buildInsertSnippet(format);
  return [
    'Add to your next.config (inside the exported object):',
    '',
    insert,
    '',
    "Verification: SCSS imports `@use '@bleizlabs/ui/styles'` should resolve, and lib JSX/SCSS should compile.",
  ].join('\n');
}
