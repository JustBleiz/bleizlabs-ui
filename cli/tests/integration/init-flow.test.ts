import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const FIXTURE_SRC = path.join(REPO_ROOT, 'cli', 'test-fixtures', 'next-app-router-minimal');
const CLI_BIN = path.join(REPO_ROOT, 'cli-dist', 'bin.js');

/**
 * Integration tests run the bundled CLI against a tmpdir copy of the
 * minimal Next.js fixture. Validates the full init/add flow end-to-end.
 *
 * Pre-requisite: `npm run build:cli` must have produced `cli-dist/bin.js`.
 * Pre-requisite: fixture must already have `node_modules` installed (the
 * outer fixture install — we copy that into the tmpdir to avoid a fresh
 * install per test run).
 */

let tmpProject: string;

beforeAll(() => {
  if (!fs.existsSync(CLI_BIN)) {
    throw new Error(`CLI bundle missing at ${CLI_BIN}. Run \`npm run build:cli\` first.`);
  }

  // Init doesn't need node_modules — only reads package.json for dep
  // presence check + writes files. Skip node_modules copy (massive +
  // hits Windows symlink perms via npm file: link).
  tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'bz-cli-int-'));
  copyDirSkipNodeModules(FIXTURE_SRC, tmpProject);
}, 60000);

afterAll(() => {
  if (tmpProject) {
    fs.rmSync(tmpProject, { recursive: true, force: true });
  }
});

describe('init flow (integration)', () => {
  it('init scaffolds full wrapper layer + configs + agent instructions', () => {
    runCli(['init'], tmpProject);

    // Wrapper layer — category-nested per CLI v0.11+
    expect(fs.existsSync(path.join(tmpProject, 'app', '_components', 'ui', 'index.ts'))).toBe(true);
    expect(
      fs.existsSync(
        path.join(tmpProject, 'app', '_components', 'ui', 'interactive', 'Button', 'Button.tsx'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          tmpProject,
          'app',
          '_components',
          'ui',
          'interactive',
          'Button',
          'Button.module.scss',
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(tmpProject, 'app', '_components', 'ui', 'display', 'Card', 'Card.tsx'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(tmpProject, 'app', '_components', 'ui', 'complex', 'Sidebar', 'Sidebar.tsx'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpProject, 'app', '_components', 'ui', 'utils', 'cn', 'cn.tsx')),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(tmpProject, 'app', '_components', 'ui', 'types', 'spacing', 'spacing.tsx'),
      ),
    ).toBe(true);

    // Styles
    expect(fs.existsSync(path.join(tmpProject, 'app', 'globals.scss'))).toBe(true);
    expect(fs.existsSync(path.join(tmpProject, 'app', '_styles', 'theme.scss'))).toBe(true);
    expect(fs.existsSync(path.join(tmpProject, 'app', '_styles', 'overrides.scss'))).toBe(true);

    // Configs
    const tsconfig = JSON.parse(fs.readFileSync(path.join(tmpProject, 'tsconfig.json'), 'utf8'));
    expect(tsconfig.compilerOptions.paths['@/components/ui/*']).toEqual(['./app/_components/ui/*']);
    expect(tsconfig.compilerOptions.paths['@/styles/*']).toEqual(['./app/_styles/*']);

    const nextConfig = fs.readFileSync(path.join(tmpProject, 'next.config.mjs'), 'utf8');
    expect(nextConfig).toContain('@bleizlabs/ui');
    expect(nextConfig).toContain('transpilePackages');
    expect(nextConfig).toContain('sassOptions');

    // Agent instructions
    const agents = fs.readFileSync(path.join(tmpProject, 'AGENTS.md'), 'utf8');
    expect(agents).toContain('<!-- BEGIN:bleizlabs-ui');
    expect(agents).toContain('<!-- END:bleizlabs-ui -->');
    expect(agents).toContain('TL;DR');

    const claude = fs.readFileSync(path.join(tmpProject, 'CLAUDE.md'), 'utf8');
    expect(claude).toContain('@AGENTS.md');
    expect(claude).toContain('Claude Code specific');

    // Inventory
    expect(fs.existsSync(path.join(tmpProject, 'docs', 'component-inventory.md'))).toBe(true);
  });

  it('compound family wrapper re-exports all parts + types', () => {
    const cardWrapper = fs.readFileSync(
      path.join(tmpProject, 'app', '_components', 'ui', 'display', 'Card', 'Card.tsx'),
      'utf8',
    );
    expect(cardWrapper).toContain('Card,');
    expect(cardWrapper).toContain('CardHeader,');
    expect(cardWrapper).toContain('CardBody,');
    expect(cardWrapper).toContain('CardFooter,');
    expect(cardWrapper).toContain('type CardProps,');
    expect(cardWrapper).toContain('type CardHeaderProps,');
    expect(cardWrapper).toContain("from '@bleizlabs/ui';");
  });

  it('Sidebar wrapper includes hook in value-exports', () => {
    const sidebarWrapper = fs.readFileSync(
      path.join(tmpProject, 'app', '_components', 'ui', 'complex', 'Sidebar', 'Sidebar.tsx'),
      'utf8',
    );
    expect(sidebarWrapper).toContain('useSidebar,');
    expect(sidebarWrapper).toContain('Sidebar,');
    expect(sidebarWrapper).toContain('type SidebarProps,');
  });

  it('init re-run preserves user-modified file (no marker)', () => {
    const buttonPath = path.join(
      tmpProject,
      'app',
      '_components',
      'ui',
      'interactive',
      'Button',
      'Button.tsx',
    );
    const userContent = '// USER MODIFIED — no marker\nexport { Button } from "@bleizlabs/ui";\n';
    fs.writeFileSync(buttonPath, userContent);

    runCli(['init'], tmpProject);

    expect(fs.readFileSync(buttonPath, 'utf8')).toBe(userContent);
  });

  it('init re-run is idempotent on configs (no double-patch)', () => {
    const tsconfigBefore = fs.readFileSync(path.join(tmpProject, 'tsconfig.json'), 'utf8');

    runCli(['init'], tmpProject);

    const tsconfigAfter = fs.readFileSync(path.join(tmpProject, 'tsconfig.json'), 'utf8');
    const nextAfter = fs.readFileSync(path.join(tmpProject, 'next.config.mjs'), 'utf8');

    expect(tsconfigAfter).toBe(tsconfigBefore);
    // next.config: should still contain marker only once
    expect(nextAfter.match(/added by init/g)?.length).toBe(1);
  });

  it('add --new is idempotent after init (already up to date)', () => {
    const out = runCli(['add', '--new'], tmpProject);
    expect(out).toMatch(/already up to date/i);
  });

  it('add fails on invalid family name', () => {
    expect(() => runCli(['add', 'NotARealFamily'], tmpProject, { ignoreError: false })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runCli(args: string[], cwd: string, opts: { ignoreError?: boolean } = {}): string {
  try {
    return execFileSync(process.execPath, [CLI_BIN, ...args], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    if (opts.ignoreError) {
      return ((e as { stdout?: string }).stdout ?? '') as string;
    }
    throw e;
  }
}

function copyDirSkipNodeModules(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirSkipNodeModules(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
