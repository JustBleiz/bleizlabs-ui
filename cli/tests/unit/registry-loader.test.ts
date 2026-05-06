import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  loadManifest,
  loadLibPackage,
  countTotalNames,
  type ComponentManifest,
} from '../../src/lib/registry-loader.js';

describe('registry-loader', () => {
  let tmpRoot: string;
  let importMetaUrl: string;

  function buildManifest(
    overrides: Partial<ComponentManifest> = {},
  ): ComponentManifest {
    return {
      schemaVersion: '1',
      libVersion: '0.10.0',
      generatedAt: '2026-05-06T00:00:00.000Z',
      categories: { layout: ['Stack'] },
      components: [
        {
          family: 'Stack',
          category: 'layout',
          path: 'layout/Stack',
          exports: ['Stack'],
          types: ['StackProps'],
          hooks: [],
        },
      ],
      utilities: [],
      typesOnly: [],
      ...overrides,
    };
  }

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bz-cli-test-'));
    fs.mkdirSync(path.join(tmpRoot, 'cli-dist'), { recursive: true });
    fs.mkdirSync(path.join(tmpRoot, 'components'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, 'package.json'),
      JSON.stringify({ name: '@bleizlabs/ui', version: '0.10.0' }),
    );
    // import.meta.url-style URL pointing to a file in cli-dist.
    importMetaUrl = new URL(`file://${path.join(tmpRoot, 'cli-dist', 'bin.js')}`).href;
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('loads valid manifest', () => {
    fs.writeFileSync(
      path.join(tmpRoot, 'components', 'manifest.json'),
      JSON.stringify(buildManifest()),
    );
    const m = loadManifest(importMetaUrl);
    expect(m.libVersion).toBe('0.10.0');
    expect(m.components).toHaveLength(1);
    expect(m.components[0]!.family).toBe('Stack');
  });

  it('throws actionable error when manifest missing', () => {
    expect(() => loadManifest(importMetaUrl)).toThrow(
      /manifest not found/i,
    );
    expect(() => loadManifest(importMetaUrl)).toThrow(
      /predate v0\.10\.0/i,
    );
  });

  it('throws on invalid JSON', () => {
    fs.writeFileSync(
      path.join(tmpRoot, 'components', 'manifest.json'),
      'not valid json {',
    );
    expect(() => loadManifest(importMetaUrl)).toThrow(/not valid JSON/i);
  });

  it('throws on incompatible schema version', () => {
    fs.writeFileSync(
      path.join(tmpRoot, 'components', 'manifest.json'),
      JSON.stringify(buildManifest({ schemaVersion: '999' })),
    );
    expect(() => loadManifest(importMetaUrl)).toThrow(
      /Unsupported manifest schema version: 999/,
    );
  });

  it('throws on malformed shape (missing components array)', () => {
    fs.writeFileSync(
      path.join(tmpRoot, 'components', 'manifest.json'),
      JSON.stringify({ schemaVersion: '1', libVersion: '0.10.0', generatedAt: 'x' }),
    );
    expect(() => loadManifest(importMetaUrl)).toThrow(/invalid shape/i);
  });

  it('loads lib package.json', () => {
    const pkg = loadLibPackage(importMetaUrl);
    expect(pkg.name).toBe('@bleizlabs/ui');
    expect(pkg.version).toBe('0.10.0');
  });

  it('countTotalNames sums across components + utilities + typesOnly', () => {
    const m = buildManifest({
      components: [
        {
          family: 'Card',
          category: 'display',
          path: 'display/Card',
          exports: ['Card', 'CardHeader'],
          types: ['CardProps'],
          hooks: [],
        },
      ],
      utilities: [
        { family: 'cn', category: 'utils', path: 'utils/cn', exports: ['cn'], types: ['ClassValue'], hooks: [] },
      ],
      typesOnly: [
        { family: 'spacing', category: 'types', path: 'types/spacing', exports: [], types: ['SpaceIndex'], hooks: [] },
      ],
    });
    expect(countTotalNames(m)).toBe(3 + 2 + 1); // 6
  });
});
