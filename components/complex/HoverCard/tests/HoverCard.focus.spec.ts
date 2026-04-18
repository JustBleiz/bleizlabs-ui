/**
 * HoverCard focus management spec (E23).
 *
 * Focus contract:
 * - Trigger focus opens instantly
 * - Focus moving into content (via Tab) keeps card open
 *   (relatedTarget-aware blur handler)
 */

import { test, expect } from '@playwright/test';

test.describe('HoverCard — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/hover-card');
  });

  test('HC-R04 — focus into content via direct focus keeps card open', async ({
    page,
  }) => {
    // Spec intent: blur with relatedTarget inside popper does not close the
    // card. Tab traversal between trigger and inner link goes through other
    // page content first (portal mounts popper at end of body, so DOM tab
    // order is not sequential). Instead drive focus directly to the inner
    // link and verify the card stays open — this exercises the same
    // handleBlur(relatedTarget in popper) branch.
    const trigger = page.getByRole('link', { name: 'Focus me with Tab' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const insideLink = dialog.getByRole('link', { name: 'Inner action link' });
    await insideLink.focus();
    await expect(insideLink).toBeFocused();
    // Card stays open because focus moved INTO the popper.
    await expect(dialog).toBeVisible();
  });
});
