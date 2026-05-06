/**
 * Combobox ARIA semantics spec — APG `/combobox/` editable-listbox compliance
 * (E142 L3d1).
 *
 * Coverage:
 * - role="combobox" on input + aria-autocomplete="list" + aria-expanded + aria-controls
 * - Listbox role + aria-labelledby={inputId} + aria-multiselectable=false
 * - Items role=option + aria-selected + aria-disabled
 * - Groups role=group + aria-labelledby
 * - Empty role=presentation (NOT listbox child)
 * - axe-core zero violations (closed + open + filtered)
 *
 * Playground: /components/combobox
 *   Section 1 (idx 0): Basic uncontrolled (defaultValue=null)
 *   Section 2 (idx 1): Grouped (Production/Preview/Local)
 *   Section 3 (idx 2): Controlled (defaultValue="pl")
 *   Section 4 (idx 3): Disabled items (AP South/AP Northeast)
 *   Section 5 (idx 4): acceptFreeText demo
 *   Section 6 (idx 5): Form participation (defaultValue="pl", name="country")
 *
 * Note on open semantics: clicking the input does NOT open the listbox. To
 * open: press ArrowDown, type a character, or click the chevron button
 * ("Open suggestions"). Matches Radix / shadcn cmdk precedent.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Combobox — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/combobox');
  });

  test('role="combobox" + aria-autocomplete="list" + aria-expanded on input', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await input.focus();
    await input.fill('a'); // type to open (click doesn't open Combobox)
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    // aria-controls now points to listbox id
    const controls = await input.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toHaveAttribute('id', controls as string);
  });

  test('Listbox role="listbox" + aria-labelledby={inputId} + aria-multiselectable=false', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    const inputId = await input.getAttribute('id');
    await expect(listbox).toHaveAttribute('aria-labelledby', inputId as string);
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'false');
  });

  test('Items have role="option" + aria-selected synced to value', async ({
    page,
  }) => {
    // Section 3 — controlled Combobox with defaultValue="pl" (Poland)
    const sections = page.locator('section');
    const controlledSection = sections.nth(2);
    const input = controlledSection.getByRole('combobox');
    await input.focus();
    await input.fill('Po');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const poland = listbox.getByRole('option', { name: 'Poland', exact: true });
    await expect(poland).toHaveAttribute('aria-selected', 'true');
    const portugal = listbox.getByRole('option', { name: 'Portugal', exact: true });
    await expect(portugal).toHaveAttribute('aria-selected', 'false');
  });

  test('Groups have role="group" + aria-labelledby pointing at label', async ({
    page,
  }) => {
    // Section 2 — grouped demo (Production / Preview / Local)
    const sections = page.locator('section');
    const grouped = sections.nth(1);
    const input = grouped.getByRole('combobox');
    await input.focus();
    // Type shared char that keeps all three groups populated
    await input.fill('e');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const groups = listbox.getByRole('group');
    expect(await groups.count()).toBeGreaterThanOrEqual(1);
    const firstGroup = groups.first();
    const labelledby = await firstGroup.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const label = page.locator(`#${labelledby}`);
    await expect(label).toBeVisible();
  });

  test('Disabled items render aria-disabled (not native disabled)', async ({
    page,
  }) => {
    // Section 4 — AWS region demo has AP South disabled
    const sections = page.locator('section');
    const disabledSection = sections.nth(3);
    const input = disabledSection.getByRole('combobox');
    await input.focus();
    await input.fill('AP');
    // Listbox is portaled to body — use page-level locator
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const apSouth = listbox.getByRole('option', { name: /AP South/ });
    await expect(apSouth).toBeVisible();
    await expect(apSouth).toHaveAttribute('aria-disabled', 'true');
  });

  test('Empty state uses role="presentation" (not listbox child)', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('xyzzy_no_match_123');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const optionsCount = await listbox.getByRole('option').count();
    expect(optionsCount).toBe(0);
    const emptyMsg = listbox.getByText(/No country matches your search/i);
    await expect(emptyMsg).toHaveAttribute('role', 'presentation');
  });

  test('aria snapshot contains combobox role', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    const snapshot = await input.ariaSnapshot();
    expect(snapshot).toContain('combobox');
  });

  test('axe-core zero violations — closed default state', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — open listbox', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    await expect(page.getByRole('listbox').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — filtered listbox with matches', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('an'); // matches Canada, Iceland, etc.
    await expect(page.getByRole('listbox').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
