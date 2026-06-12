# HoverCard — keyboard interaction spec

**Execution status:** EXECUTED in-repo — the canonical suite lives in the sibling
`HoverCard.keyboard.spec.ts` (CI-gated; status in HoverCard.tsx `@tested`; only the manual NVDA
sweep stays deferred). This file is a consumer-CI reference snapshot, not the source of truth.
**Format:** markdown code-fenced Playwright pseudo-code — bypasses ESLint/tsconfig.

## Setup

- Page: `/components/hover-card` playground
- Default trigger: `<a href="/profile/acme">@acme</a>` with HoverCard `title="Acme Corp"` + avatar + bio
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (modeless modifier)

## Tests

```ts
test('HC-R03 — focus on trigger opens instantly (WCAG SC 2.1.1 keyboard parity)', async ({
  page,
}) => {
  await page.goto('/components/hover-card');
  await page.keyboard.press('Tab'); // focus first trigger
  // Focus path bypasses openDelay — content appears immediately
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('HC-R05 — Escape closes without losing trigger focus (WCAG SC 1.4.13 dismissable)', async ({
  page,
}) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.focus();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  // Focus remains on trigger after Escape dismiss
  await expect(trigger).toBeFocused();
});
```
