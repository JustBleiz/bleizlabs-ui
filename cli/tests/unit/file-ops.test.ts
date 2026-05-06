import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  writeFileIdempotent,
  updateManagedBlock,
  cleanupOrphanedTmp,
} from '../../src/lib/file-ops.js';

describe('file-ops', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bz-fileops-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  describe('writeFileIdempotent', () => {
    it('creates file when missing', () => {
      const p = path.join(tmp, 'nested', 'deep', 'a.txt');
      const r = writeFileIdempotent(p, 'hello');
      expect(r.action).toBe('created');
      expect(fs.readFileSync(p, 'utf8')).toBe('hello');
    });

    it('skips user-modified file (no marker)', () => {
      const p = path.join(tmp, 'a.tsx');
      fs.writeFileSync(p, '// user content\nexport const X = 1;');
      const r = writeFileIdempotent(p, '// new content', 'overwrite-if-marker');
      expect(r.action).toBe('skipped');
      expect(r.reason).toMatch(/marker/);
      expect(fs.readFileSync(p, 'utf8')).toContain('user content');
    });

    it('overwrites file with @bleizlabs/ui-generated marker', () => {
      const p = path.join(tmp, 'a.tsx');
      fs.writeFileSync(p, '// @bleizlabs/ui-generated v0.10.0 — safe to edit\nexport const X = 1;');
      const r = writeFileIdempotent(
        p,
        '// @bleizlabs/ui-generated v0.10.0 — safe to edit\nexport const X = 2;',
        'overwrite-if-marker',
      );
      expect(r.action).toBe('backed-up-and-overwritten');
      expect(fs.readFileSync(p, 'utf8')).toContain('X = 2');
      expect(fs.existsSync(p + '.bak')).toBe(true);
    });

    it('skip-if-exists mode preserves original content', () => {
      const p = path.join(tmp, 'a.tsx');
      fs.writeFileSync(p, 'original');
      const r = writeFileIdempotent(p, 'new', 'skip-if-exists');
      expect(r.action).toBe('skipped');
      expect(fs.readFileSync(p, 'utf8')).toBe('original');
    });

    it('marker check is version-agnostic (matches v0.9.0 OR v0.10.0)', () => {
      const p = path.join(tmp, 'a.tsx');
      fs.writeFileSync(p, '// @bleizlabs/ui-generated v0.9.0 — safe to edit\nold');
      const r = writeFileIdempotent(
        p,
        '// @bleizlabs/ui-generated v0.10.0 — safe to edit\nnew',
        'overwrite-if-marker',
      );
      expect(r.action).toBe('backed-up-and-overwritten');
    });
  });

  describe('updateManagedBlock', () => {
    it('creates file with full block when missing', () => {
      const p = path.join(tmp, 'AGENTS.md');
      const block = '<!-- BEGIN:bleizlabs-ui v0.10.0 -->\nrules\n<!-- END:bleizlabs-ui -->';
      const r = updateManagedBlock(p, block);
      expect(r.action).toBe('created');
      expect(fs.readFileSync(p, 'utf8')).toContain(block);
    });

    it('replaces block content while preserving outside content', () => {
      const p = path.join(tmp, 'AGENTS.md');
      fs.writeFileSync(
        p,
        '# User content\n\nMy rules\n\n<!-- BEGIN:bleizlabs-ui v0.9.0 -->\nold\n<!-- END:bleizlabs-ui -->\n\n## More user content',
      );
      const newBlock =
        '<!-- BEGIN:bleizlabs-ui v0.10.0 -->\nnew rules\n<!-- END:bleizlabs-ui -->';
      const r = updateManagedBlock(p, newBlock);
      expect(r.action).toBe('backed-up-and-overwritten');
      const out = fs.readFileSync(p, 'utf8');
      expect(out).toContain('# User content');
      expect(out).toContain('My rules');
      expect(out).toContain('## More user content');
      expect(out).toContain('new rules');
      expect(out).not.toContain('old');
      expect(fs.existsSync(p + '.bak')).toBe(true);
    });

    it('appends managed block to file without markers', () => {
      const p = path.join(tmp, 'AGENTS.md');
      fs.writeFileSync(p, '# Existing content\n\nNo markers here.');
      const block = '<!-- BEGIN:bleizlabs-ui v0.10.0 -->\nblock\n<!-- END:bleizlabs-ui -->';
      const r = updateManagedBlock(p, block);
      expect(r.action).toBe('backed-up-and-overwritten');
      const out = fs.readFileSync(p, 'utf8');
      expect(out).toContain('# Existing content');
      expect(out).toContain('block');
    });
  });

  describe('cleanupOrphanedTmp', () => {
    it('removes .tmp-<digits> files recursively', () => {
      const sub = path.join(tmp, 'sub');
      fs.mkdirSync(sub);
      fs.writeFileSync(path.join(tmp, 'a.tmp-12345'), 'orphan');
      fs.writeFileSync(path.join(sub, 'b.tmp-67890'), 'orphan');
      fs.writeFileSync(path.join(tmp, 'real-file.txt'), 'keep');
      const removed = cleanupOrphanedTmp(tmp);
      expect(removed).toBe(2);
      expect(fs.existsSync(path.join(tmp, 'a.tmp-12345'))).toBe(false);
      expect(fs.existsSync(path.join(sub, 'b.tmp-67890'))).toBe(false);
      expect(fs.existsSync(path.join(tmp, 'real-file.txt'))).toBe(true);
    });

    it('returns 0 for missing directory', () => {
      expect(cleanupOrphanedTmp(path.join(tmp, 'does-not-exist'))).toBe(0);
    });
  });
});
