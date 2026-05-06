# HoverCard — focus behavior spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/hover-card` playground
- Default trigger: focusable anchor with interactive HoverCard content (link inside card)
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

## Tests

```ts
test('HC-R04 — blur with relatedTarget in content keeps open', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  await trigger.focus();
  await expect(page.getByRole('dialog')).toBeVisible();
  // Tab from trigger into interactive content (link inside card)
  // blur fires on trigger BUT relatedTarget is inside content
  // handleBlur should NOT close (focus moved into content, not out of both)
  await page.keyboard.press('Tab');
  await expect(page.getByRole('dialog')).toBeVisible();
  const insideLink = page.getByRole('dialog').getByRole('link').first();
  await expect(insideLink).toBeFocused();
});
```
