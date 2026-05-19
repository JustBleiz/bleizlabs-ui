import path from 'node:path';
import pc from 'picocolors';
import { loadManifest, countTotalNames, type ComponentManifest } from '../lib/registry-loader.js';
import { detectProject, validateProject, type ProjectInfo } from '../lib/project-detector.js';
import { generateWrappers } from '../lib/wrapper-generator.js';
import { autoMigrate } from '../lib/migrate-categories.js';
import {
  writeFileIdempotent,
  updateManagedBlock,
  cleanupOrphanedTmp,
  type WriteFileResult,
} from '../lib/file-ops.js';
import {
  renderGlobalsScss,
  renderStylesTheme,
  renderStylesOverrides,
  renderAgentsManagedBlock,
  renderClaudeManagedBlock,
  renderComponentInventory,
} from '../lib/templates.js';
import { detectEslintConfig, patchEslintConfig } from '../lib/eslint-patcher.js';
import { patchTsconfig } from '../lib/tsconfig-patcher.js';
import { patchNextConfig } from '../lib/nextconfig-patcher.js';

export interface InitOptions {
  targetDir: string;
  stylesDir: string;
  globalCss: string;
  prompts: boolean;
  dryRun: boolean;
}

interface StepLog {
  name: string;
  status: 'ok' | 'warn' | 'error' | 'skip';
  detail: string;
}

