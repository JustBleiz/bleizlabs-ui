import type { ManifestFamily, ComponentManifest } from './registry-loader.js';

/**
 * Template module — all generated artifact templates as inline strings.
 *
 * Bundled with the CLI (not loaded from disk) so consumers don't depend on
 * file resolution magic at runtime. Substitution via `${...}` interpolation
 * — keep templates simple, single-pass.
 *
 * Marker convention:
 *   - TS / SCSS:  `// @bleizlabs/ui-generated v<libVersion> — safe to edit`
 *   - Markdown:   `<!-- BEGIN:bleizlabs-ui v<libVersion> -->` ... `<!-- END:bleizlabs-ui -->`
 */

const GENERATED_MARKER_TS = (libVersion: string): string =>
  `// @bleizlabs/ui-generated v${libVersion} — safe to edit`;

const GENERATED_MARKER_SCSS = GENERATED_MARKER_TS;

export const MARKER_REGEX_TS = /^\/\/\s*@bleizlabs\/ui-generated\s+v[\d.]+/m;
export const MARKER_BEGIN_MD = /<!--\s*BEGIN:bleizlabs-ui\s+v[\d.]+\s*-->/;
export const MARKER_END_MD = /<!--\s*END:bleizlabs-ui\s*-->/;

// ---------------------------------------------------------------------------
// Wrapper templates
// ---------------------------------------------------------------------------

/**
 * Generate `<Family>.tsx` wrapper file content. Pure re-export by default.
 *
 * Compound families (multiple `exports`) put all named exports in one
 * `export { ... }` block. Hooks listed alongside (use prefix already
 * categorised by manifest builder). Types listed in same block with
 * `type` keyword (TS verbatim-safe).
 */
export function renderWrapperTsx(family: ManifestFamily, libVersion: string): string {
  const valueExports = [...family.exports, ...family.hooks].map((n) => `  ${n},`);
  const typeExports = family.types.map((n) => `  type ${n},`);
  const allLines = [...valueExports, ...typeExports].join('\n');

  return `${GENERATED_MARKER_TS(libVersion)}
// Project wrapper for @bleizlabs/ui ${family.family}.
// Add project variants / styling by extending below; lib variants pass through.
export {
${allLines}
} from '@bleizlabs/ui';
`;
}

/**
 * Type-only families (e.g., SpaceIndex) need `export type { ... }` syntax —
 * exports[] is empty, types[] holds names.
 */
export function renderWrapperTsxTypeOnly(family: ManifestFamily, libVersion: string): string {
  const typeLines = family.types.map((n) => `  ${n},`).join('\n');
  return `${GENERATED_MARKER_TS(libVersion)}
// Project wrapper for @bleizlabs/ui ${family.family} (types only).
export type {
${typeLines}
} from '@bleizlabs/ui';
`;
}

/**
 * Empty placeholder SCSS — consumer fills when project styling needed.
 */
export function renderWrapperScss(family: ManifestFamily, libVersion: string): string {
  return `${GENERATED_MARKER_SCSS(libVersion)}
// Project styling slot for ${family.family} wrapper.
// Add project variant styles here; lib styling cascades from seed tokens.
//
// Example:
//   .cta {
//     background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
//     // ...
//   }
//
// Then in ${family.family}.tsx — extend lib variants:
//   import styles from './${family.family}.module.scss';
//   import { cn } from '@bleizlabs/ui';
//   if (variant === 'cta') return <Lib${family.family} {...rest} className={cn(styles.cta, className)} />;
`;
}

/**
 * `<Family>/index.ts` — barrel re-export of wrapper file.
 */
export function renderWrapperIndex(family: ManifestFamily, libVersion: string): string {
  return `${GENERATED_MARKER_TS(libVersion)}
export * from './${family.family}';
`;
}

// ---------------------------------------------------------------------------
// Root barrel
// ---------------------------------------------------------------------------

/**
 * `_components/ui/index.ts` — root barrel re-exporting every wrapper folder.
 */
