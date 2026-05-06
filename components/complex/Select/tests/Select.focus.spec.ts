/**
 * Select focus behavior spec (E142 L3d1).
 *
 * Coverage:
 * - Focus stays on trigger while open (aria-activedescendant pattern)
 * - Escape returns focus to trigger
 * - Item click commits + returns focus to trigger
 * - Highlighted option scrolled into view (long list)
 */

import { test, expect } from '@playwright/test';

test.describe('Select — focus behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/select');
  });

  test('Focus stays on trigger while navigating listbox (APG select-only)', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toBeFocused();
  });

  test('SL-R05 — Escape returns focus to trigger', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Item click commits + closes + returns focus to trigger', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const vueOpt = page.getByRole('listbox').first().getByRole('option', { name: 'Vue', exact: true });
    await vueOpt.click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText('Vue');
  });

  test('SL-R14 — long list: highlighted last option scrolled into view', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('End');
    const last = listbox.getByRole('option').last();
    // Option must be in viewport (scrollIntoView was called)
    await expect(last).toBeInViewport();
  });
});
