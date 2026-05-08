## Summary

<!-- 1-3 bullets: what changed, why -->

## Release checklist

**Feature/fix PRs that ship to consumers MUST include a version bump in the same PR.** Auto-publish is triggered by `package.json` version change on `main` — a PR without a bump is a no-op release.

- [ ] `npm version <major|minor|patch>` run in `dev/` and committed (or N/A — see below)
- [ ] Version chosen per semver:
  - `patch` — bug fix, non-breaking
  - `minor` — additive feature, non-breaking
  - `major` — BREAKING change (props removed, behavior change)
- [ ] `CHANGELOG.md` entry added under the new version (if maintained)
- [ ] OR mark as **release-noop** below

### N/A — no version bump (release-noop)

Pick one if intentional, otherwise the PR ships nothing:

- [ ] Docs only (CLAUDE.md, README, AGENTS.md, COMPONENT_REGISTRY.md) — no consumer impact
- [ ] CI / tooling only (`.github/workflows/`, scripts, tsconfig) — no shipped code change
- [ ] Tests only — no consumer impact
- [ ] Internal refactor with explicit "ship in next feature PR" plan

## Test plan

<!-- Bulleted checklist of what was verified -->
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npx next build`
- [ ] Component-specific Playwright (or DEFERRED-WITH-EXCEPTION reference)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