export async function runInit(importMetaUrl: string, options: InitOptions): Promise<number> {
  const log = console.log;
  const steps: StepLog[] = [];

  log(pc.bold(pc.cyan('@bleizlabs/ui init')) + pc.dim(` (dry-run: ${options.dryRun})`));
  log('');

  // --- Step 0: Detect + validate project --------------------------------
  let project: ProjectInfo;
  try {
    project = detectProject(process.cwd());
    validateProject(project);
    log(pc.green('✓') + ' Project detected: Next.js App Router @ ' + pc.dim(project.cwd));
    log(
      `  ${pc.dim('package manager:')} ${project.packageManager}  ` +
        `${pc.dim('TS:')} ${project.isTypeScript ? 'yes' : 'no'}  ` +
        `${pc.dim('app dir:')} ${path.relative(project.cwd, project.appDirPath ?? '')}`,
    );
    if (project.nextConfigPath) {
      log(
        `  ${pc.dim('next.config:')} ${path.relative(project.cwd, project.nextConfigPath)} (${project.nextConfigFormat})`,
      );
    }
  } catch (e) {
    log(pc.red('✗ Project validation failed:'));
    log('  ' + (e as Error).message);
    return 1;
  }

  // --- Step 1: Load manifest --------------------------------------------
  let manifest: ComponentManifest;
  try {
    manifest = loadManifest(importMetaUrl);
    log(
      pc.green('✓') +
        ` Manifest loaded: lib v${manifest.libVersion}, ` +
        `${manifest.components.length} components + ${manifest.utilities.length} utilities + ${manifest.typesOnly.length} types-only ` +
        `(${countTotalNames(manifest)} total names)`,
    );
  } catch (e) {
    log(pc.red('✗ Manifest load failed:'));
    log('  ' + (e as Error).message);
    return 1;
  }

  // --- Step 2: Pre-flight cleanup ---------------------------------------
  const targetAbs = path.resolve(project.cwd, options.targetDir);
  if (!options.dryRun) {
    const orphaned = cleanupOrphanedTmp(targetAbs);
    if (orphaned > 0) {
      log(pc.yellow(`  cleaned ${orphaned} orphaned .tmp files from previous run`));
    }
  }

  if (options.dryRun) {
    log('');
    log(pc.bold(pc.yellow('[dry-run]')) + ' Would generate the following:');
    log(
      `  ${pc.dim('wrapper layer:')} ${options.targetDir}/ (${manifest.components.length + manifest.utilities.length + manifest.typesOnly.length} families × 2-3 files each)`,
    );
    log(
      `  ${pc.dim('styles:')}        ${options.globalCss}, ${options.stylesDir}/{theme,overrides}.scss`,
    );
    log(`  ${pc.dim('eslint:')}        patch ${detectEslintConfig(project.cwd).format}`);
    log(`  ${pc.dim('tsconfig:')}      paths @/components/ui/*, @/styles/*`);
    log(`  ${pc.dim('next.config:')}   transpilePackages + sassOptions.loadPaths`);
    log(`  ${pc.dim('agents:')}        AGENTS.md + CLAUDE.md (managed block)`);
    log(`  ${pc.dim('inventory:')}     docs/component-inventory.md`);
    log('');
    log(pc.dim('Re-run without --dry-run to apply changes.'));
    return 0;
  }

  // --- Step 2.5: Auto-migrate pre-v0.11 flat layout to category-nested ---
  const migration = autoMigrate(manifest, targetAbs);
  if (migration.migrated.length > 0 || migration.conflicts.length > 0) {
    const detailParts: string[] = [];
    if (migration.migrated.length > 0) {
      detailParts.push(`${migration.migrated.length} migrated to category subdirs`);
    }
    if (migration.conflicts.length > 0) {
      detailParts.push(
        `${migration.conflicts.length} conflicts (flat + nested both exist — review manually)`,
      );
    }
    if (migration.unmarked.length > 0) {
      detailParts.push(`${migration.unmarked.length} unmarked (left untouched)`);
    }
    steps.push({
      name: 'category migration',
      status: migration.conflicts.length > 0 ? 'warn' : 'ok',
      detail: detailParts.join(', '),
    });
  }

  // --- Step 3: Generate wrapper layer ----------------------------------
  const wrapperSummary = generateWrappers(manifest, targetAbs);
  const wrapperWritten = wrapperSummary.results.filter((r) => r.action !== 'skipped').length;
  const wrapperSkipped = wrapperSummary.results.filter((r) => r.action === 'skipped').length;
  steps.push({
    name: 'wrapper layer',
    status: 'ok',
    detail: `${wrapperWritten} files written, ${wrapperSkipped} skipped (user-modified or marker absent)`,
  });

  // --- Step 4: Generate styles ------------------------------------------
  const globalsAbs = path.resolve(project.cwd, options.globalCss);
  const stylesAbs = path.resolve(project.cwd, options.stylesDir);
  const globalsResult = writeFileIdempotent(
    globalsAbs,
    renderGlobalsScss(manifest.libVersion),
    'skip-if-exists',
  );
  const themeResult = writeFileIdempotent(
    path.join(stylesAbs, 'theme.scss'),
    renderStylesTheme(manifest.libVersion),
    'skip-if-exists',
  );
  const overridesResult = writeFileIdempotent(
    path.join(stylesAbs, 'overrides.scss'),
    renderStylesOverrides(manifest.libVersion),
    'skip-if-exists',
  );
  steps.push({
    name: 'styles',
    status: 'ok',
    detail: [
      `globals.scss ${globalsResult.action}`,
      `theme.scss ${themeResult.action}`,
      `overrides.scss ${overridesResult.action}`,
    ].join(', '),
  });

  // --- Step 5: Patch ESLint --------------------------------------------
  const eslintDetected = detectEslintConfig(project.cwd);
  const eslintResult = patchEslintConfig(eslintDetected);
  steps.push({
    name: 'eslint',
    status:
      eslintResult.status === 'applied'
        ? 'ok'
        : eslintResult.status === 'manual-required'
          ? 'warn'
          : 'skip',
    detail: eslintResult.message,
  });

  // --- Step 6: Patch tsconfig -------------------------------------------
  const tsconfigPath = path.join(project.cwd, 'tsconfig.json');
  const tsconfigResult = patchTsconfig({
    tsconfigPath,
    targetDir: options.targetDir,
    stylesDir: options.stylesDir,
  });
  steps.push({
    name: 'tsconfig',
    status:
      tsconfigResult.status === 'applied' || tsconfigResult.status === 'no-changes-needed'
        ? 'ok'
        : 'error',
    detail: tsconfigResult.message,
  });

  // --- Step 7: Patch next.config ----------------------------------------
  const nextResult = patchNextConfig(project);
  steps.push({
    name: 'next.config',
    status:
      nextResult.status === 'applied' || nextResult.status === 'already-patched' ? 'ok' : 'warn',
    detail: nextResult.message,
  });

  // --- Step 8: Agent instructions ---------------------------------------
  const agentsPath = path.join(project.agentInstructionsDir, 'AGENTS.md');
  const claudePath = path.join(project.agentInstructionsDir, 'CLAUDE.md');
  const agentsResult = updateManagedBlock(
    agentsPath,
    renderAgentsManagedBlock(manifest.libVersion),
  );
  const claudeResult = updateManagedBlock(
    claudePath,
    renderClaudeManagedBlock(manifest.libVersion),
  );
  steps.push({
    name: 'agent instructions',
    status: 'ok',
    detail: `AGENTS.md ${agentsResult.action}, CLAUDE.md ${claudeResult.action}`,
  });

  // --- Step 9: Component inventory --------------------------------------
  const inventoryPath = path.join(project.cwd, 'docs', 'component-inventory.md');
  const inventoryResult = writeFileIdempotent(
    inventoryPath,
    renderComponentInventory(manifest.libVersion),
    'skip-if-exists',
  );
  steps.push({
    name: 'inventory',
    status: 'ok',
    detail: `docs/component-inventory.md ${inventoryResult.action}`,
  });

  // --- Step 10: Print summary -------------------------------------------
  log('');
  log(pc.bold('Summary'));
  for (const step of steps) {
    const icon =
      step.status === 'ok'
        ? pc.green('✓')
        : step.status === 'warn'
          ? pc.yellow('!')
          : step.status === 'error'
            ? pc.red('✗')
            : pc.dim('·');
    log(`  ${icon} ${step.name.padEnd(20)} ${pc.dim(step.detail)}`);
  }

  // Show manual-merge snippets if any
  if (eslintResult.status === 'manual-required') {
    log('');
    log(pc.yellow('⚠ ESLint manual merge required:'));
    log(
      eslintResult.message
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n'),
    );
  }
  if (nextResult.status === 'manual-required' && nextResult.manualSnippet) {
    log('');
    log(pc.yellow('⚠ next.config manual merge required:'));
    log(
      nextResult.manualSnippet
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n'),
    );
  }

  log('');
  log(pc.green(pc.bold('init complete.')));
  log(pc.dim('Next steps:'));
  log(pc.dim('  1. Edit app/globals.scss → set $seed-brand etc. for your project'));
  log(pc.dim('  2. Build pages composing from `import { ... } from "@/components/ui"`'));
  log(pc.dim('  3. After lib upgrade: npx @bleizlabs/ui add --new'));

  // Determine exit code: any error → 1, any warn → 0 but visible.
  const hasError = steps.some((s) => s.status === 'error');
  return hasError ? 1 : 0;
}

export type { WriteFileResult };
