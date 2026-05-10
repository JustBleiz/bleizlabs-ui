/**
 * Combobox multi-select spec — APG `/listbox/` multi-selectable extension
 * to the editable combobox pattern (E07.12 0.15.0 AMEND).
 *
 * Coverage:
 * - aria-multiselectable="true" on listbox in multi mode
 * - aria-selected toggles per item via click + Space + Enter
 * - Listbox stays OPEN after toggle (single mode would close)
 * - Search clears after toggle (single mode would sync to label)
 * - Backspace-on-empty-input removes last chip (Gmail/GitHub gesture)
 * - Chip × button removes single value
 * - FormData multi-value: `formData.getAll(name)` returns N entries
 * - Tab in multi closes without toggling the highlighted item
 * - Escape in multi closes WITHOUT reverting selections (chips persist)
 *
 * Playground: /components/combobox section 7 (subsections 7.1-7.3).
 *   7.1 Uncontrolled (defaultValue=['pl','de'])     → combobox idx 6
 *   7.2 Controlled (initial value=['pl','de'])      → combobox idx 7
 *   7.3 Form (defaultValue=['fr','es'], name="countries") → combobox idx 8
 *
 * Note: `getByRole('combobox')` returns inputs from ALL sections including
 * single-mode. Multi-mode comboboxes are at indices 6, 7, 8.
 */

import { test, expect } from '@playwright/test';

