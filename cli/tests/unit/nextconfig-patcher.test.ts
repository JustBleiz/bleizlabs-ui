import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { patchNextConfig } from '../../src/lib/nextconfig-patcher.js';
import type { ProjectInfo } from '../../src/lib/project-detector.js';

let tmpDir: string;

function makeProjectInfo(configFile: string, format: 'cjs' | 'mjs' | 'ts' = 'ts'): ProjectInfo {
  const fullPath = path.join(tmpDir, configFile);
  return {
    appDir: tmpDir,
    appDirRelative: '.',
    appFolderType: 'app',
    isSrcDir: false,
    nextConfigPath: fullPath,
    nextConfigFormat: format,
    packageManager: 'npm',
    typescript: format === 'ts',
    eslintConfigPath: null,
    eslintConfigFormat: null,
    tsconfigPath: null,
  } as unknown as ProjectInfo;
}

function writeConfig(name: string, content: string): string {
  const p = path.join(tmpDir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('patchNextConfig', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nextconfig-patcher-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('REGRESSION v0.10.2: handles fresh create-next-app TS config with /* config options here */ comment without inserting stray comma', () => {
    const original = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;
    const configPath = writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');

    const result = patchNextConfig(info);
    expect(result.status).toBe('applied');

    const patched = fs.readFileSync(configPath, 'utf8');

    // Critical: NO stray comma after */
    expect(patched).not.toMatch(/\/\*\s*config options here\s*\*\/,/);
    // Patch should be present
    expect(patched).toContain('transpilePackages');
    expect(patched).toContain("['@bleizlabs/ui']");
    expect(patched).toContain('sassOptions');
    // Build test: patched output should be parseable JS-shaped
    // Confirm braces balance
    const opens = (patched.match(/\{/g) ?? []).length;
    const closes = (patched.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  it('handles empty object literal {} without inserting leading comma', () => {
    const original = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`;
    writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');
    const result = patchNextConfig(info);

    if (result.status === 'applied') {
      const patched = fs.readFileSync(path.join(tmpDir, 'next.config.ts'), 'utf8');
      // Should not start the body with a comma
      expect(patched).not.toMatch(/\{\s*,/);
      expect(patched).not.toMatch(/\{,/);
    }
    // 'manual-required' is also acceptable for tightly-formatted empty objects
  });

  it('inserts trailing comma when last property has none', () => {
    const original = `const nextConfig = {
  reactStrictMode: true
};
export default nextConfig;
`;
    writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');
    const result = patchNextConfig(info);
    expect(result.status).toBe('applied');

    const patched = fs.readFileSync(path.join(tmpDir, 'next.config.ts'), 'utf8');
    // Should have comma between reactStrictMode value and our patch
    expect(patched).toMatch(/reactStrictMode:\s*true,/);
    expect(patched).toContain('transpilePackages');
  });

  it('does not double-insert comma when last property already has one', () => {
    const original = `const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
`;
    writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');
    const result = patchNextConfig(info);
    expect(result.status).toBe('applied');

    const patched = fs.readFileSync(path.join(tmpDir, 'next.config.ts'), 'utf8');
    // Should not have double comma
    expect(patched).not.toMatch(/,\s*,/);
    expect(patched).toContain('transpilePackages');
  });

  it('is idempotent — second patch is no-op when marker present', () => {
    const original = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;
    writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');

    const first = patchNextConfig(info);
    expect(first.status).toBe('applied');

    const second = patchNextConfig(info);
    expect(second.status).toBe('already-patched');
  });

  it('returns manual-required when transpilePackages already declared', () => {
    const original = `const nextConfig = {
  transpilePackages: ['some-other'],
};
export default nextConfig;
`;
    writeConfig('next.config.ts', original);
    const info = makeProjectInfo('next.config.ts', 'ts');
    const result = patchNextConfig(info);
    expect(result.status).toBe('manual-required');
  });
});
