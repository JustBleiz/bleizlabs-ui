/**
 * TagsInput validation spec — empty/duplicate/maxTags/validate matrix.
 *
 * Total: 8 cases (TI-V01..TI-V08).
 */

import { test, expect } from '@playwright/test';
import { inputBy, wrapperOf, chipsOf } from './_helpers';

const URL = '/components/tags-input';

test.describe('TagsInput — validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-V01: empty after trim → rejected (no chip added)', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('   '); // whitespace-only
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2); // unchanged
  });

  test('TI-V02: duplicate (case-insensitive default) rejected', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    // Default value includes "react" — try "React" (different case).
    await input.pressSequentially('React');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-V03: maxTags=5 — 6th attempt rejected', async ({ page }) => {
    const input = inputBy(page, 'Limited tags');
    await input.click();
    // Initial value has 2 — add 3 more to hit 5, then 6th must reject.
    for (const t of ['a', 'b', 'c', 'd']) {
      await input.pressSequentially(t);
      await input.press('Enter');
    }
    const wrap = wrapperOf(input);
    // After 4 attempts: 2 initial + min(3 remaining slots, 4 attempts) = 5 total
    await expect(chipsOf(wrap)).toHaveCount(5);
  });

  test('TI-V04: validate fn returning false silently rejects', async ({ page }) => {
    const input = inputBy(page, 'Lowercase tags');
    await input.click();
    await input.pressSequentially('UPPER');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    // No chip added (validate returned a string error).
    await expect(chipsOf(wrap)).toHaveCount(0);
  });

  test('TI-V05: validate fn returning string error surfaces in onReject', async ({ page }) => {
    const input = inputBy(page, 'Lowercase tags');
    await input.click();
    await input.pressSequentially('Mixed');
    await input.press('Enter');
    // Rejection panel renders the error message from validate.
    // Both the visible badge AND the live region (post Phase 5 fix #4)
    // contain "Must be lowercase" — first() picks either; both confirm wiring.
    await expect(input.page().getByText('Must be lowercase').first()).toBeVisible();
  });

  test('TI-V06: validate fn accepting (lowercase) → chip added', async ({ page }) => {
    const input = inputBy(page, 'Lowercase tags');
    await input.click();
    await input.pressSequentially('valid');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(1);
    // Use chip-scoped locator (label span inside listitem) — page-level
    // 'valid' would match the placeholder substring "valid" too.
    await expect(wrap.locator('[role="listitem"]').first()).toContainText('valid');
  });

  test('TI-V07: allowDuplicates accepts identical tags', async ({ page }) => {
    const input = inputBy(page, 'Allow duplicate tags');
    await input.click();
    await input.pressSequentially('a');
    await input.press('Enter');
    await input.pressSequentially('a');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    await expect(chipsOf(wrap)).toHaveCount(2);
  });

  test('TI-V08: trim removes leading/trailing whitespace before commit', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await input.click();
    await input.pressSequentially('  spaced  ');
    await input.press('Enter');
    const wrap = wrapperOf(input);
    // Chip exists with trimmed value (just "spaced").
    await expect(wrap.getByText('spaced', { exact: true })).toBeVisible();
  });
});
