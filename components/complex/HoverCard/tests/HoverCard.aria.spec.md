# HoverCard — ARIA semantics spec

**Execution status:** DEFERRED to first consumer adoption (per E15 scope decision).
**Format:** markdown code-fenced Playwright pseudo-code.

## Setup

- Page: `/components/hover-card` playground
- APG ref: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (modeless modifier)

## Tests

```ts
test('HC-R08 — coarse pointer (touch) skips hover handlers entirely', async ({ page, browser }) => {
  // Touch device emulation via context with hasTouch + mobile UA
  const ctx = await browser.newContext({
    hasTouch: true,
    isMobile: true,
  });
  const mobilePage = await ctx.newPage();
  await mobilePage.goto('/components/hover-card');
  const trigger = mobilePage.getByRole('link', { name: '@acme' });
  // Tap (coarse pointer) — pointer events suppressed via useCoarsePointer
  // matchMedia subscription. Hover handlers NOT wired.
  await trigger.dispatchEvent('pointerover', { pointerType: 'touch' });
  // HoverCard should NOT appear via hover on coarse pointer devices
  await expect(mobilePage.getByRole('dialog')).not.toBeVisible();
  await ctx.close();
});

test('HC-R12 — aria-expanded synced with open state on trigger', async ({ page }) => {
  await page.goto('/components/hover-card');
  const trigger = page.getByRole('link', { name: '@acme' });
  // Initially closed
  expect(await trigger.getAttribute('aria-expanded')).toBe('false');
  await trigger.hover();
  // Wait for openDelay (default ~700ms) to elapse
  await page.waitForTimeout(750);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await trigger.getAttribute('aria-expanded')).toBe('true');
});

test('HC-R13 — aria-labelledby wired only when title prop set', async ({ page }) => {
  await page.goto('/components/hover-card');
  // Variant 1: HoverCard with title="Acme Corp" — aria-labelledby present
  const titledTrigger = page.getByRole('link', { name: '@acme' });
  await titledTrigger.focus();
  const titledDialog = page.getByRole('dialog');
  await expect(titledDialog).toBeVisible();
  const labelledBy = await titledDialog.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy(); // id referenced exists
  await page.keyboard.press('Escape');
  // Variant 2: HoverCard without title (bare content) — aria-labelledby absent
  const untitledTrigger = page.getByRole('link', { name: '@bare' });
  await untitledTrigger.focus();
  const untitledDialog = page.getByRole('dialog');
  await expect(untitledDialog).toBeVisible();
  expect(await untitledDialog.getAttribute('aria-labelledby')).toBeNull();
});
```
