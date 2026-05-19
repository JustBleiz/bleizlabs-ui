import fs from 'node:fs';
import path from 'node:path';

export interface ProjectInfo {
  cwd: string;
  packageJsonPath: string;
  hasNextDep: boolean;
  hasLibDep: boolean;
  hasAppDir: boolean;
  appDirPath: string | null;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  isTypeScript: boolean;
  nextConfigPath: string | null;
  nextConfigFormat: 'cjs' | 'mjs' | 'ts' | null;
  agentInstructionsDir: string;
}

/**
 * Detect consumer project shape. Used by `init` to decide where to write
 * files + which config formats to patch.
 */
export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(
      `No package.json found at ${cwd}.\n` +
        `Run \`npx @bleizlabs/ui init\` from your Next.js project root.`,
    );
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as Record<string, unknown>;
  const allDeps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
    ...(pkg.peerDependencies as Record<string, string> | undefined),
  };

  const hasNextDep = 'next' in allDeps;
  const hasLibDep = '@bleizlabs/ui' in allDeps;

  // Find app/ directory — common locations.
  const appDirCandidates = [path.join(cwd, 'app'), path.join(cwd, 'src', 'app')];
  let appDirPath: string | null = null;
  for (const candidate of appDirCandidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      appDirPath = candidate;
      break;
    }
  }

  // Package manager detection via lockfiles.
  let packageManager: ProjectInfo['packageManager'] = 'unknown';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) {
    packageManager = 'bun';
  } else if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    packageManager = 'pnpm';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    packageManager = 'yarn';
  } else if (fs.existsSync(path.join(cwd, 'package-lock.json'))) {
    packageManager = 'npm';
  }

  const isTypeScript = fs.existsSync(path.join(cwd, 'tsconfig.json'));

  // Next.js config detection.
  let nextConfigPath: string | null = null;
  let nextConfigFormat: ProjectInfo['nextConfigFormat'] = null;
  for (const ext of ['ts', 'mjs', 'js'] as const) {
    const p = path.join(cwd, `next.config.${ext}`);
    if (fs.existsSync(p)) {
      nextConfigPath = p;
      nextConfigFormat = ext === 'js' ? 'cjs' : ext;
      break;
    }
  }

  return {
    cwd,
    packageJsonPath,
    hasNextDep,
    hasLibDep,
    hasAppDir: appDirPath !== null,
    appDirPath,
    packageManager,
    isTypeScript,
    nextConfigPath,
    nextConfigFormat,
    // Agent instructions go alongside package.json (project root) — most
    // tools (Claude Code, Cursor, Codex) read AGENTS.md/CLAUDE.md from cwd.
    // For Next.js projects this is also the natural place.
    agentInstructionsDir: cwd,
  };
}

/**
 * Validate project supports CLI init. Throws with actionable error on fail.
 */
export function validateProject(info: ProjectInfo): void {
  const errs: string[] = [];

  if (!info.hasNextDep) {
    errs.push(
      `No "next" dependency found in package.json. CLI MVP supports Next.js App Router only.`,
    );
  }
  if (!info.hasLibDep) {
    errs.push(`No "@bleizlabs/ui" dependency found. Install first: npm install @bleizlabs/ui`);
  }
  if (!info.hasAppDir) {
    errs.push(
      `No app/ or src/app/ directory found. CLI requires Next.js App Router (Pages Router not supported).`,
    );
  }
  if (!info.isTypeScript) {
    errs.push(
      `No tsconfig.json found. CLI requires TypeScript (wrappers are generated as .tsx with TS types).`,
    );
  }

  if (errs.length > 0) {
    throw new Error('Project validation failed:\n  - ' + errs.join('\n  - '));
  }
}
