import fs from 'node:fs';
import path from 'node:path';
import {
  renderEslintFlatSnippet,
  renderEslintLegacySnippet,
} from './templates.js';
import { writeFileIdempotent, type WriteFileResult } from './file-ops.js';

export type EslintFormat = 'flat-js' | 'flat-mjs' | 'flat-ts' | 'legacy-json' | 'legacy-js' | 'legacy-cjs' | 'none';

const FLAT_CANDIDATES = [
  'eslint.config.mjs',
  'eslint.config.js',
  'eslint.config.ts',
  'eslint.config.cjs',
] as const;
const LEGACY_CANDIDATES = [
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  '.eslintrc',
] as const;

export interface DetectedEslint {
  format: EslintFormat;
  configPath: string | null;
}

export function detectEslintConfig(cwd: string): DetectedEslint {
  for (const name of FLAT_CANDIDATES) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) {
      const ext = name.split('.').pop()!;
      const fmt: EslintFormat =
        ext === 'mjs' ? 'flat-mjs' : ext === 'ts' ? 'flat-ts' : ext === 'cjs' ? 'flat-js' : 'flat-js';
      return { format: fmt, configPath: p };
    }
  }
  for (const name of LEGACY_CANDIDATES) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) {
      const ext = name.includes('.json')
        ? 'legacy-json'
        : name.includes('.cjs')
          ? 'legacy-cjs'
          : name.includes('.js')
            ? 'legacy-js'
            : 'legacy-json';
      return { format: ext as EslintFormat, configPath: p };
    }
  }
  return { format: 'none', configPath: null };
}

export interface EslintPatchResult {
  status: 'applied' | 'skipped' | 'manual-required';
  configPath: string | null;
  format: EslintFormat;
  message: string;
  fileResult?: WriteFileResult;
}

/**
 * Patch ESLint config to add wrapper-layer enforcement rule.
 *
 * For LEGACY JSON: deep-merge rules + overrides.
 * For LEGACY JS/CJS: append snippet (text-based) — manual merge prompt.
 * For FLAT: append snippet to the array export — TEXT-based marker check.
 *
 * Returns 'manual-required' for ambiguous JS/MJS/TS cases — user must merge
 * the printed snippet manually. JSON merge is automatic + safe.
 */
export function patchEslintConfig(detected: DetectedEslint): EslintPatchResult {
  if (detected.format === 'none') {
    return {
      status: 'skipped',
      configPath: null,
      format: 'none',
      message:
        'No ESLint config detected. Skipping ESLint patch. To enforce wrapper-layer ' +
        'imports, create an ESLint config and add the snippet from `npx @bleizlabs/ui status --eslint`.',
    };
  }

  if (detected.format === 'legacy-json' && detected.configPath) {
    return patchEslintJson(detected.configPath);
  }

  // JS / MJS / CJS / TS — manual merge with printed snippet.
  return {
    status: 'manual-required',
    configPath: detected.configPath,
    format: detected.format,
    message: buildManualMergeMessage(detected),
  };
}

function patchEslintJson(configPath: string): EslintPatchResult {
  const existing = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Record<string, unknown>;
  const snippet = renderEslintLegacySnippet();

  // Deep-merge rules + overrides additively.
  const merged: Record<string, unknown> = { ...existing };

  const existingRules = (existing.rules ?? {}) as Record<string, unknown>;
  const snippetRules = (snippet.rules ?? {}) as Record<string, unknown>;
  merged.rules = { ...existingRules, ...snippetRules };

  const existingOverrides = Array.isArray(existing.overrides) ? existing.overrides : [];
  const snippetOverrides = Array.isArray(snippet.overrides) ? snippet.overrides : [];
  merged.overrides = [...existingOverrides, ...snippetOverrides];

  const next = JSON.stringify(merged, null, 2) + '\n';
  const fileResult = writeFileIdempotent(configPath, next, 'overwrite');

  return {
    status: 'applied',
    configPath,
    format: 'legacy-json',
    message: 'ESLint legacy JSON config patched additively (rules + overrides merged). Backup at .eslintrc.json.bak.',
    fileResult,
  };
}

function buildManualMergeMessage(detected: DetectedEslint): string {
  const isFlat = detected.format.startsWith('flat-');
  const snippet = isFlat ? renderEslintFlatSnippet() : JSON.stringify(renderEslintLegacySnippet(), null, 2);
  const formatLabel = isFlat ? 'ESLint FLAT config' : 'ESLint LEGACY config';
  const insertHint = isFlat
    ? 'Append the snippet inside your config array (typical export default [ ... ]):'
    : 'Merge into your config (rules + overrides):';
  return [
    `${formatLabel} detected at ${detected.configPath}.`,
    `Auto-patch unavailable for this format — manual merge required.`,
    insertHint,
    '',
    snippet,
    '',
    'Verification: ESLint should error on `import { X } from "@bleizlabs/ui"` outside _components/ui/ and _components/shared/.',
  ].join('\n');
}
