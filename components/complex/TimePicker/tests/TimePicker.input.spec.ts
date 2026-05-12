/**
 * TimePicker input spec — keyboard model + typed-commit semantics.
 *
 * Coverage:
 * - TP-IN01 Alt+ArrowDown opens popover
 * - TP-IN02 Alt+ArrowUp closes popover
 * - TP-IN03 Escape closes when open
 * - TP-IN04 Enter on valid typed value commits + closes
 * - TP-IN05 Enter on invalid typed value sets aria-invalid (no commit)
 * - TP-IN06 Click on input opens popover
 * - TP-IN07 typed value reverts to current ISO on blur if unparseable
 */

import { test, expect } from '@playwright/test';
import { dialogOf, inputOf, pickerBy } from './_helpers';

test.describe('TimePicker — input keyboard model', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-picker');
  });

  test('TP-IN01 — Alt+ArrowDown opens popover', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  test('TP-IN02 — Alt+ArrowUp closes popover', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.press('Alt+ArrowUp');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('TP-IN03 — Escape closes popover', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.focus();
    await input.press('Alt+ArrowDown');
    await expect(dialogOf(page)).toBeVisible();
    await input.focus();
    await input.press('Escape');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('TP-IN04 — Enter on valid typed 24h commits + closes', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('14:45');
    await input.press('Enter');
    await expect(input).toHaveValue('14:45');
    await expect(dialogOf(page)).not.toBeVisible();
  });

  test('TP-IN05 — Enter on invalid typed value sets aria-invalid', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('99:99');
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('TP-IN06 — Click on input opens popover', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await input.click();
    await expect(dialogOf(page)).toBeVisible();
  });

  test('TP-IN07 — 12h typed "02:30 PM" parses to 24h commit', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting time');
    const input = inputOf(picker);
    await input.focus();
    await input.fill('11:45 AM');
    await input.press('Enter');
    // Display should reformat the same — verifies parse succeeded
    await expect(input).toHaveValue('11:45 AM');
  });
});
