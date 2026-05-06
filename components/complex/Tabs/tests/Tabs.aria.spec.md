# Tabs — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/tabs` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

## Tests

```ts
test('TB-R06 — orientation affects keyboard navigation only, not visual layout', async ({ page }) => {
  await page.goto('/components/tabs?orientation=vertical');
  const tablist = page.getByRole('tablist');
  // aria-orientation reflects prop
  expect(await tablist.getAttribute('aria-orientation')).toBe('vertical');
  // Keyboard uses Up/Down (verified in TB-R13); visual layout delegated to CSS
});

test('TB-R16 — aria-labelledby/aria-controls IDs auto-generated via useId', async ({ page }) => {
  await page.goto('/components/tabs');
  const overview = page.getByRole('tab', { name: 'Overview' });
  const overviewId = await overview.getAttribute('id');
  expect(overviewId).toMatch(/trigger-overview$/);
  const ariaControls = await overview.getAttribute('aria-controls');
  expect(ariaControls).toMatch(/panel-overview$/);
  const panel = page.getByRole('tabpanel');
  const panelLabelledBy = await panel.getAttribute('aria-labelledby');
  expect(panelLabelledBy).toBe(overviewId);
  // Relationships wire automatically with zero consumer burden
});
```
