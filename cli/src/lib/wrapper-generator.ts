import fs from 'node:fs';
import path from 'node:path';
import {
  renderWrapperTsx,
  renderWrapperTsxTypeOnly,
  renderWrapperScss,
  renderWrapperIndex,
  renderRootBarrel,
  renderUiReadme,
} from './templates.js';
import { writeFileIdempotent, type WriteFileResult } from './file-ops.js';
import type { ComponentManifest, ManifestFamily } from './registry-loader.js';

export interface WrapperGenSummary {
  results: WriteFileResult[];
  componentCount: number;
  utilityCount: number;
  typesOnlyCount: number;
}

/**
 * Generate the full wrapper layer for a manifest into the consumer's
 * target directory. Layout:
 *
 *   <targetDir>/
 *     <Family>/
 *       <Family>.tsx
 *       <Family>.module.scss
 *       index.ts
 *     utils/<UtilFamily>/
 *       <UtilFamily>.tsx
 *       <UtilFamily>.module.scss
 *       index.ts
 *     types/<TypesFamily>/
 *       <TypesFamily>.tsx       (type-only re-export)
 *       index.ts
 *     index.ts                  (root barrel)
 *     README.md
 *
 * SCSS placeholders are written for components + utilities (so consumers
 * have a slot ready), but NOT for types-only families (no runtime, no styles).
 */
export function generateWrappers(
  manifest: ComponentManifest,
  targetDir: string,
): WrapperGenSummary {
  const results: WriteFileResult[] = [];

  // Components — direct under targetDir
  for (const f of manifest.components) {
    results.push(...writeFamily(f, path.join(targetDir, f.family), manifest.libVersion, false));
  }

  // Utilities — under targetDir/utils/
  for (const f of manifest.utilities) {
    results.push(...writeFamily(f, path.join(targetDir, 'utils', f.family), manifest.libVersion, false));
  }

  // Types-only — under targetDir/types/, no SCSS
  for (const f of manifest.typesOnly) {
    results.push(...writeFamily(f, path.join(targetDir, 'types', f.family), manifest.libVersion, true));
  }

  // Root barrel
  const rootBarrelPath = path.join(targetDir, 'index.ts');
  results.push(writeFileIdempotent(rootBarrelPath, renderRootBarrel(manifest)));

  // README
  const readmePath = path.join(targetDir, 'README.md');
  // README has its own marker via markdown comment? No — README is plain doc, write only on first init.
  results.push(writeFileIdempotent(readmePath, renderUiReadme(manifest.libVersion), 'skip-if-exists'));

  return {
    results,
    componentCount: manifest.components.length,
    utilityCount: manifest.utilities.length,
    typesOnlyCount: manifest.typesOnly.length,
  };
}

function writeFamily(
  family: ManifestFamily,
  familyDir: string,
  libVersion: string,
  typesOnly: boolean,
): WriteFileResult[] {
  const results: WriteFileResult[] = [];
  const tsxPath = path.join(familyDir, `${family.family}.tsx`);
  const scssPath = path.join(familyDir, `${family.family}.module.scss`);
  const indexPath = path.join(familyDir, 'index.ts');

  const tsxContent = typesOnly
    ? renderWrapperTsxTypeOnly(family, libVersion)
    : renderWrapperTsx(family, libVersion);

  results.push(writeFileIdempotent(tsxPath, tsxContent));
  if (!typesOnly) {
    results.push(writeFileIdempotent(scssPath, renderWrapperScss(family, libVersion)));
  }
  results.push(writeFileIdempotent(indexPath, renderWrapperIndex(family, libVersion)));

  return results;
}

/**
 * Diff manifest vs existing wrapper layer — returns list of missing families.
 * Used by `add --new` (E04) and `init --skip-existing-wrappers`.
 */
export function findMissingWrappers(
  manifest: ComponentManifest,
  targetDir: string,
): { components: ManifestFamily[]; utilities: ManifestFamily[]; typesOnly: ManifestFamily[] } {
  const isPresent = (familyDir: string): boolean => fs.existsSync(familyDir);

  return {
    components: manifest.components.filter(
      (f) => !isPresent(path.join(targetDir, f.family)),
    ),
    utilities: manifest.utilities.filter(
      (f) => !isPresent(path.join(targetDir, 'utils', f.family)),
    ),
    typesOnly: manifest.typesOnly.filter(
      (f) => !isPresent(path.join(targetDir, 'types', f.family)),
    ),
  };
}
