# CLI Test Fixture — next-app-router-minimal

Minimal Next.js App Router project used for `@bleizlabs/ui` CLI integration tests.

## Structure

- `app/` — Next.js App Router with root layout + index page (no styles, no consumer-side wrappers — those land via `init`)
- `next.config.mjs` — barebones config (CLI patches add `transpilePackages` + `sassOptions.loadPaths`)
- `tsconfig.json` — strict TS config (CLI patches add path aliases)
- `package.json` — depends on local `@bleizlabs/ui` via `file:` link

## Usage

Tests run `init` against this fixture in a tmpdir copy. Validation:

1. Wrapper layer generated under `app/_components/ui/`
2. `tsc --noEmit` passes
3. `next build` succeeds
4. ESLint config patches valid

`node_modules` and `.next` are .gitignored — installed fresh in CI per run.
