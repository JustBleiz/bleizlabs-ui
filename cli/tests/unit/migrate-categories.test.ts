import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  detectFlatLayout,
  migrateFlatToCategory,
  autoMigrate,
} from '../../src/lib/migrate-categories.js';
import type { ComponentManifest, ManifestFamily } from '../../src/lib/registry-loader.js';

const buttonFamily: ManifestFamily = {
  family: 'Button',
  category: 'interactive',
  path: 'interactive/Button',
  exports: ['Button'],
  types: ['ButtonProps'],
  hooks: [],
};

const cardFamily: ManifestFamily = {
  family: 'Card',
  category: 'display',
  path: 'display/Card',
  exports: ['Card', 'CardHeader'],
  types: ['CardProps'],
  hooks: [],
};

const stackFamily: ManifestFamily = {
  family: 'Stack',
  category: 'layout',
  path: 'layout/Stack',
  exports: ['Stack'],
  types: ['StackProps'],
  hooks: [],
};

function makeManifest(...families: ManifestFamily[]): ComponentManifest {
  return {
    schemaVersion: '1',
    libVersion: '0.11.0',
    generatedAt: '2026-05-06T00:00:00.000Z',
    categories: {},
    components: families,
    utilities: [],
    typesOnly: [],
  };
}

const GENERATED_TSX = (family: string): string =>
  `// @bleizlabs/ui-generated v0.10.2 — safe to edit\n` +
  `export { ${family} } from '@bleizlabs/ui';\n`;

const USER_AUTHORED_TSX = (family: string): string =>
  `// hand-written, no marker\nexport { ${family} } from '@bleizlabs/ui';\n`;

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bz-migrate-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function writeFlatFamily(family: string, content: string): string {
  const dir = path.join(tmpRoot, family);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${family}.tsx`), content);
  fs.writeFileSync(path.join(dir, 'index.ts'), `export * from './${family}';\n`);
  return dir;
}

function writeNestedFamily(category: string, family: string, content: string): string {
  const dir = path.join(tmpRoot, category, family);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${family}.tsx`), content);
  fs.writeFileSync(path.join(dir, 'index.ts'), `export * from './${family}';\n`);
  return dir;
}

describe('migrate-categories', () => {
  describe('detectFlatLayout', () => {
    it('returns empty plan when targetDir does not exist', () => {
      const plan = detectFlatLayout(makeManifest(buttonFamily), path.join(tmpRoot, 'missing'));
      expect(plan.migrated).toEqual([]);
      expect(plan.conflicts).toEqual([]);
      expect(plan.unmarked).toEqual([]);
    });

    it('queues flat families with generated marker for migration', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));
      writeFlatFamily('Card', GENERATED_TSX('Card'));

      const plan = detectFlatLayout(makeManifest(buttonFamily, cardFamily), tmpRoot);

      expect(plan.migrated).toHaveLength(2);
      expect(plan.migrated.map((m) => m.family).sort()).toEqual(['Button', 'Card']);
      const buttonEntry = plan.migrated.find((m) => m.family === 'Button')!;
      expect(buttonEntry.from).toBe(path.join(tmpRoot, 'Button'));
      expect(buttonEntry.to).toBe(path.join(tmpRoot, 'interactive', 'Button'));
    });

    it('skips folders without generated marker (user-authored)', () => {
      writeFlatFamily('Button', USER_AUTHORED_TSX('Button'));

      const plan = detectFlatLayout(makeManifest(buttonFamily), tmpRoot);

      expect(plan.migrated).toEqual([]);
      expect(plan.unmarked).toHaveLength(1);
      expect(plan.unmarked[0]?.family).toBe('Button');
    });

    it('flags conflict when both flat and nested paths exist', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));
      writeNestedFamily('interactive', 'Button', GENERATED_TSX('Button'));

      const plan = detectFlatLayout(makeManifest(buttonFamily), tmpRoot);

      expect(plan.migrated).toEqual([]);
      expect(plan.conflicts).toHaveLength(1);
      expect(plan.conflicts[0]?.family).toBe('Button');
    });

    it('ignores nested-only families (already migrated)', () => {
      writeNestedFamily('interactive', 'Button', GENERATED_TSX('Button'));

      const plan = detectFlatLayout(makeManifest(buttonFamily), tmpRoot);

      expect(plan.migrated).toEqual([]);
      expect(plan.conflicts).toEqual([]);
      expect(plan.unmarked).toEqual([]);
    });

    it('skips families whose flat path is not a directory', () => {
      // Create a stray file at flat path instead of a directory
      fs.writeFileSync(path.join(tmpRoot, 'Button'), 'random');

      const plan = detectFlatLayout(makeManifest(buttonFamily), tmpRoot);

      expect(plan.migrated).toEqual([]);
    });
  });

  describe('migrateFlatToCategory', () => {
    it('moves migrated entries to nested paths', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));
      writeFlatFamily('Stack', GENERATED_TSX('Stack'));

      const plan = detectFlatLayout(makeManifest(buttonFamily, stackFamily), tmpRoot);
      migrateFlatToCategory(plan);

      // Old flat paths gone
      expect(fs.existsSync(path.join(tmpRoot, 'Button'))).toBe(false);
      expect(fs.existsSync(path.join(tmpRoot, 'Stack'))).toBe(false);

      // New nested paths exist with content preserved
      expect(fs.existsSync(path.join(tmpRoot, 'interactive', 'Button', 'Button.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(tmpRoot, 'layout', 'Stack', 'Stack.tsx'))).toBe(true);
      expect(
        fs.readFileSync(path.join(tmpRoot, 'interactive', 'Button', 'Button.tsx'), 'utf8'),
      ).toContain('Button');
    });

    it('preserves all files inside the migrated folder', () => {
      const dir = writeFlatFamily('Card', GENERATED_TSX('Card'));
      // Add a user-authored variant SCSS file inside the folder
      fs.writeFileSync(path.join(dir, 'Card.module.scss'), '.gradient { color: red; }\n');

      const plan = detectFlatLayout(makeManifest(cardFamily), tmpRoot);
      migrateFlatToCategory(plan);

      expect(
        fs.readFileSync(path.join(tmpRoot, 'display', 'Card', 'Card.module.scss'), 'utf8'),
      ).toContain('gradient');
    });

    it('does not touch conflicted families (both paths exist)', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));
      writeNestedFamily('interactive', 'Button', GENERATED_TSX('Button'));

      const plan = detectFlatLayout(makeManifest(buttonFamily), tmpRoot);
      migrateFlatToCategory(plan);

      // Both still present
      expect(fs.existsSync(path.join(tmpRoot, 'Button'))).toBe(true);
      expect(fs.existsSync(path.join(tmpRoot, 'interactive', 'Button'))).toBe(true);
    });
  });

  describe('autoMigrate (one-shot)', () => {
    it('runs detect + migrate in one call and reports the plan', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));

      const plan = autoMigrate(makeManifest(buttonFamily), tmpRoot);

      expect(plan.migrated).toHaveLength(1);
      expect(fs.existsSync(path.join(tmpRoot, 'interactive', 'Button'))).toBe(true);
      expect(fs.existsSync(path.join(tmpRoot, 'Button'))).toBe(false);
    });

    it('is idempotent — second run finds nothing to migrate', () => {
      writeFlatFamily('Button', GENERATED_TSX('Button'));

      autoMigrate(makeManifest(buttonFamily), tmpRoot);
      const plan2 = autoMigrate(makeManifest(buttonFamily), tmpRoot);

      expect(plan2.migrated).toEqual([]);
    });
  });
});
