/**
 * SpaceIndex — allowed indexes from the spacing scale (D9, Tailwind-style 4px unit).
 *
 * Maps 1:1 to the `--space-{n}` CSS custom properties emitted by `_semantics.scss`.
 * Index × 4 = pixels (e.g. 4 → 16px, 10 → 40px). Indexes 9, 11, 13, 15, 17, 18, 19
 * are intentionally absent — the scale jumps to keep visual rhythm coherent.
 *
 * Used by every layout/spacing prop in bleizlabs-ui (Stack gap, Inline gap,
 * Container padding, Section py, Card padding, etc.) so that "12" cannot be
 * accidentally passed where the token doesn't exist.
 */
export type SpaceIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 14 | 16 | 20;
