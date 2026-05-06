import { defineConfig } from 'tsup';

// CLI bundle config.
//
// Produces a single self-contained cli-dist/bin.js ESM file consumable
// via "npx bleizlabs-ui ...". All deps inlined via noExternal regex so
// lib runtime stays zero-dep (D5/D25) — consumers don't pay install tax
// for CLI runtime deps.
//
// Shebang injected via banner option (avoids esbuild parsing issues with
// shebang inside source files).
export default defineConfig({
  entry: { bin: 'cli/src/bin.ts' },
  outDir: 'cli-dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  bundle: true,
  noExternal: [/.*/],
  splitting: false,
  treeshake: true,
  minify: false,
  sourcemap: false,
  clean: true,
  dts: false,
  shims: false,
  // Inject shebang + ESM-compatible `require` so bundled CJS deps
  // (e.g., commander) that use require() at runtime resolve correctly.
  banner: {
    js: [
      '#!/usr/bin/env node',
      "import { createRequire as __createRequire } from 'node:module';",
      'const require = __createRequire(import.meta.url);',
    ].join('\n'),
  },
  esbuildOptions(options) {
    options.legalComments = 'none';
  },
});
