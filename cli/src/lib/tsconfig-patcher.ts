import fs from 'node:fs';
import { writeFileIdempotent, type WriteFileResult } from './file-ops.js';

export interface TsconfigPatchOptions {
  tsconfigPath: string;
  targetDir: string; // e.g. "app/_components/ui"
  stylesDir: string; // e.g. "app/_styles"
}

export interface TsconfigPatchResult {
  status: 'applied' | 'collision-detected' | 'no-changes-needed' | 'invalid-json';
  message: string;
  collidingPaths?: string[];
  fileResult?: WriteFileResult;
}

/**
 * Patch tsconfig.json to add path aliases for wrapper layer + styles.
 *
 * Adds:
 *   - "@/components/ui/*"  → "./<targetDir>/*"
 *   - "@/components/ui"    → "./<targetDir>/index.ts"
 *   - "@/styles/*"         → "./<stylesDir>/*"
 *
 * Detects collisions: if any of these paths already exist with different
 * mapping, returns 'collision-detected' and the user must merge manually.
 * Existing identical mappings are no-op.
 *
 * NOTE: tsconfig.json may have // comments (jsonc). We use a tolerant parser
 * — if standard JSON.parse fails, attempt comment stripping fallback.
 */
export function patchTsconfig(opts: TsconfigPatchOptions): TsconfigPatchResult {
  const { tsconfigPath, targetDir, stylesDir } = opts;

  if (!fs.existsSync(tsconfigPath)) {
    return {
      status: 'invalid-json',
      message: `tsconfig.json not found at ${tsconfigPath}`,
    };
  }

  const raw = fs.readFileSync(tsconfigPath, 'utf8');
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    try {
      parsed = JSON.parse(stripJsonComments(raw)) as Record<string, unknown>;
    } catch (e) {
      return {
        status: 'invalid-json',
        message: `tsconfig.json is not valid JSON/JSONC: ${(e as Error).message}`,
      };
    }
  }

  const compilerOptions = (parsed.compilerOptions as Record<string, unknown> | undefined) ?? {};
  const existingPaths = (compilerOptions.paths as Record<string, string[]> | undefined) ?? {};

  const desired: Record<string, string[]> = {
    '@/components/ui/*': [`./${targetDir}/*`],
    '@/components/ui': [`./${targetDir}/index.ts`],
    '@/styles/*': [`./${stylesDir}/*`],
  };

  const collisions: string[] = [];
  for (const [key, val] of Object.entries(desired)) {
    if (existingPaths[key] && JSON.stringify(existingPaths[key]) !== JSON.stringify(val)) {
      collisions.push(
        `${key} → ${JSON.stringify(existingPaths[key])} (want ${JSON.stringify(val)})`,
      );
    }
  }
  if (collisions.length > 0) {
    return {
      status: 'collision-detected',
      message:
        `Path alias collision in tsconfig.json:\n  ` +
        collisions.join('\n  ') +
        `\nResolve manually — either rename existing aliases or accept new mapping.`,
      collidingPaths: collisions,
    };
  }

  // Check if patch needed at all.
  const allPresent = Object.entries(desired).every(
    ([key, val]) =>
      existingPaths[key] && JSON.stringify(existingPaths[key]) === JSON.stringify(val),
  );
  if (allPresent) {
    return {
      status: 'no-changes-needed',
      message: 'tsconfig paths already present — nothing to patch.',
    };
  }

  // Merge.
  const mergedPaths: Record<string, string[]> = { ...existingPaths };
  for (const [key, val] of Object.entries(desired)) {
    mergedPaths[key] = val;
  }
  const merged: Record<string, unknown> = {
    ...parsed,
    compilerOptions: {
      ...compilerOptions,
      paths: mergedPaths,
    },
  };

  const next = JSON.stringify(merged, null, 2) + '\n';
  const fileResult = writeFileIdempotent(tsconfigPath, next, 'overwrite');

  return {
    status: 'applied',
    message: `Added ${Object.keys(desired).length} path aliases to tsconfig.json. Backup at tsconfig.json.bak.`,
    fileResult,
  };
}

/**
 * Strip // and /* * / comments from JSONC source. Conservative — preserves
 * strings (including ones containing // sequences). For tsconfig.json which
 * doesn't use multi-line strings, this is sufficient.
 */
function stripJsonComments(src: string): string {
  let out = '';
  let i = 0;
  let inString: string | null = null;
  while (i < src.length) {
    const ch = src[i]!;
    const next = src[i + 1];

    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += src[i + 1];
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }

    if (ch === '"') {
      inString = '"';
      out += ch;
      i++;
      continue;
    }

    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}
