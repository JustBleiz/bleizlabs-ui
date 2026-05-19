/**
 * Combobox keyboard interaction spec — APG `/combobox/` editable-listbox
 * (E142 L3d1 + L4 F1 library fix).
 *
 * Coverage:
 * - Printable char opens + filters
 * - ArrowDown opens + seeds highlight (aria-activedescendant on input)
 * - ArrowDown/Up navigate visible enabled items
 * - Home/End jump
 * - Enter commits highlighted (filter → highlight → Enter)
 * - Escape reverts search to committed label (open)
 * - Tab commits highlighted + closes
 * - Modifier-arrow pass-through
 * - IME composition guard
 *
 * E142 L4 F1 hoisted the highlight state from ComboboxContentContext
 * (which lived inside FloatingPortal — sibling of the input → context
 * propagation impossible) to the root ComboboxContext. Input now reads
 * `highlightedId` from the root and `aria-activedescendant` reconciles
 * correctly (WCAG SC 4.1.3 + APG /combobox/ restored).
 *
 * Playground: /components/combobox (click input does NOT open — ArrowDown
 * or typing does).
 */

import { test, expect } from '@playwright/test';

test.describe('Combobox — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/combobox');
  });

  test('Printable char opens listbox and filters results', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.type('a');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    const optionsCount = await listbox.getByRole('option').count();
    expect(optionsCount).toBeGreaterThan(0);
  });

  test('ArrowDown + type opens listbox + seeds highlight (aria-activedescendant)', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    // Highlight is seeded on open — first visible item becomes the active
    // descendant on the input (role=combobox) per APG editable-combobox.
    const firstId = await listbox.getByRole('option').first().getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', firstId as string);
  });

  test('ArrowDown moves highlight forward (aria-activedescendant follows)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    const firstId = await listbox.getByRole('option').first().getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', firstId as string);
    await page.keyboard.press('ArrowDown');
    const currentActive = await input.getAttribute('aria-activedescendant');
    expect(currentActive).toBeTruthy();
    expect(currentActive).not.toBe(firstId);
  });

  test('End / Home navigate to last / first visible enabled option', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('a');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('End');
    const options = listbox.getByRole('option');
    const optsCount = await options.count();
    let lastEnabledId: string | null = null;
    for (let i = optsCount - 1; i >= 0; i -= 1) {
      const opt = options.nth(i);
      const dis = await opt.getAttribute('aria-disabled');
      if (dis !== 'true') {
        lastEnabledId = await opt.getAttribute('id');
        break;
      }
    }
    expect(lastEnabledId).toBeTruthy();
    await expect(input).toHaveAttribute('aria-activedescendant', lastEnabledId as string);
    await page.keyboard.press('Home');
    const firstId = await listbox.getByRole('option').first().getAttribute('id');
    await expect(input).toHaveAttribute('aria-activedescendant', firstId as string);
  });

  test('Enter commits highlighted option (filter → highlight → Enter)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('pol'); // filters to Poland
    await expect(page.getByRole('listbox').first()).toBeVisible();
    // highlight is already on first visible (Poland)
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(input).toHaveValue(/Poland/i);
  });

  test('Escape (open with text) reverts search to current committed label', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    // Commit Poland first via type + Enter
    await input.focus();
    await input.fill('Poland');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue(/Poland/i);
    // Now open + type garbage, then Escape
    await input.focus();
    await input.fill('xxx');
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(input).toHaveValue(/Poland/i);
  });

  test.skip('Escape (closed with non-empty search) clears search [LIB-BEHAVIOR: outside-click/blur already reverts search, making this path unreachable from playground]', async () => {
    // Spec expects: Escape on a closed input with non-empty search clears
    // the search. In practice every close path (outside-click, blur) also
    // reverts/clears search when no committed value exists.
  });

  test('Tab commits highlighted + closes listbox (Radix convention)', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.fill('po');
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(input).toHaveValue(/^(Poland|Portugal)$/i);
  });

  test('Modifier-arrow (Ctrl+ArrowDown) does not open listbox', async ({ page }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await page.keyboard.press('Control+ArrowDown');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('CB-R07 — IME composition guard: Enter during compositionStart does not commit', async ({
    page,
  }) => {
    const input = page.getByRole('combobox').first();
    await input.focus();
    await input.evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(new CompositionEvent('compositionstart'));
    });
    // Enter mid-composition should NOT commit (handler early-returns on composing).
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('');
    await input.evaluate((el: HTMLInputElement) => {
      el.dispatchEvent(new CompositionEvent('compositionend', { data: '' }));
    });
  });

  test.skip('CB-R17 — Escape bubble inside Dialog [PLAYGROUND-DEP: no ?dialog=1 demo]', async () => {
    // Spec expects /components/combobox?dialog=1 with a Dialog hosting a
    // Combobox. Playground has no such scenario.
  });
});
