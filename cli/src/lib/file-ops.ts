import fs from 'node:fs';
import path from 'node:path';
import { MARKER_REGEX_TS, MARKER_BEGIN_MD, MARKER_END_MD } from './templates.js';

export type WriteMode =
  | 'create-only' // Fail if file exists.
  | 'overwrite-if-marker' // Overwrite only if generated marker present.
  | 'overwrite' // Always overwrite (after .bak backup).
  | 'skip-if-exists'; // No-op if file exists.

export interface WriteFileResult {
  path: string;
  action: 'created' | 'overwritten' | 'skipped' | 'backed-up-and-overwritten';
  reason?: string;
}

/**
 * Idempotent file writer with marker check.
 *
 * - `overwrite-if-marker`: only overwrites if file starts with @bleizlabs/ui-generated marker.
 *   User-modified files (no marker) are SKIPPED with reason. Backup written before overwrite.
 * - `skip-if-exists`: no-op if file exists (used for `globals.scss` initial setup).
 * - `create-only`: fail if exists (transactional pre-validate).
 * - `overwrite`: always overwrite, .bak backup of original.
 */
export function writeFileIdempotent(
  filePath: string,
  content: string,
  mode: WriteMode = 'overwrite-if-marker',
): WriteFileResult {
  const exists = fs.existsSync(filePath);

  if (!exists) {
    ensureDir(path.dirname(filePath));
    writeAtomic(filePath, content);
    return { path: filePath, action: 'created' };
  }

  if (mode === 'create-only') {
    throw new Error(`File exists, refusing to overwrite: ${filePath}`);
  }

  if (mode === 'skip-if-exists') {
    return { path: filePath, action: 'skipped', reason: 'file exists' };
  }

  const existing = fs.readFileSync(filePath, 'utf8');

  if (mode === 'overwrite-if-marker') {
    if (!hasGeneratedMarker(existing, filePath)) {
      return {
        path: filePath,
        action: 'skipped',
        reason: 'user-modified (no @bleizlabs/ui-generated marker)',
      };
    }
    backupFile(filePath, existing);
    writeAtomic(filePath, content);
    return { path: filePath, action: 'backed-up-and-overwritten' };
  }

  // mode === 'overwrite'
  backupFile(filePath, existing);
  writeAtomic(filePath, content);
  return { path: filePath, action: 'backed-up-and-overwritten' };
}

/**
 * Update a managed block in a markdown file (AGENTS.md / CLAUDE.md style).
 *
 * - File missing → write fresh content (full file = managed block alone).
 * - File exists with markers → replace block content, preserve outside.
 * - File exists without markers → APPEND block at end (with leading separator).
 */
export function updateManagedBlock(filePath: string, newBlock: string): WriteFileResult {
  if (!fs.existsSync(filePath)) {
    ensureDir(path.dirname(filePath));
    writeAtomic(filePath, newBlock + '\n');
    return { path: filePath, action: 'created' };
  }

  const existing = fs.readFileSync(filePath, 'utf8');
  const beginMatch = existing.match(MARKER_BEGIN_MD);
  const endMatch = existing.match(MARKER_END_MD);

  if (beginMatch && endMatch && beginMatch.index !== undefined) {
    const before = existing.slice(0, beginMatch.index).trimEnd();
    const afterStart =
      endMatch.index !== undefined ? endMatch.index + endMatch[0].length : existing.length;
    const after = existing.slice(afterStart).replace(/^\s*/, '');

    const parts: string[] = [];
    if (before) parts.push(before);
    parts.push(newBlock);
    if (after) parts.push(after);
    const next = parts.join('\n\n').trimEnd() + '\n';

    backupFile(filePath, existing);
    writeAtomic(filePath, next);
    return { path: filePath, action: 'backed-up-and-overwritten' };
  }

  // No markers — append at end with separator.
  backupFile(filePath, existing);
  const next = existing.trimEnd() + '\n\n' + newBlock + '\n';
  writeAtomic(filePath, next);
  return { path: filePath, action: 'backed-up-and-overwritten' };
}

function hasGeneratedMarker(content: string, filePath: string): boolean {
  if (filePath.endsWith('.md')) {
    return MARKER_BEGIN_MD.test(content);
  }
  // .ts, .tsx, .scss, .json, .mjs, .js — TS-style line comment marker.
  return MARKER_REGEX_TS.test(content);
}

function backupFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath + '.bak', content, 'utf8');
}

function writeAtomic(filePath: string, content: string): void {
  // Best-effort atomic via tmp + rename. POSIX rename is atomic; Windows
  // sometimes throws EEXIST so we unlink dest first.
  const tmp = filePath + '.tmp-' + Date.now();
  fs.writeFileSync(tmp, content, 'utf8');
  try {
    fs.renameSync(tmp, filePath);
  } catch {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.renameSync(tmp, filePath);
  }
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Pre-flight cleanup — remove orphaned .tmp-* files from previous failed runs
 * inside a target directory tree. Safe — only matches our naming pattern.
 */
export function cleanupOrphanedTmp(rootDir: string): number {
  if (!fs.existsSync(rootDir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      removed += cleanupOrphanedTmp(full);
    } else if (/\.tmp-\d+$/.test(entry.name)) {
      try {
        fs.unlinkSync(full);
        removed++;
      } catch {
        // best-effort
      }
    }
  }
  return removed;
}
