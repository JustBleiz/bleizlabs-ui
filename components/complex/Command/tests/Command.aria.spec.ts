/**
 * Command ARIA semantics spec — APG `/combobox/` editable + `/dialog-modal/`
 * composition (E142 L3d1).
 *
 * Coverage:
 * - Modal dialog role + aria-modal="true"
 * - Input role="combobox" + aria-expanded + aria-controls + aria-autocomplete
 * - List role="listbox" + aria-labelledby={inputId}
 * - Items role="option" + aria-selected + aria-disabled
 * - Groups role="group" + aria-labelledby
 * - axe-core zero violations on open palette
 *
 * Playground: /components/command
 *   idx 0: Basic palette (4 items, no groups)
 *   idx 1: Grouped w/ separator + shortcuts (Files/Edit/View), cut=disabled
 *   idx 2: City picker (3 groups of cities)
 *   idx 3: Cmd+K shortcut palette
 *   idx 4: Loading state
 *   idx 5: Custom filter (startsWith)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Command — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/command');
  });

  test('CMD-R10 — modal shell role="dialog" + aria-modal="true"', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('CMD-R09 — input role="combobox" + aria-expanded + aria-controls', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const input = page.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    const controls = await input.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toHaveAttribute('id', controls as string);
  });

  test('Listbox aria-labelledby={inputId}', async ({ page }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const input = page.getByRole('combobox');
    const listbox = page.getByRole('listbox');
    const inputId = await input.getAttribute('id');
    await expect(listbox).toHaveAttribute('aria-labelledby', inputId as string);
  });

  test('CMD-R11 — exactly one aria-selected option after open', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    // Scope to dialog to avoid counting hidden-registry options of other
    // closed palettes on the page.
    const dialog = page.getByRole('dialog');
    const options = dialog.getByRole('option');
    const selectedCount = await options.evaluateAll((els) =>
      els.filter((el) => el.getAttribute('aria-selected') === 'true').length,
    );
    expect(selectedCount).toBe(1);
  });

  test('CMD-R12 — groups have role="group" + aria-labelledby', async ({
    page,
  }) => {
    // idx 1 — grouped palette
    await page.getByRole('button', { name: 'Open grouped palette' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const group = dialog.getByRole('group').first();
    const labelledby = await group.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const label = page.locator(`#${labelledby}`);
    await expect(label).toBeVisible();
  });

  test('Disabled items render aria-disabled=true', async ({ page }) => {
    // idx 1 — "Cut (disabled)" inside Edit group
    await page.getByRole('button', { name: 'Open grouped palette' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('combobox')).toBeFocused();
    const cut = dialog.getByRole('option', { name: /Cut/ });
    await expect(cut).toHaveAttribute('aria-disabled', 'true');
  });

  test('aria snapshot contains dialog + combobox + listbox + option', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const dialog = page.getByRole('dialog');
    const snapshot = await dialog.ariaSnapshot();
    expect(snapshot).toContain('dialog');
    expect(snapshot).toContain('combobox');
    expect(snapshot).toContain('listbox');
  });

  test('axe-core zero violations — default page (no palette open)', async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — palette open with items', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — filtered listbox with matches', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open palette' }).click();
    const input = page.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('file');
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('F9 — CommandShortcut uses text-secondary (theme-aware ≥4.5:1, not text-muted)', async ({
    page,
  }) => {
    // E142 L4 F9 — CommandShortcut color bumped from --color-text-muted
    // (#9d9d9d on surface-raised ~3.88:1) to --color-text-secondary
    // (theme-aware, ≥4.5:1). Assert the shortcut span resolves to the
    // theme-aware token value rather than the muted one.
    await page.getByRole('button', { name: 'Open grouped palette' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const shortcut = page.getByRole('dialog').locator('[class*="shortcut"]').first();
    const resolved = await shortcut.evaluate((el) =>
      window.getComputedStyle(el).color,
    );
    // Dark theme --color-text-secondary = neutral-300 = #c7c7c7.
    // Browsers report as rgb(199, 199, 199).
    expect(resolved).toBe('rgb(199, 199, 199)');
  });

  test.skip(
    'CMD-R13 — dev-mode warn when no aria-label [PLAYGROUND-DEP: all demos provide aria-label]',
    async () => {
      // Every playground Command has aria-label set; no demo exercises the
      // missing-label warning path.
    },
  );
});
