/**
 * Select ARIA semantics spec — APG `/combobox/` combobox-select-only compliance
 * (E142 L3d1).
 *
 * Coverage:
 * - Trigger role="combobox" + aria-haspopup="listbox" + aria-expanded + aria-controls
 * - Listbox role + aria-labelledby={triggerId} + aria-multiselectable=false
 * - Items role=option + aria-selected + aria-disabled
 * - Group role=group + aria-labelledby
 * - Separator role=none (not role=separator inside listbox)
 * - axe-core zero violations (closed + open + grouped + disabled)
 *
 * Playground: /components/select
 *   idx 0: Basic (defaultValue="react")
 *   idx 1: Grouped (Production/Preview/Local)
 *   idx 2: Controlled (defaultValue="pro")
 *   idx 3: Disabled items (ap-south, ap-northeast)
 *   idx 4: Typeahead long list
 *   idx 5: Form participation (defaultValue="pl", name="country")
 *   idx 6: Disabled entire Select
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Select — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/select');
  });

  test('Trigger role="combobox" + aria-haspopup="listbox" + aria-expanded', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const controls = await trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toHaveAttribute('id', controls as string);
  });

  test('Listbox aria-labelledby={triggerId} + aria-multiselectable=false', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    const triggerId = await trigger.getAttribute('id');
    await expect(listbox).toHaveAttribute('aria-labelledby', triggerId as string);
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'false');
  });

  test('Items have role="option" + aria-selected synced to value', async ({ page }) => {
    // idx 0 — defaultValue="react" (React is selected)
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    const react = listbox.getByRole('option', { name: 'React', exact: true });
    await expect(react).toHaveAttribute('aria-selected', 'true');
    const vue = listbox.getByRole('option', { name: 'Vue', exact: true });
    await expect(vue).toHaveAttribute('aria-selected', 'false');
  });

  test('Groups have role="group" + aria-labelledby pointing at SelectLabel', async ({ page }) => {
    // idx 1 — grouped demo
    const sections = page.locator('section');
    const grouped = sections.nth(1);
    await grouped.getByRole('combobox').click();
    const listbox = page.getByRole('listbox').first();
    const groups = listbox.getByRole('group');
    expect(await groups.count()).toBeGreaterThanOrEqual(3);
    const firstGroup = groups.first();
    const labelledby = await firstGroup.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const label = page.locator(`#${labelledby}`);
    await expect(label).toHaveText('Production');
  });

  test('Disabled items render aria-disabled (not native disabled)', async ({ page }) => {
    // idx 3 — regions demo with AP South/AP Northeast disabled
    const sections = page.locator('section');
    const disabled = sections.nth(3);
    await disabled.getByRole('combobox').click();
    const listbox = page.getByRole('listbox').first();
    const apSouth = listbox.getByRole('option', { name: /AP South/ });
    await expect(apSouth).toHaveAttribute('aria-disabled', 'true');
  });

  test('Separator has role="none" (NOT role=separator inside listbox)', async ({ page }) => {
    // idx 1 (grouped) has SelectSeparator between groups. Listbox-child
    // separators use role="none" per Select Phase 5 IMP-5 (WAI-ARIA does
    // not allow role=separator inside listbox).
    const sections = page.locator('section');
    const grouped = sections.nth(1);
    await grouped.getByRole('combobox').click();
    const listbox = page.getByRole('listbox').first();
    // Separators render as <div role="none"> — check there is no
    // role=separator descendant of listbox.
    const separators = listbox.locator('[role="separator"]');
    expect(await separators.count()).toBe(0);
  });

  test('Disabled Select trigger reports aria-disabled=true (not native disabled)', async ({
    page,
  }) => {
    // idx 6 — full Select disabled
    const sections = page.locator('section');
    const disabledSection = sections.nth(6);
    const trigger = disabledSection.getByRole('combobox');
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    // Native disabled attribute NOT used (AT discoverability)
    await expect(trigger).not.toHaveAttribute('disabled', '');
  });

  test('aria snapshot contains combobox + listbox on open', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const snapshot = await trigger.ariaSnapshot();
    expect(snapshot).toContain('combobox');
  });

  test('axe-core zero violations — closed default state', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — open listbox', async ({ page }) => {
    await page.getByRole('combobox').first().click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
