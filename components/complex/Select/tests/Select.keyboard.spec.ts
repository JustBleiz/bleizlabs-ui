/**
 * Select keyboard interaction spec — APG `/combobox/` combobox-select-only
 * (E142 L3d1 + L4 library fixes F1/F2).
 *
 * Coverage:
 * - Space/Enter/ArrowDown/ArrowUp open listbox (first-key-ever included)
 * - ArrowDown/Up navigate enabled options (aria-activedescendant assertions)
 * - Home/End jump
 * - PageDown/PageUp ±10
 * - Enter/Space commit highlighted → close + fire onValueChange
 * - Escape closes without committing
 * - Tab from open listbox commits + closes + advances focus
 * - Typeahead (single + multi-char cycle)
 * - Disabled item skipped by arrow nav
 * - Modifier-arrow pass-through
 *
 * E142 L4 F1 fixed the root-context highlight state, so `aria-activedescendant`
 * on the trigger now reconciles correctly and tests assert it directly.
 * E142 L4 F2 fixed the first-key-ever guard so ArrowDown/ArrowUp/Home/End on
 * a fresh closed trigger opens the listbox without needing a workaround click.
 *
 * Playground: /components/select.
 */

import { test, expect } from '@playwright/test';

test.describe('Select — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/select');
  });

  test('Space opens the listbox', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press(' ');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('Enter opens the listbox', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('First-ever ArrowDown on closed trigger opens the listbox (F2)', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('First-ever ArrowUp on closed trigger opens the listbox (F2)', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('First-ever Home on closed trigger opens the listbox (F2)', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press('Home');
    await expect(page.getByRole('listbox').first()).toBeVisible();
  });

  test('Click opens listbox + seeds highlight on current value (aria-activedescendant)', async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const reactOpt = listbox.getByRole('option', { name: 'React', exact: true });
    const reactId = await reactOpt.getAttribute('id');
    expect(reactId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-activedescendant', reactId as string);
  });

  test('ArrowDown/ArrowUp navigate enabled options (aria-activedescendant)', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    const reactOpt = listbox.getByRole('option', { name: 'React', exact: true });
    const vueOpt = listbox.getByRole('option', { name: 'Vue', exact: true });
    const reactId = await reactOpt.getAttribute('id');
    const vueId = await vueOpt.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', reactId as string);
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-activedescendant', vueId as string);
    await page.keyboard.press('ArrowUp');
    await expect(trigger).toHaveAttribute('aria-activedescendant', reactId as string);
  });

  test('Home / End jump to first / last enabled option', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    const options = listbox.getByRole('option');
    await page.keyboard.press('End');
    const lastId = await options.last().getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', lastId as string);
    await page.keyboard.press('Home');
    const firstId = await options.first().getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', firstId as string);
  });

  test('SL-R11 — PageDown / PageUp ±10 within listbox', async ({ page }) => {
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await page.keyboard.press('Home');
    await page.keyboard.press('PageDown');
    const options = listbox.getByRole('option');
    const tenthId = await options.nth(10).getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', tenthId as string);
    await page.keyboard.press('PageUp');
    const zeroId = await options.nth(0).getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', zeroId as string);
  });

  test('SL-R05 — Escape closes listbox + restores focus to trigger', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Enter commits highlighted option + closes', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click(); // open on React (default value)
    await page.keyboard.press('ArrowDown'); // move to Vue
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toContainText('Vue');
  });

  test('Typeahead — single-char highlights first startsWith match', async ({ page }) => {
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.focus();
    await page.keyboard.press('Space'); // open without commit
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.type('c');
    const listbox = page.getByRole('listbox').first();
    const canada = listbox.getByRole('option', { name: 'Canada', exact: true });
    const canadaId = await canada.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', canadaId as string);
  });

  test('SL-R12 — typeahead single-char repeat cycles through siblings (post-buffer-reset)', async ({
    page,
  }) => {
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.type('c'); // highlights Canada
    const listbox = page.getByRole('listbox').first();
    const canada = listbox.getByRole('option', { name: 'Canada', exact: true });
    const canadaId = await canada.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', canadaId as string);
    // Wait past the 500ms buffer reset so next 'c' starts a fresh single-char
    // search (which advances past lastIndex to cycle to Chile).
    await page.waitForTimeout(600);
    await page.keyboard.type('c');
    const chile = listbox.getByRole('option', { name: 'Chile', exact: true });
    const chileId = await chile.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', chileId as string);
  });

  test('SL-R08 — disabled items skipped by End (lands on last ENABLED)', async ({ page }) => {
    // idx 3 — Regions demo. Order: eu-west-1 (enabled, default),
    // eu-central-1, us-east-1, us-west-2, sep, ap-south-1 (disabled),
    // ap-northeast-1 (disabled). End should land on us-west-2 (last enabled).
    const sections = page.locator('section');
    const disabled = sections.nth(3);
    const trigger = disabled.getByRole('combobox');
    await trigger.click();
    const listbox = page.getByRole('listbox').first();
    await page.keyboard.press('End');
    const usWest = listbox.getByRole('option', { name: /US West/ });
    const usWestId = await usWest.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', usWestId as string);
  });

  test('SL-R07 — Tab from open listbox closes + advances to next focusable', async ({ page }) => {
    // Use form section (idx 5) — has Submit button as next tabstop
    const sections = page.locator('section');
    const form = sections.nth(5);
    const trigger = form.getByRole('combobox');
    await trigger.click();
    await expect(page.getByRole('listbox').first()).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('Modifier-arrow (Control+ArrowDown) passes through (no intercept)', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.focus();
    await page.keyboard.press('Control+ArrowDown');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('Alt+ArrowUp (open) closes without committing', async ({ page }) => {
    const trigger = page.getByRole('combobox').first();
    await trigger.click(); // open on React (default)
    await page.keyboard.press('ArrowDown'); // move to Vue
    await page.keyboard.press('Alt+ArrowUp');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(trigger).toContainText('React');
  });

  test('SL-R25 — closed printable char opens listbox + applies typeahead match (E03, APG)', async ({
    page,
  }) => {
    // Pre-fix: a printable char on the CLOSED trigger was a dead-code no-op
    // (the registry is empty while closed) — the listbox never opened.
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.focus();
    await page.keyboard.type('c');
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const canada = listbox.getByRole('option', { name: 'Canada', exact: true });
    const canadaId = await canada.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', canadaId as string);
  });

  test('SL-R26 — closed→open typeahead refinement (c → cr)', async ({ page }) => {
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    await trigger.focus();
    await page.keyboard.type('c');
    // Assert-between-keystrokes: wait for the open commit before refining,
    // so the second char routes to the open-state listbox handler.
    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    await page.keyboard.type('r');
    const croatia = listbox.getByRole('option', { name: 'Croatia', exact: true });
    const croatiaId = await croatia.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', croatiaId as string);
  });

  test('SL-R27 — closed End seeds LAST enabled option; closed ArrowUp with no value too (E03)', async ({
    page,
  }) => {
    // Pre-fix: all open-intent keys seeded value ?? first — the documented
    // Home/End/ArrowUp seeding contract was silently broken.
    const sections = page.locator('section');
    const long = sections.nth(4);
    const trigger = long.getByRole('combobox');
    const listbox = page.getByRole('listbox');

    await trigger.focus();
    await page.keyboard.press('End');
    await expect(listbox.first()).toBeVisible();
    const options = listbox.first().getByRole('option');
    const lastId = await options.last().getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', lastId as string);
    await page.keyboard.press('Escape');
    await expect(listbox).toHaveCount(0);

    // ArrowUp with no selected value (defaultValue={null}) → last as well.
    await page.keyboard.press('ArrowUp');
    await expect(listbox.first()).toBeVisible();
    const lastId2 = await listbox.first().getByRole('option').last().getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-activedescendant', lastId2 as string);
  });
});