export function renderRootBarrel(manifest: ComponentManifest): string {
  const lines: string[] = [];
  lines.push(GENERATED_MARKER_TS(manifest.libVersion));
  lines.push('// Project wrapper layer for @bleizlabs/ui.');
  lines.push('//');
  lines.push('// IMPORT FROM HERE (not from "@bleizlabs/ui" directly):');
  lines.push('//   import { Button, Card, Sidebar } from "@/components/ui";');
  lines.push('');
  lines.push('// --- Components (grouped by lib category for navigability) ---');
  // Sort by category, then by family name within category — produces stable,
  // human-readable barrel ordering grouped by lib taxonomy.
  const sortedComponents = [...manifest.components].sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    return cat !== 0 ? cat : a.family.localeCompare(b.family);
  });
  let currentCategory = '';
  for (const f of sortedComponents) {
    if (f.category !== currentCategory) {
      lines.push(`// ${f.category}`);
      currentCategory = f.category;
    }
    lines.push(`export * from './${f.category}/${f.family}';`);
  }
  if (manifest.utilities.length > 0) {
    lines.push('');
    lines.push('// --- Utilities ---');
    for (const f of [...manifest.utilities].sort((a, b) => a.family.localeCompare(b.family))) {
      lines.push(`export * from './${f.category}/${f.family}';`);
    }
  }
  if (manifest.typesOnly.length > 0) {
    lines.push('');
    lines.push('// --- Types ---');
    for (const f of [...manifest.typesOnly].sort((a, b) => a.family.localeCompare(b.family))) {
      lines.push(`export * from './${f.category}/${f.family}';`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// _components/ui/README.md
// ---------------------------------------------------------------------------

export function renderUiReadme(libVersion: string): string {
  return `# Project UI Wrapper Layer

Generated by \`npx @bleizlabs/ui init\` (lib v${libVersion}). Re-runs:
\`\`\`bash
npx @bleizlabs/ui add --new
\`\`\`

## Pattern

- **Lib \`@bleizlabs/ui\`** — fully-styled, tested, ARIA-compliant components
- **This layer (\`_components/ui/\`)** — thin re-exports + project variants gdy potrzeba
- **Pages** — import from \`@/components/ui/*\`, NEVER directly from \`@bleizlabs/ui\`

## When to add project styling

1. Lib variant doesn't exist for project look (e.g., need CTA gradient)
2. Pattern repeats 2+ places (Rule of Two — extract to \`_components/shared/\` molecule)
3. Project-specific decoration (brand glow, custom animation)

For each case: edit \`<Component>/<Component>.module.scss\` + extend \`<Component>.tsx\`.

## Brand customization

Single file: \`app/globals.scss\`. Override seeds via \`@use '@bleizlabs/ui/styles' with (...)\`. Cascades through entire token system.

## Anti-patterns

- ❌ Importing \`@bleizlabs/ui\` directly outside \`_components/ui/\` and \`_components/shared/\` (ESLint enforces)
- ❌ Overriding lib styles via \`:global(.lib-class)\` in page SCSS
- ❌ Hand-rolling components that lib provides
- ❌ Hardcoded hex/px values — use \`var(--color-*)\` / \`var(--space-*)\`
`;
}

// ---------------------------------------------------------------------------
// Styles templates
// ---------------------------------------------------------------------------

export function renderGlobalsScss(libVersion: string): string {
  return `// BleizLabs project styles entry — generated by @bleizlabs/ui init v${libVersion}.
// Override seeds via \`with (...)\` parameters below.
//
// Available seeds (see node_modules/@bleizlabs/ui/styles/_project-settings.scss
// for the canonical list + defaults):
//   $seed-mode: dark | light
//   $seed-brand:    primary brand color (hex)
//   $seed-accent:   secondary highlight color (hex)
//   $seed-neutral:  neutral base (hex; warm-slate atelier feel)
//   $seed-error:    error / destructive color (hex)
//   $seed-radius-md, $seed-radius-lg, ...
//   $seed-space-unit (default 4px — Tailwind 4px scale)
//   $seed-font-primary, $seed-font-secondary

@use '@bleizlabs/ui/styles' with (
  $seed-mode: dark
  // Uncomment + customize per project brand:
  // ,$seed-brand:   #4eb1a3
  // ,$seed-accent:  #d7bba6
  // ,$seed-neutral: #3a4350
  // ,$seed-error:   #e63946
);

@use './_styles/theme';
@use './_styles/overrides';

// Project-level :root tokens / global resets below.
:root {
  color-scheme: dark light;
}
`;
}

export function renderStylesTheme(libVersion: string): string {
  return `// Project theme overrides — generated by @bleizlabs/ui init v${libVersion}.
// Add project-specific :root token overrides here (gradients, durations,
// custom semantic aliases). Empty by default.
//
// Example:
//   :root {
//     --gradient-cta: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
//   }
`;
}

export function renderStylesOverrides(libVersion: string): string {
  return `// Project last-layer overrides — generated by @bleizlabs/ui init v${libVersion}.
// Last-resort escape hatch for CSS var overrides that cannot live in seeds.
// Use sparingly — prefer seed customization or theme.scss.
`;
}

// ---------------------------------------------------------------------------
// Agent instructions
// ---------------------------------------------------------------------------

export function renderAgentsManagedBlock(libVersion: string): string {
  return `<!-- BEGIN:bleizlabs-ui v${libVersion} -->
<!-- DO NOT EDIT between BEGIN:/END: markers — managed by \`npx @bleizlabs/ui init\` -->
<!-- Project-specific agent rules go OUTSIDE these markers -->

# @bleizlabs/ui — Agent Working Rules

## TL;DR

- \`@bleizlabs/ui\` is a **fully-styled, tested, ARIA-compliant** component library
- Project wrapper layer in \`_components/ui/\` — **IMPORT FROM HERE**
- Brand customization in \`app/globals.scss\` (seed overrides)
- **NEVER** import directly from \`@bleizlabs/ui\` outside \`_components/ui/\` and \`_components/shared/\`
- **NEVER** override lib styles via \`:global()\` in page SCSS
- **NEVER** hand-roll components that lib already provides

## Lib reference (read on demand)

The lib ships its own agent docs inside the npm tarball — useful when this consumer-level guide doesn't cover the decision (per-domain quick-starts, SSR/RSC mapping, troubleshooting, full component inventory):

- **Entry point** (~80 LOC: mission + Q1-Q5 decision tree + top-10 anti-patterns + pointers):
  - \`node_modules/@bleizlabs/ui/AGENTS.md\`
- **Deep reference** (~750 LOC: 9 per-domain quick-starts, SSR/RSC mapping, troubleshooting, full inventory):
  - \`node_modules/@bleizlabs/ui/docs/AGENT-USAGE.md\`
- **Per-component API + ARIA contract + tokens**:
  - \`node_modules/@bleizlabs/ui/components/<category>/<Name>/<Name>.tsx\` JSDoc

Both lib docs carry a \`**Valid for:** @bleizlabs/ui <version>\` header — compare against \`npm view @bleizlabs/ui version\` if anything looks stale after upgrades. \`node_modules/\` is NOT auto-scanned by your agent; you Read explicitly via the full paths above.

## Workflow before adding ANY UI element

1. **Check \`_components/ui/\`** — does wrapper exist? If yes → import + use.
2. **Check \`_components/shared/\`** — does project molecule exist? If yes → use.
3. **Compose existing wrappers in page JSX** — most patterns are combinations of \`<Card>\` + \`<Button>\` + \`<Heading>\`.
4. **Pattern repeats 2+ times** → extract to \`_components/shared/<Name>/\` (Rule of Two — molecule wraps wrappers, owns project styling).
5. **Need new variant on lib component** → extend wrapper in \`_components/ui/<Name>/<Name>.module.scss\` + \`<Name>.tsx\`.
6. **Component without wrapper** (lib added a new component) → run \`npx @bleizlabs/ui add <name>\`.

## Hard rules (CI-enforced)

- **ESLint \`no-restricted-imports\`** blocks \`@bleizlabs/ui\` import outside \`_components/ui/\` and \`_components/shared/\`
- After any lib upgrade: **\`npx @bleizlabs/ui add --new\`** to scaffold wrappers for new components

## When to add project styling — decision table

| Situation | Decision |
|---|---|
| Lib variant doesn't match project look | ✅ Add variant in wrapper SCSS |
| Pattern repeats 2+ places | ✅ Extract shared molecule |
| "Looks better with different padding" | ❌ Adjust seed in \`globals.scss\` (cascade), NOT per-page override |
| One-off page decoration | ❌ Try harder with lib defaults; if truly unique → minimal page-local SCSS |
| "Need CTA-style gradient on Button" | ✅ Variant in wrapper Button |

## Brand customization — single file

\`app/globals.scss\`:

\`\`\`scss
@use '@bleizlabs/ui/styles' with (
  $seed-mode: dark,
  $seed-brand: #YOUR_BRAND,
  $seed-accent: #YOUR_ACCENT
);
\`\`\`

Cascades through \`--color-brand-*\` (50-900 scale), \`--radius-*\`, \`--space-*\` automatically. **Don't override per-component variables — use seeds.**

## Anti-patterns (DON'T)

- ❌ \`import { Button } from '@bleizlabs/ui'\` in pages (use \`from '@/components/ui'\`)
- ❌ \`import { Button } from '@bleizlabs/ui/components/interactive/Button'\` (deep import same problem)
- ❌ \`.myButton :global(.button) { padding: ... }\` in page SCSS (use wrapper variant)
- ❌ \`.myCard { background: rgba(...) !important }\` (extend Card wrapper variant)
- ❌ Local \`<MyButton>\` component mirroring lib \`<Button>\` (use wrapper)
- ❌ Hardcoded hex/px values in \`.module.scss\` — use \`var(--color-*)\` / \`var(--space-*)\`
- ❌ Adding \`tailwind\`, \`bootstrap\`, \`@mui/...\` dependencies (lib is the design system)

## References

- **Project wrapper docs:** \`_components/ui/README.md\`
- **Project component inventory:** \`docs/component-inventory.md\`
- **Lib README:** \`node_modules/@bleizlabs/ui/README.md\`
- **Lib component registry:** \`node_modules/@bleizlabs/ui/COMPONENT_REGISTRY.md\`
- **GitHub:** https://github.com/BleizLabs/bleizlabs-ui
- **CLI commands:** \`npx @bleizlabs/ui --help\`

## Re-bootstrap / sync after lib upgrade

\`\`\`bash
npm install @bleizlabs/ui@latest
npx @bleizlabs/ui add --new
\`\`\`

<!-- END:bleizlabs-ui -->`;
}

export function renderClaudeManagedBlock(libVersion: string): string {
  return `<!-- BEGIN:bleizlabs-ui v${libVersion} -->
<!-- DO NOT EDIT between BEGIN:/END: markers — managed by \`npx @bleizlabs/ui init\` -->

@AGENTS.md

## Claude Code specific

- **Component lookup:** \`Glob\` \`_components/ui/**/*.tsx\` — single pass shows project surface
- **When user says "use bleizlabs-ui Button"** — interpret as import from \`@/components/ui\`, not from lib directly
- **Wrapper extension:** edit \`_components/ui/<Name>/<Name>.tsx\` + \`.module.scss\`, run \`tsc --noEmit\` after each change
- **Brand seed change:** edit \`app/globals.scss\` \`with (...)\` block, restart dev server (SCSS recompile)
- **Lib upgrade:** \`npm i @bleizlabs/ui@latest && npx @bleizlabs/ui add --new\`
- **Inventory regen:** lib has \`scripts/generate-component-inventory.js\` — re-run after structural changes

<!-- END:bleizlabs-ui -->`;
}

// ---------------------------------------------------------------------------
// Component inventory
// ---------------------------------------------------------------------------

export function renderComponentInventory(libVersion: string): string {
  return `# Project Component Inventory

Tracks project-local components (\`_components/ui/\`, \`_components/shared/\`, page-local).
Re-run \`apps/web/scripts/generate-component-inventory.js\` after structural changes.

## Wrapper layer (\`_components/ui/\`)

Generated by \`npx @bleizlabs/ui init\` (lib v${libVersion}). Pure re-exports of \`@bleizlabs/ui\`. Add project variants by extending wrapper SCSS + TSX.

See \`_components/ui/README.md\` for usage pattern.

## Shared molecules (\`_components/shared/\`)

> Add entries here as project molecules emerge from Rule of Two extractions.

| Path | Layer | Consumer count | Description |
|---|---|---|---|
| _(empty)_ |  |  |  |

## Page-local components

> Add entries here as page-specific components are introduced. Pattern: \`<route>/_components/<Name>/\`.

| Path | Layer | Consumer count | Description |
|---|---|---|---|
| _(empty)_ |  |  |  |
`;
}

// ---------------------------------------------------------------------------
// ESLint snippets
// ---------------------------------------------------------------------------

/**
 * ESLint flat config (eslint.config.{js,mjs,ts}) — return a JS array literal.
 * The CLI appends this to the existing config.
 */
export function renderEslintFlatSnippet(): string {
  return `  // @bleizlabs/ui-generated — wrapper layer enforcement.
  // Forbid direct '@bleizlabs/ui' imports outside the project wrapper layer.
  // Update via \`npx @bleizlabs/ui init\` re-run.
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@bleizlabs/ui', '@bleizlabs/ui/components/*'],
          message: 'Import via @/components/ui/* (project wrapper layer). See _components/ui/README.md.',
        }],
      }],
    },
  },
  {
    files: ['**/_components/ui/**', '**/_components/shared/**'],
    rules: { 'no-restricted-imports': 'off' },
  },`;
}

/**
 * ESLint legacy config (.eslintrc.{json,js,cjs}) — return JSON snippet to merge.
 */
export function renderEslintLegacySnippet(): Record<string, unknown> {
  return {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@bleizlabs/ui', '@bleizlabs/ui/components/*'],
              message:
                'Import via @/components/ui/* (project wrapper layer). See _components/ui/README.md.',
            },
          ],
        },
      ],
    },
    overrides: [
      {
        files: ['**/_components/ui/**', '**/_components/shared/**'],
        rules: { 'no-restricted-imports': 'off' },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// next.config patch (text-based — patches the export object)
// ---------------------------------------------------------------------------

export const NEXT_CONFIG_PATCH_MARKER = '// @bleizlabs/ui — added by init';

export function renderNextConfigSnippet(): string {
  return `${NEXT_CONFIG_PATCH_MARKER}
// transpilePackages — ensures @bleizlabs/ui SCSS/JSX compiles via Next.
// sassOptions.loadPaths — resolves @use '@bleizlabs/ui/styles' from node_modules.
// If you already define these keys, merge manually instead of running init again.`;
}
