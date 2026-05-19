import path from 'node:path';
import pc from 'picocolors';
import {
  loadManifest,
  type ComponentManifest,
  type ManifestFamily,
} from '../lib/registry-loader.js';
import { detectProject, type ProjectInfo } from '../lib/project-detector.js';
import { findMissingWrappers, generateWrappers } from '../lib/wrapper-generator.js';
import { autoMigrate } from '../lib/migrate-categories.js';
import { writeFileIdempotent, type WriteFileResult } from '../lib/file-ops.js';
import {
  renderWrapperTsx,
  renderWrapperTsxTypeOnly,
  renderWrapperScss,
  renderWrapperIndex,
  renderRootBarrel,
} from '../lib/templates.js';

export interface AddOptions {
  names: string[];
  all: boolean;
  newOnly: boolean;
  targetDir: string;
  dryRun: boolean;
}

interface ResolvedFamilies {
  components: ManifestFamily[];
  utilities: ManifestFamily[];
  typesOnly: ManifestFamily[];
}

export async function runAdd(importMetaUrl: string, options: AddOptions): Promise<number> {
  const log = console.log;
  log(pc.bold(pc.cyan('@bleizlabs/ui add')) + pc.dim(` (dry-run: ${options.dryRun})`));
  log('');

  // --- Load manifest + detect project ----------------------------------
  let project: ProjectInfo;
  let manifest: ComponentManifest;
  try {
    project = detectProject(process.cwd());
    manifest = loadManifest(importMetaUrl);
  } catch (e) {
    log(pc.red('✗ ') + (e as Error).message);
    return 1;
  }

  const targetAbs = path.resolve(project.cwd, options.targetDir);

  // --- Auto-migrate pre-v0.11 flat layout BEFORE diffing/scaffolding ---
  // findMissingWrappers compares against the new category-nested paths; if
  // the consumer is still on flat layout, every family would look "missing"
  // and we'd generate duplicate folders. Migrate first so the diff reflects
  // reality.
  if (!options.dryRun) {
    const migration = autoMigrate(manifest, targetAbs);
    if (migration.migrated.length > 0) {
      log(
        pc.green('✓ ') +
          `Migrated ${migration.migrated.length} component folders to category-nested layout`,
      );
    }
    if (migration.conflicts.length > 0) {
      log(
        pc.yellow('! ') +
          `${migration.conflicts.length} family folders exist in BOTH flat and nested locations — review manually`,
      );
      for (const c of migration.conflicts) {
        log(pc.dim(`    ${c.family}: ${c.flatPath} + ${c.nestedPath}`));
      }
    }
  }

  // --- Resolve which families to scaffold ------------------------------
  const resolved = resolveFamilies(options, manifest, targetAbs);
  if (resolved.kind === 'error') {
    log(pc.red('✗ ') + resolved.message);
    return 1;
  }

  const total =
    resolved.families.components.length +
    resolved.families.utilities.length +
    resolved.families.typesOnly.length;

  if (total === 0) {
    log(pc.green('✓ ') + 'Already up to date — no missing wrappers.');
    log(pc.dim('  Run with --all to regenerate every wrapper (overwrites generated files only).'));
    return 0;
  }

  log(pc.dim(`Mode:        ${resolved.modeLabel}`));
  log(pc.dim(`Target dir:  ${options.targetDir}`));
  log(pc.dim(`Lib version: ${manifest.libVersion}`));
  log('');
  log(pc.bold('Will scaffold:'));
  printFamilyList('components', resolved.families.components);
  printFamilyList('utilities', resolved.families.utilities);
  printFamilyList('types', resolved.families.typesOnly);
  log('');

  if (options.dryRun) {
    log(pc.yellow('[dry-run]') + ' No files written. Re-run without --dry-run to apply.');
    return 0;
  }

  // --- Apply ------------------------------------------------------------
  const results: WriteFileResult[] = [];
  for (const f of resolved.families.components) {
    results.push(...writeOne(f, targetAbs, manifest.libVersion, false));
  }
  for (const f of resolved.families.utilities) {
    results.push(...writeOne(f, targetAbs, manifest.libVersion, false));
  }
  for (const f of resolved.families.typesOnly) {
    results.push(...writeOne(f, targetAbs, manifest.libVersion, true));
  }

  // Always regenerate root barrel — manifest may have new families
  const rootBarrelPath = path.join(targetAbs, 'index.ts');
  results.push(writeFileIdempotent(rootBarrelPath, renderRootBarrel(manifest)));

  // --- Summary ---------------------------------------------------------
  const written = results.filter((r) => r.action !== 'skipped').length;
  const skipped = results.filter((r) => r.action === 'skipped').length;
  log(pc.bold('Summary'));
  log(
    `  ${pc.green('✓')} ${written} files written, ${skipped} skipped (user-modified or marker absent)`,
  );
  log(`  ${pc.green('✓')} root barrel regenerated`);
  log('');
  log(pc.green(pc.bold('add complete.')));
  return 0;
}

