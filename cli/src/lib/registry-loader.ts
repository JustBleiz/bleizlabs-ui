import fs from 'node:fs';
import path from 'node:path';
import { getLibPackageRoot } from './paths.js';

export interface ManifestFamily {
  family: string;
  category: string;
  path: string;
  exports: string[];
  types: string[];
  hooks: string[];
}

export interface ComponentManifest {
  schemaVersion: string;
  libVersion: string;
  generatedAt: string;
  categories: Record<string, string[]>;
  components: ManifestFamily[];
  utilities: ManifestFamily[];
  typesOnly: ManifestFamily[];
}

const SUPPORTED_SCHEMA_VERSION = '1';

/**
 * Load the lib's component manifest. Resolved relative to the lib package
 * root (cli-dist sibling), NOT consumer cwd. Throws with actionable error
 * messages on missing manifest or version mismatch.
 */
export function loadManifest(importMetaUrl: string): ComponentManifest {
  const libRoot = getLibPackageRoot(importMetaUrl);
  const manifestPath = path.join(libRoot, 'components', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Component manifest not found at ${manifestPath}.\n` +
        `Your installed @bleizlabs/ui version may predate v0.10.0 (which introduced the manifest).\n` +
        `Upgrade: npm install @bleizlabs/ui@latest`,
    );
  }

  let raw: string;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (e) {
    throw new Error(
      `Failed to read manifest at ${manifestPath}: ${(e as Error).message}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `Manifest at ${manifestPath} is not valid JSON: ${(e as Error).message}.\n` +
        `Reinstall @bleizlabs/ui to restore.`,
    );
  }

  if (!isManifest(parsed)) {
    throw new Error(
      `Manifest at ${manifestPath} has invalid shape. Expected schemaVersion="${SUPPORTED_SCHEMA_VERSION}".\n` +
        `Reinstall @bleizlabs/ui to restore.`,
    );
  }

  if (parsed.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported manifest schema version: ${parsed.schemaVersion} (CLI supports "${SUPPORTED_SCHEMA_VERSION}").\n` +
        `Upgrade CLI: npx @bleizlabs/ui@latest --version`,
    );
  }

  return parsed;
}

/**
 * Load lib's package.json to access version + name without re-reading manifest.
 */
export function loadLibPackage(importMetaUrl: string): { name: string; version: string } {
  const libRoot = getLibPackageRoot(importMetaUrl);
  const pkgPath = path.join(libRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`@bleizlabs/ui package.json not found at ${pkgPath}`);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as Record<string, unknown>;
  return {
    name: typeof pkg.name === 'string' ? pkg.name : '@bleizlabs/ui',
    version: typeof pkg.version === 'string' ? pkg.version : '0.0.0',
  };
}

function isManifest(v: unknown): v is ComponentManifest {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.schemaVersion === 'string' &&
    typeof m.libVersion === 'string' &&
    typeof m.generatedAt === 'string' &&
    Array.isArray(m.components) &&
    Array.isArray(m.utilities) &&
    Array.isArray(m.typesOnly) &&
    typeof m.categories === 'object' &&
    m.categories !== null
  );
}

/**
 * Total count of all exports across components + utilities + typesOnly.
 * Useful for status reporting.
 */
export function countTotalNames(manifest: ComponentManifest): number {
  const sum = (fams: ManifestFamily[]): number =>
    fams.reduce((n, f) => n + f.exports.length + f.types.length + f.hooks.length, 0);
  return (
    sum(manifest.components) + sum(manifest.utilities) + sum(manifest.typesOnly)
  );
}
