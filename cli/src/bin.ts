import { Command } from 'commander';
import pc from 'picocolors';
import { CLI_VERSION, printVersion } from './commands/version.js';
import { runInit } from './commands/init.js';
import { runAdd } from './commands/add.js';
import { loadManifest, countTotalNames } from './lib/registry-loader.js';

/**
 * `bleizlabs-ui` CLI entrypoint.
 *
 * Bundled via tsup (cli/tsup.config.ts) into single-file ESM `cli-dist/bin.js`.
 * Distributed as `bin` entry of `@bleizlabs/ui` package — invocable via
 * `npx @bleizlabs/ui <cmd>` or `npx bleizlabs-ui <cmd>` after install.
 *
 * Commands:
 *   - init   (E03 — bootstrap consumer wrapper layer; placeholder in E02)
 *   - add    (E04 — incremental wrappers; placeholder in E02)
 *   - status (E02 — diagnostic: show installed lib + manifest summary)
 *   - --version / -v
 *   - --help / -h
 */

const program = new Command();

program
  .name('bleizlabs-ui')
  .description(
    'CLI for @bleizlabs/ui — bootstrap project wrapper layer + add wrappers for new lib components.',
  )
  .version(`cli v${CLI_VERSION}`, '-v, --version', 'output the CLI version + installed lib version')
  .helpOption('-h, --help', 'display help for command');

program
  .command('init')
  .description('Bootstrap project wrapper layer in current consumer project (Next.js App Router)')
  .option('--target-dir <path>', 'wrapper layer target directory', 'app/_components/ui')
  .option('--styles-dir <path>', 'project styles directory', 'app/_styles')
  .option('--global-css <path>', 'global CSS entrypoint', 'app/globals.scss')
  .option('--no-prompts', 'CI mode — fail on conflicts instead of prompting')
  .option('--dry-run', 'preview changes without writing files')
  .action(async (opts: { targetDir: string; stylesDir: string; globalCss: string; prompts: boolean; dryRun: boolean }) => {
    const code = await runInit(import.meta.url, {
      targetDir: opts.targetDir,
      stylesDir: opts.stylesDir,
      globalCss: opts.globalCss,
      prompts: opts.prompts !== false,
      dryRun: opts.dryRun === true,
    });
    process.exitCode = code;
  });

program
  .command('add [names...]')
  .description('Scaffold wrapper(s) for one or more lib component families')
  .option('--all', 'scaffold every wrapper from manifest (overwrites generated files only)')
  .option('--new', 'scaffold only missing wrappers (default when no names given)')
  .option('--target-dir <path>', 'wrapper layer target directory', 'app/_components/ui')
  .option('--dry-run', 'preview changes without writing files')
  .action(async (
    names: string[] | undefined,
    opts: { all?: boolean; new?: boolean; targetDir: string; dryRun?: boolean },
  ) => {
    const code = await runAdd(import.meta.url, {
      names: names ?? [],
      all: opts.all === true,
      newOnly: opts.new === true || (!opts.all && (names === undefined || names.length === 0)),
      targetDir: opts.targetDir,
      dryRun: opts.dryRun === true,
    });
    process.exitCode = code;
  });

program
  .command('status')
  .description('Diagnostic: show installed @bleizlabs/ui + manifest summary')
  .action(() => {
    try {
      const manifest = loadManifest(import.meta.url);
      console.log(pc.bold('@bleizlabs/ui status'));
      console.log(`  ${pc.dim('lib version:')}     ${manifest.libVersion}`);
      console.log(`  ${pc.dim('manifest schema:')} v${manifest.schemaVersion}`);
      console.log(`  ${pc.dim('generated at:')}    ${manifest.generatedAt}`);
      console.log(
        `  ${pc.dim('component families:')} ${manifest.components.length}`,
      );
      console.log(`  ${pc.dim('utilities:')}      ${manifest.utilities.length}`);
      console.log(`  ${pc.dim('types-only:')}     ${manifest.typesOnly.length}`);
      console.log(`  ${pc.dim('total names:')}    ${countTotalNames(manifest)}`);
      console.log('');
      console.log(pc.dim('Categories:'));
      for (const [cat, families] of Object.entries(manifest.categories)) {
        console.log(`  ${cat}: ${families.length} families`);
      }
    } catch (e) {
      console.error(pc.red('status failed: ') + (e as Error).message);
      process.exitCode = 1;
    }
  });

// Override default --version output with rich format.
program.configureHelp({
  sortSubcommands: true,
});

const argv = process.argv;
const wantsVersion =
  argv.includes('-v') || argv.includes('--version') || argv[2] === 'version';

if (wantsVersion) {
  printVersion(import.meta.url);
  process.exit(0);
}

// parseAsync awaits async .action handlers so process.exitCode is honored.
program.parseAsync(argv).catch((err) => {
  console.error(pc.red('CLI error: ') + (err as Error).message);
  process.exit(1);
});