// ---------------------------------------------------------------------------
// Family resolution
// ---------------------------------------------------------------------------

type ResolveOk = {
  kind: 'ok';
  families: ResolvedFamilies;
  modeLabel: string;
};
type ResolveErr = { kind: 'error'; message: string };

function resolveFamilies(
  options: AddOptions,
  manifest: ComponentManifest,
  targetAbs: string,
): ResolveOk | ResolveErr {
  // 1. --all → every family (write mode handled per-file via marker check)
  if (options.all) {
    return {
      kind: 'ok',
      modeLabel: '--all (regenerate every wrapper, generated-marker files only)',
      families: {
        components: manifest.components,
        utilities: manifest.utilities,
        typesOnly: manifest.typesOnly,
      },
    };
  }

  // 2. Explicit names → match by family name
  if (options.names.length > 0) {
    const found: ResolvedFamilies = {
      components: [],
      utilities: [],
      typesOnly: [],
    };
    const notFound: string[] = [];
    for (const requested of options.names) {
      const cm = manifest.components.find((f) => f.family === requested);
      if (cm) {
        found.components.push(cm);
        continue;
      }
      const um = manifest.utilities.find((f) => f.family === requested);
      if (um) {
        found.utilities.push(um);
        continue;
      }
      const tm = manifest.typesOnly.find((f) => f.family === requested);
      if (tm) {
        found.typesOnly.push(tm);
        continue;
      }
      notFound.push(requested);
    }
    if (notFound.length > 0) {
      const sample = manifest.components
        .slice(0, 5)
        .map((f) => f.family)
        .join(', ');
      return {
        kind: 'error',
        message: `Family name(s) not in manifest: ${notFound.join(', ')}.\nKnown families (sample): ${sample}, ...\nRun \`bleizlabs-ui status\` to see full list.`,
      };
    }
    return {
      kind: 'ok',
      modeLabel: `explicit names (${options.names.join(', ')})`,
      families: found,
    };
  }

  // 3. --new (default when no names) → diff manifest vs existing dir
  return {
    kind: 'ok',
    modeLabel: '--new (missing wrappers only)',
    families: findMissingWrappers(manifest, targetAbs),
  };
}

// ---------------------------------------------------------------------------
// File writing
// ---------------------------------------------------------------------------

function writeOne(
  family: ManifestFamily,
  targetAbs: string,
  libVersion: string,
  typesOnly: boolean,
): WriteFileResult[] {
  // Manifest carries the authoritative category per family:
  //   components    -> 'layout' | 'typography' | 'display' | 'interactive' | ...
  //   utilities     -> 'utils'
  //   typesOnly     -> 'types'
  // Mirror lib structure under targetDir for consumer navigability.
  const familyDir = path.join(targetAbs, family.category, family.family);

  const results: WriteFileResult[] = [];
  const tsxContent = typesOnly
    ? renderWrapperTsxTypeOnly(family, libVersion)
    : renderWrapperTsx(family, libVersion);

  results.push(writeFileIdempotent(path.join(familyDir, `${family.family}.tsx`), tsxContent));
  if (!typesOnly) {
    results.push(
      writeFileIdempotent(
        path.join(familyDir, `${family.family}.module.scss`),
        renderWrapperScss(family, libVersion),
      ),
    );
  }
  results.push(
    writeFileIdempotent(path.join(familyDir, 'index.ts'), renderWrapperIndex(family, libVersion)),
  );

  return results;
}

function printFamilyList(label: string, families: ManifestFamily[]): void {
  if (families.length === 0) return;
  console.log(`  ${pc.dim(label.padEnd(12))} ${families.length} families`);
  const names = families
    .map((f) => f.family)
    .slice(0, 12)
    .join(', ');
  const more = families.length > 12 ? `, ... (+${families.length - 12} more)` : '';
  console.log(`    ${pc.dim(names + more)}`);
}

// Used by generateWrappers in init flow if needed for full regeneration
export { generateWrappers };
