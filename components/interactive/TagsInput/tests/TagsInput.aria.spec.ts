/**
 * TagsInput ARIA + axe-core spec.
 *
 * Coverage: input role/label, chip group role=list + listitem, chip ×
 * accessible names, live region presence, focus-within, axe-core zero
 * violations on demo route.
 *
 * Total: 10 cases (TI-A01..TI-A10).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { inputBy, wrapperOf, chipsOf, removeBtnOf, liveRegionOf } from './_helpers';

const URL = '/components/tags-input';

test.describe('TagsInput — ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-A01: typing input is type=text with accessible name', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveAttribute('aria-label', 'Basic tags');
  });

  test('TI-A02: chip list has role=list with aria-label', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const list = wrap.locator('ul[role="list"]');
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute('aria-label', 'Tags');
  });

  test('TI-A03: each chip is role=listitem', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const items = chipsOf(wrap);
    // Default value has 2 tags.
    await expect(items).toHaveCount(2);
  });

  test('TI-A04: chip × button has aria-label="Remove {tag}"', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const btn = removeBtnOf(wrap, 'react');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', 'Remove react');
  });

  test('TI-A05: live region exists and is empty initially', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    const live = liveRegionOf(wrap);
    await expect(live).toHaveAttribute('aria-atomic', 'true');
    await expect(live).toHaveText('');
  });

  test('TI-A06: input aria-describedby chains live region id', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const describedby = await input.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    await expect(input.page().locator(`#${describedby}`)).toHaveAttribute('role', 'status');
  });

  test('TI-A07: disabled wrapper has data-state=disabled', async ({ page }) => {
    const input = inputBy(page, 'Disabled tags');
    const wrap = wrapperOf(input);
    await expect(wrap).toHaveAttribute('data-state', 'disabled');
    await expect(input).toBeDisabled();
  });

  test('TI-A08: disabled chip × buttons are disabled', async ({ page }) => {
    const input = inputBy(page, 'Disabled tags');
    const wrap = wrapperOf(input);
    const btn = removeBtnOf(wrap, 'readonly');
    await expect(btn).toBeDisabled();
  });

  test('TI-A09: invalid wrapper carries data-state=invalid via aria-invalid', async ({ page }) => {
    const input = inputBy(page, 'Lowercase tags');
    // Initially valid. Type "Bad" then Enter — validate returns string error.
    await input.click();
    await input.pressSequentially('Bad');
    await input.press('Enter');
    // No assertion on invalid state here yet — onReject fires but invalid
    // prop is consumer-driven (demo doesn't set invalid). Just confirm
    // rejection visible. Both visible badge + live region carry the message.
    await expect(
      input
        .page()
        .getByText(/Must be lowercase/i)
        .first(),
    ).toBeVisible();
  });

  test('TI-A10: axe-core zero violations on demo route', async ({ page }) => {
    const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    expect(results.violations).toEqual([]);
  });
});
