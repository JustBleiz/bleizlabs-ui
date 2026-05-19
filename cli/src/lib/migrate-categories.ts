import fs from 'node:fs';
import path from 'node:path';
import type { ComponentManifest, ManifestFamily } from './registry-loader.js';
import { MARKER_REGEX_TS } from './templates.js';

/**
 * CLI v0.11.0 introduces category-nested wrapper layout. This module detects
 * pre-v0.11 flat layout (every family folder as a direct child of the wrapper
 * root) and moves each family folder into its category subdirectory before
 * `init`/`add` regenerates files.
 *
 * Detection rule for "this is a generated flat wrapper folder":
 *   - <targetDir>/<Family>/<Family>.tsx exists
 *   - That file's first line matches MARKER_REGEX_TS
 *     (`// @bleizlabs/ui-generated v<version>`)
 *
 * Folders that look like wrappers but lack the marker are left alone — the
 * consumer is responsible for them. This matches the idempotent semantics
 * of writeFileIdempotent: never touch a file the user might have authored.
 *
 * Conflict handling: if BOTH the flat and nested paths exist for a family,
 * the flat folder is preserved untouched and a warning surfaces in the
 * returned `conflicts` array. Operator decides whether to delete the flat
 * orphan or merge changes by hand.
 *
 * Utilities and types-only families were already nested under `utils/` and
 * `types/` in v0.10.x, so they are not migration candidates here. The
 * migration only touches component families.
 */

export interface MigrateCategoryResult {
  /** Families successfully moved from flat to nested layout. */
  migrated: Array<{ family: string; from: string; to: string }>;
  /** Families where both flat and nested paths exist — operator must resolve. */
  conflicts: Array<{ family: string; flatPath: string; nestedPath: string }>;
  /** Families that look like wrappers but lack the generated marker — left alone. */
  unmarked: Array<{ family: string; flatPath: string }>;
}

/**
 * Scan `targetDir` for flat-layout wrapper folders that should migrate to
 * `targetDir/<category>/<Family>/`. Pure inspection — does not touch the
 * filesystem.
 */
export function detectFlatLayout(
  manifest: ComponentManifest,
  targetDir: string,
): MigrateCategoryResult {
  const result: MigrateCategoryResult = {
    migrated: [],
    conflicts: [],
    unmarked: [],
  };

  if (!fs.existsSync(targetDir)) return result;

  for (const family of manifest.components) {
    const flatPath = path.join(targetDir, family.family);
    const nestedPath = path.join(targetDir, family.category, family.family);

    if (!fs.existsSync(flatPath) || !fs.statSync(flatPath).isDirectory()) {
      continue;
    }

    if (!hasGeneratedMarker(family, flatPath)) {
      result.unmarked.push({ family: family.family, flatPath });
      continue;
    }

    if (fs.existsSync(nestedPath)) {
      result.conflicts.push({
        family: family.family,
        flatPath,
        nestedPath,
      });
      continue;
    }

    result.migrated.push({
      family: family.family,
      from: flatPath,
      to: nestedPath,
    });
  }

  return result;
}

/**
 * Apply the migration plan produced by `detectFlatLayout`. Moves each
 * `migrated` entry's folder to its nested location. Conflicts and unmarked
 * folders are left untouched and surfaced for operator awareness.
 *
 * Idempotent: re-running after a successful migration finds zero candidates
 * (flat folders no longer exist).
 */
export function migrateFlatToCategory(plan: MigrateCategoryResult): void {
  for (const entry of plan.migrated) {
    const parentDir = path.dirname(entry.to);
    fs.mkdirSync(parentDir, { recursive: true });
    fs.renameSync(entry.from, entry.to);
  }
}

/**
 * Detect-and-migrate one-shot helper. Returns the plan that was applied so
 * callers can render a summary line.
 */
export function autoMigrate(manifest: ComponentManifest, targetDir: string): MigrateCategoryResult {
  const plan = detectFlatLayout(manifest, targetDir);
  migrateFlatToCategory(plan);
  return plan;
}

function hasGeneratedMarker(family: ManifestFamily, flatPath: string): boolean {
  const tsxPath = path.join(flatPath, `${family.family}.tsx`);
  if (!fs.existsSync(tsxPath)) return false;
  let content: string;
  try {
    content = fs.readFileSync(tsxPath, 'utf8');
  } catch {
    return false;
  }
  return MARKER_REGEX_TS.test(content);
}
