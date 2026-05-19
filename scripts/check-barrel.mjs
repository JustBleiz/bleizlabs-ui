#!/usr/bin/env node
/**
 * Publish-preflight smoke test — verifies `components/index.ts` re-exports
 * every `components/<category>/<Name>/index.{ts,tsx}` folder.
 *
 * Addresses the gap identified in E140 audit: `next build` + `tsc --noEmit`
 * validate the playground, which imports components individually — they do
 * NOT exercise the published package root. A new component could ship with
 * a per-folder index but be missing from the barrel, and consumers would
 * `import { Foo } from '@bleizlabs/ui'` to `undefined`.
 *
 * Exits non-zero when any folder-with-index is missing from the barrel.
 * Skips `utils/` and `types/` subfolders — those are re-exported explicitly
 * by name, not with `export * from`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const BARREL = path.join(COMPONENTS_DIR, 'index.ts');

if (!fs.existsSync(BARREL)) {
  console.error(`[check-barrel] missing ${BARREL}`);
  process.exit(1);
}

const barrel = fs.readFileSync(BARREL, 'utf8');
const missing = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);

    // utils/ and types/ are re-exported by explicit names (Slot, cn, etc.),
    // not by `export * from`. Skip barrel-completeness check for them.
    const relFromComponents = path.relative(COMPONENTS_DIR, full).replace(/\\/g, '/');
    if (relFromComponents.startsWith('utils') || relFromComponents.startsWith('types')) {
      continue;
    }

    const hasIndex =
      fs.existsSync(path.join(full, 'index.ts')) || fs.existsSync(path.join(full, 'index.tsx'));

    if (hasIndex) {
      const expected = `./${relFromComponents}`;
      // Barrel re-exports with `export * from './category/Name'` (no trailing
      // slash, no extension). Match the string presence.
      if (!barrel.includes(`'${expected}'`) && !barrel.includes(`"${expected}"`)) {
        missing.push(expected);
      }
    } else {
      walk(full);
    }
  }
}

walk(COMPONENTS_DIR);

if (missing.length > 0) {
  console.error(
    `[check-barrel] FAIL — ${missing.length} component folder(s) not re-exported from components/index.ts:`,
  );
  for (const m of missing) console.error(`  - ${m}`);
  console.error(
    `\nAdd \`export * from '${missing[0]}';\` to components/index.ts for each missing folder.`,
  );
  process.exit(1);
}

console.log(
  `[check-barrel] OK — every component folder with an index is re-exported from the barrel.`,
);
