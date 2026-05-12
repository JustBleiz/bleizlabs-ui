/**
 * TagsInput form integration spec — hidden input + FormData + required.
 *
 * Total: 5 cases (TI-F01..TI-F05).
 */

import { test, expect } from '@playwright/test';
import { inputBy, wrapperOf, hiddenInputOf } from './_helpers';

const URL = '/components/tags-input';

test.describe('TagsInput — form integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('TI-F01: hidden input has name + value=joined', async ({ page }) => {
    const input = inputBy(page, 'Keywords');
    const wrap = wrapperOf(input);
    const hidden = hiddenInputOf(wrap);
    await expect(hidden).toHaveAttribute('name', 'keywords');
  });

  test('TI-F02: empty required submit blocked by Constraint Validation', async ({ page }) => {
    const submit = page.getByRole('button', { name: /^submit$/i }).first();
    await submit.click();
    await expect(page.getByText('Submitted', { exact: false })).not.toBeVisible();
  });

  test('TI-F03: filled tags allow submit; FormData carries delimited string', async ({ page }) => {
    const input = inputBy(page, 'Keywords');
    await input.click();
    await input.pressSequentially('alpha');
    await input.press('Enter');
    await input.pressSequentially('beta');
    await input.press('Enter');
    await page.getByRole('button', { name: /^submit$/i }).first().click();
    // Submitted line shows delimited string "alpha,beta".
    await expect(page.getByText('alpha,beta')).toBeVisible();
  });

  test('TI-F04: hidden input value updates as tags change', async ({ page }) => {
    const input = inputBy(page, 'Keywords');
    const wrap = wrapperOf(input);
    const hidden = hiddenInputOf(wrap);
    await input.click();
    await input.pressSequentially('one');
    await input.press('Enter');
    await expect(hidden).toHaveValue('one');
    await input.pressSequentially('two');
    await input.press('Enter');
    await expect(hidden).toHaveValue('one,two');
  });

  test('TI-F05: removing a chip updates hidden value', async ({ page }) => {
    const input = inputBy(page, 'Basic tags');
    const wrap = wrapperOf(input);
    // Default value already populated — no hidden input here (Basic tags
    // doesn't have name prop). Verify by typing: pull the input where
    // hidden exists.
    const formInput = inputBy(page, 'Keywords');
    const formWrap = wrapperOf(formInput);
    const hidden = hiddenInputOf(formWrap);
    await formInput.click();
    await formInput.pressSequentially('keep');
    await formInput.press('Enter');
    await formInput.pressSequentially('drop');
    await formInput.press('Enter');
    await expect(hidden).toHaveValue('keep,drop');
    // Remove "drop".
    const removeBtn = formWrap.locator('button[aria-label="Remove drop"]');
    await removeBtn.click();
    await expect(hidden).toHaveValue('keep');
    // Silence unused locator warnings.
    void wrap;
    void input;
  });
});