test.describe('Combobox — multi-select mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/combobox');
  });

  test('aria-multiselectable="true" on listbox when multiple={true}', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1 uncontrolled
    await input.focus();
    await input.press('ArrowDown');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  });

  test('default chips render from defaultValue=["pl","de"]', async ({ page }) => {
    // Section 7.1 — chips for Poland + Germany should be visible without
    // any user interaction.
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger).toBeVisible();
    // Chips are span elements with the value as data-value.
    await expect(trigger.locator('[data-value="pl"]')).toBeVisible();
    await expect(trigger.locator('[data-value="de"]')).toBeVisible();
    // Visible labels match the lib-derived textContent of the registered items.
    await expect(trigger.locator('[data-value="pl"]')).toContainText('Poland');
    await expect(trigger.locator('[data-value="de"]')).toContainText('Germany');
  });

  test('item click toggles aria-selected + adds chip + clears search + keeps listbox open', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.fill('fr'); // open + filter to France
    const option = page.getByRole('option', { name: 'France' });
    await expect(option).toBeVisible();
    await expect(option).toHaveAttribute('aria-selected', 'false');

    await option.click();

    // After click in multi mode: listbox stays open
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();

    // Search cleared
    await expect(input).toHaveValue('');

    // France chip added to trigger
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="fr"]')).toBeVisible();

    // aria-selected on the option flipped
    await expect(page.getByRole('option', { name: 'France' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('item click on already-selected toggles OFF (removes chip)', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1 has pl + de selected by default
    await input.focus();
    await input.fill('pol'); // filter to Poland
    const option = page.getByRole('option', { name: 'Poland' });
    await expect(option).toHaveAttribute('aria-selected', 'true');

    await option.click();

    // Chip for "pl" removed from trigger
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="pl"]')).toHaveCount(0);

    // Search cleared, listbox stays open
    await expect(input).toHaveValue('');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('Space toggles current highlight in multi mode', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.press('ArrowDown'); // open + highlight first selected (pl)
    await expect(page.getByRole('listbox').first()).toBeVisible();

    // The highlighted item is the first selected (pl). Space toggles it OFF.
    await input.press(' ');

    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="pl"]')).toHaveCount(0);
    // Listbox stays open
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('Enter on highlighted toggles in multi mode (does NOT close listbox)', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.fill('cz'); // filter to Czech Republic
    const option = page.getByRole('option', { name: 'Czech Republic' });
    await expect(option).toBeVisible();

    await input.press('Enter');

    // Czech Republic chip added
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="cz"]')).toBeVisible();

    // Listbox stays open after Enter in multi mode
    await expect(page.getByRole('listbox').first()).toBeVisible();
    // Search cleared
    await expect(input).toHaveValue('');
  });

  test('Backspace on empty input removes last chip', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1 has [pl, de]
    await input.focus();
    // Input is empty — Backspace should remove last chip (de).
    await input.press('Backspace');

    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="de"]')).toHaveCount(0);
    // pl chip persists
    await expect(trigger.locator('[data-value="pl"]')).toBeVisible();

    // Press again → removes pl chip
    await input.press('Backspace');
    await expect(trigger.locator('[data-value="pl"]')).toHaveCount(0);

    // Press again on empty selection — no-op (still no chips).
    await input.press('Backspace');
    await expect(trigger.locator('[data-value]')).toHaveCount(0);
  });

  test('Backspace does NOT remove chip when input has typed text', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.fill('abc');
    await input.press('Backspace'); // edits the search ('ab'), does NOT remove chip
    await expect(input).toHaveValue('ab');
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="pl"]')).toBeVisible();
    await expect(trigger.locator('[data-value="de"]')).toBeVisible();
  });

  test('chip × button removes that single value', async ({ page }) => {
    const trigger = page.locator('[data-multiple]').first();
    const plChip = trigger.locator('[data-value="pl"]');
    await expect(plChip).toBeVisible();

    // Click the × button inside the chip.
    await plChip.getByRole('button', { name: /Remove Poland/i }).click();

    await expect(trigger.locator('[data-value="pl"]')).toHaveCount(0);
    // de chip persists
    await expect(trigger.locator('[data-value="de"]')).toBeVisible();
  });

  test('Tab in multi mode closes listbox WITHOUT toggling highlighted', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.fill('cz');
    await expect(page.getByRole('option', { name: 'Czech Republic' })).toBeVisible();

    await input.press('Tab');

    // Listbox closed
    await expect(page.getByRole('listbox')).toHaveCount(0);

    // Czech Republic NOT added (Tab is "I'm done", not commit)
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="cz"]')).toHaveCount(0);
  });

  test('Escape in multi mode closes WITHOUT reverting selections', async ({ page }) => {
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.fill('belg'); // filter to Belgium
    await expect(page.getByRole('option', { name: 'Belgium' })).toBeVisible();

    await input.press('Escape');

    // Listbox closed
    await expect(page.getByRole('listbox')).toHaveCount(0);
    // Search cleared
    await expect(input).toHaveValue('');
    // Initial selections (pl + de) persist
    const trigger = page.locator('[data-multiple]').first();
    await expect(trigger.locator('[data-value="pl"]')).toBeVisible();
    await expect(trigger.locator('[data-value="de"]')).toBeVisible();
  });

  test('FormData renders N hidden inputs sharing the same name (getAll)', async ({ page }) => {
    // Section 7.3 — form with defaultValue=['fr','es'], name="countries".
    // Verify hidden inputs render correctly.
    const formCombobox = page.getByRole('combobox').nth(8);
    // Walk up to the form root and inspect hidden inputs by name.
    const form = formCombobox.locator('xpath=ancestor::form');
    const hiddenInputs = form.locator('input[type="hidden"][name="countries"]');
    await expect(hiddenInputs).toHaveCount(2);

    const values = await hiddenInputs.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value),
    );
    expect(values.sort()).toEqual(['es', 'fr']);
  });

  test('aria-multiselectable="false" on the SINGLE-mode listbox (regression check)', async ({
    page,
  }) => {
    // Section 1 — first single-mode combobox. Confirms multi mode AMEND
    // did not regress single mode aria-multiselectable.
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'false');
  });

  test('listbox width matches trigger width via --reference-width', async ({ page }) => {
    // Width-fix verification — listbox should be at least as wide as the
    // trigger (or the 200px floor, whichever is greater).
    const input = page.getByRole('combobox').nth(6); // 7.1
    await input.focus();
    await input.press('ArrowDown');
    const trigger = page.locator('[data-multiple]').first();
    const listbox = page.getByRole('listbox').first();

    const triggerBox = await trigger.boundingBox();
    const listboxBox = await listbox.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(listboxBox).not.toBeNull();

    // Listbox width should equal trigger width (when trigger > 200px floor).
    // Allow 2px tolerance for sub-pixel rounding.
    if (triggerBox && listboxBox) {
      expect(Math.abs(listboxBox.width - triggerBox.width)).toBeLessThanOrEqual(2);
    }
  });
});
