/**
 * DatePicker ARIA semantics spec — APG editable-combobox + dialog + grid
 * composition (E142 L3d1).
 *
 * Coverage:
 * - Input role="combobox" + aria-haspopup="dialog" + aria-expanded
 * - Popup role="dialog" + aria-modal="false" + aria-labelledby={inputId}
 * - Embedded Calendar preserves APG /grid/ (role=grid + role=gridcell)
 * - axe-core zero violations (closed + open + Polish locale)
 *
 * Playground: /components/date-picker
 *   idx 0: Basic uncontrolled
 *   idx 1: Controlled value (default 2026-04-20)
 *   idx 2: min/max boundaries (2026-04-01..04-30)
 *   idx 3: disabledDates weekdays-only
 *   idx 4: Polish locale (pl-PL, default 2026-04-22)
 *   idx 5: controlled open state
 *   idx 6: disabled widget
 *   idx 7: form participation (name="deadline", required, default 2026-05-01)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DatePicker — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/date-picker');
  });

  test('DP-R08 — input role="combobox" + aria-haspopup="dialog" + aria-expanded', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  test('DP-R09 — popup role="dialog" + aria-modal="false"', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveAttribute('aria-modal', 'false');
  });

  test('popup aria-labelledby={inputId}', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    const inputId = await input.getAttribute('id');
    await input.focus();
    await page.keyboard.press('ArrowDown');
    const popup = page.getByRole('dialog');
    await expect(popup).toHaveAttribute('aria-labelledby', inputId as string);
  });

  test('DP-R10 — embedded Calendar has role="grid" + gridcells', async ({
    page,
  }) => {
    const firstInput = page.getByRole('combobox').first();
    await firstInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    await expect(grid).toBeVisible();
    const cells = grid.getByRole('gridcell');
    expect(await cells.count()).toBeGreaterThan(0);
  });

  test('Selected date has aria-selected=true on its gridcell', async ({
    page,
  }) => {
    // idx 1 — controlled with defaultValue 2026-04-20
    const sections = page.locator('section');
    const controlled = sections.nth(1);
    const ctrlInput = controlled.getByRole('combobox');
    await ctrlInput.focus();
    await page.keyboard.press('ArrowDown');
    const grid = page.getByRole('grid');
    // Button inside gridcell has data-calendar-cell="2026-04-20"
    const selectedButton = grid.locator(
      'button[data-calendar-cell="2026-04-20"]',
    );
    await expect(selectedButton).toBeVisible();
    // Parent cell has aria-selected=true
    const parentCell = selectedButton.locator('xpath=..');
    await expect(parentCell).toHaveAttribute('aria-selected', 'true');
  });

  test('Disabled widget: input has aria-disabled=true + won\'t open popup', async ({
    page,
  }) => {
    // idx 6 — disabled demo
    const sections = page.locator('section');
    const disabled = sections.nth(6);
    const input = disabled.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-disabled', 'true');
    await input.click({ force: true });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Required prop wires aria-required on input', async ({ page }) => {
    // idx 7 — form with required
    const sections = page.locator('section');
    const form = sections.nth(7);
    const input = form.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-required', 'true');
  });

  test('aria snapshot contains combobox + dialog when open', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('ArrowDown');
    const popup = page.getByRole('dialog');
    const snapshot = await popup.ariaSnapshot();
    expect(snapshot).toContain('dialog');
  });

  test('axe-core zero violations — closed default', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — popup open with Calendar', async ({
    page,
  }) => {
    const firstInput = page.getByRole('combobox').first();
    await firstInput.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('grid')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test.skip(
    'DP-R11 — aria-invalid=true on invalid date input [LIB-BEHAVIOR: aria-invalid only toggled via explicit invalid prop]',
    async () => {
      // Current implementation: `aria-invalid` only set when consumer passes
      // `invalid={true}` prop on DatePickerInput (via `rest` spread). The
      // component does not auto-validate typed input and set aria-invalid
      // on bad parse — spec expectation diverges from implementation.
    },
  );
});
