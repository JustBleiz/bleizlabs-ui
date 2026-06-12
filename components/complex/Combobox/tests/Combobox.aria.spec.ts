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
 *   Section 3 (idx 2): Controlled (value="pl" via useState)
 *   Section 4 (idx 3): Disabled items (AP South/AP Northeast)
 *   Section 5 (idx 4): acceptFreeText demo
 *   Section 6 (idx 5): Form participation (defaultValue="pl", name="country")
 *   Section 7 (idx 6): Multi-select (multiple, name="countries") — CB-R21 target
 *   Section 8: Keyboard walkthrough (docs only, no combobox instance)
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

  test('role="combobox" + aria-autocomplete="list" + aria-expanded on input', async ({ page }) => {
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

  test('Items have role="option" + aria-selected synced to value', async ({ page }) => {
    // Section 3 — controlled Combobox with value="pl" via useState (Poland)
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

  test('Groups have role="group" + aria-labelledby pointing at label', async ({ page }) => {
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

  test('Disabled items render aria-disabled (not native disabled)', async ({ page }) => {
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

  test('Empty state uses role="presentation" (not listbox child)', async ({ page }) => {
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

  test('axe-core zero violations — filtered listbox with matches', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('an'); // matches Canada, Ireland, etc.
    await expect(page.getByRole('listbox').first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // CB-R18..R21 (E03 audit remediation) — debounced filtered-result-count
  // announcer (WCAG 4.1.3; the NVDA sweep expected it, the component had
  // no live region at all pre-fix).

  test('CB-R18 — announcer node pre-exists, role=status, empty before interaction', async ({
    page,
  }) => {
    // Pre-fix: node absent entirely.
    const announcer = page.locator('[data-combobox-announcer]').first();
    await expect(announcer).toBeAttached();
    await expect(announcer).toHaveAttribute('role', 'status');
    await expect(announcer).toHaveAttribute('aria-live', 'polite');
    await expect(announcer).toHaveText('');
  });

  test('CB-R19 — announcer reports filtered counts (plural / zero / singular)', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    const announcer = page.locator('[data-combobox-announcer]').first();
    await input.focus();
    await input.fill('an');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const count = await listbox.getByRole('option').count();
    expect(count).toBeGreaterThan(1);
    await expect(announcer).toHaveText(`${count} results`);
    await input.fill('zxqv');
    await expect(announcer).toHaveText('0 results');
    await input.fill('croat');
    await expect(announcer).toHaveText('1 result');
  });

  test('CB-R20 — announcement is debounced (coalesces a typing burst)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    const announcer = page.locator('[data-combobox-announcer]').first();
    await input.focus();
    await page.keyboard.type('croa', { delay: 40 });
    // Immediately after the burst the 300ms debounce hasn't fired yet.
    await expect(announcer).toHaveText('');
    // Settles to the single final-count text.
    await expect(announcer).toHaveText('1 result');
  });

  test('CB-R21 — multi mode: toggle resets count to total; Escape clears the announcer', async ({
    page,
  }) => {
    // Multi demo (uncontrolled chips) — exact-name match ("Countries" is a
    // substring of two other labels on the page).
    const input = page.getByRole('combobox', { name: 'Countries', exact: true });
    const announcer = page.locator('[data-combobox-announcer]').nth(6);
    await input.focus();
    await input.fill('pol');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await expect(announcer).toHaveText('1 result');
    // Toggle the pick — search clears, listbox stays open, count returns to total.
    await listbox.getByRole('option').first().click();
    await expect(listbox).toBeVisible();
    const total = await listbox.getByRole('option').count();
    await expect(announcer).toHaveText(total === 1 ? '1 result' : `${total} results`);
    await page.keyboard.press('Escape');
    await expect(announcer).toHaveText('');
  });
});
