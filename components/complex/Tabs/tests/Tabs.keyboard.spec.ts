/**
 * Tabs keyboard interaction spec — APG `/tabs/` compliance (E142 L3c).
 *
 * Coverage:
 * - Arrow navigation horizontal + vertical
 * - Home/End
 * - Automatic activation mode
 * - Manual activation with Space/Enter
 * - Modifier key pass-through (TB-R04)
 * - Disabled trigger skipped
 * - Loop wraparound (TB-R20)
 * - Rapid arrow presses are synchronous (TB-R18)
 */

import { test, expect } from '@playwright/test';

test.describe('Tabs — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tabs');
  });

  test('ArrowRight moves focus + activates next tab (automatic mode)', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const tasks = tablist.getByRole('tab', { name: 'Tasks' });
    await overview.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tasks).toBeFocused();
    await expect(tasks).toHaveAttribute('aria-selected', 'true');
  });

  test('ArrowLeft wraps from first tab to last (loop=true default)', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const first = tablist.getByRole('tab', { name: 'Overview' });
    const last = tablist.getByRole('tab', { name: 'Activity' });
    await first.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(last).toBeFocused();
  });

  test('Home focuses first tab', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const first = tablist.getByRole('tab', { name: 'Overview' });
    const last = tablist.getByRole('tab', { name: 'Activity' });
    await last.focus();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
  });

  test('End focuses last tab', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const first = tablist.getByRole('tab', { name: 'Overview' });
    const last = tablist.getByRole('tab', { name: 'Activity' });
    await first.focus();
    await page.keyboard.press('End');
    await expect(last).toBeFocused();
  });

  test('TB-R03 — Tab key moves focus INTO tabpanel (panel tabindex=0)', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const tasks = tablist.getByRole('tab', { name: 'Tasks' });
    await overview.focus();
    // Tab does NOT activate next tab — it moves focus into panel
    await page.keyboard.press('Tab');
    await expect(tasks).toHaveAttribute('aria-selected', 'false');
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    // Panel should now be focused (tabindex=0 on active tabpanel)
    const panelFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('role') === 'tabpanel',
    );
    expect(panelFocused).toBe(true);
  });

  test('TB-R04 — Meta/Cmd+ArrowLeft pass-through (browser back hotkey)', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const tasks = tablist.getByRole('tab', { name: 'Tasks' });
    await tasks.click();
    await tasks.focus();
    await page.keyboard.press('Meta+ArrowLeft');
    await expect(tasks).toHaveAttribute('aria-selected', 'true');
  });

  test('TB-R04b — Control+ArrowRight pass-through', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    await overview.focus();
    await page.keyboard.press('Control+ArrowRight');
    // Modifier press should NOT change tab
    await expect(overview).toHaveAttribute('aria-selected', 'true');
  });

  test('Manual mode: arrows move focus only; Space activates', async ({ page }) => {
    // Section 5 — "Data panels" tablist has activationMode="manual"
    const tablist = page.getByRole('tablist', { name: 'Data panels' });
    const analytics = tablist.getByRole('tab', { name: 'Analytics' });
    const reports = tablist.getByRole('tab', { name: 'Reports' });
    await analytics.focus();
    await page.keyboard.press('ArrowRight');
    await expect(reports).toBeFocused();
    // Focus moved but selection unchanged (manual mode)
    await expect(reports).toHaveAttribute('aria-selected', 'false');
    await expect(analytics).toHaveAttribute('aria-selected', 'true');
    // Space activates
    await page.keyboard.press(' ');
    await expect(reports).toHaveAttribute('aria-selected', 'true');
  });

  test('Manual mode: Enter activates focused tab', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Data panels' });
    const analytics = tablist.getByRole('tab', { name: 'Analytics' });
    const exports = tablist.getByRole('tab', { name: 'Exports' });
    await analytics.focus();
    await page.keyboard.press('End'); // focus last (exports) in manual mode
    await expect(exports).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(exports).toHaveAttribute('aria-selected', 'true');
  });

  test.skip('TB-R08 — Manual mode Space inside input does not activate tab [PLAYGROUND-DEP: no input inside tabpanel]', async () => {
    // Playground tabpanels have no textbox children. When added, Space inside
    // an input should not activate the focused tab (target check prevents it).
  });

  test('TB-R12 — disabled trigger skipped by arrow navigation', async ({ page }) => {
    // Section 6 "Pricing tier" — Enterprise is disabled
    const tablist = page.getByRole('tablist', { name: 'Pricing tier' });
    const team = tablist.getByRole('tab', { name: 'Team' });
    await team.focus();
    await page.keyboard.press('ArrowRight');
    // ArrowRight from Team skips Enterprise → wraps to Free
    const free = tablist.getByRole('tab', { name: 'Free' });
    await expect(free).toBeFocused();
  });

  test('TB-R12b — disabled trigger skipped by Home/End', async ({ page }) => {
    // Section 7 keyboard demo has Four disabled; Five is last enabled
    const tablist = page.getByRole('tablist', { name: 'Keyboard demo' });
    const one = tablist.getByRole('tab', { name: 'One' });
    const five = tablist.getByRole('tab', { name: 'Five' });
    await one.focus();
    await page.keyboard.press('End');
    await expect(five).toBeFocused();
  });

  test('TB-R13 — vertical orientation uses ArrowDown/ArrowUp', async ({ page }) => {
    // Section 4 — "Account settings" is vertical
    const tablist = page.getByRole('tablist', { name: 'Account settings' });
    const profile = tablist.getByRole('tab', { name: 'Profile' });
    const security = tablist.getByRole('tab', { name: 'Security' });
    await profile.focus();
    await page.keyboard.press('ArrowDown');
    await expect(security).toBeFocused();
    await expect(security).toHaveAttribute('aria-selected', 'true');
  });

  test.skip('TB-R14 — RTL mode reverses Left/Right [PLAYGROUND-DEP: no ?dir=rtl route]', async () => {
    // Tabs accepts dir="rtl". Playground has no RTL demo section.
    // When added, verify ArrowLeft moves to next tab instead of previous.
  });

  test('TB-R18 — rapid arrow key presses produce synchronous state updates', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    await tablist.getByRole('tab').first().focus();
    // Overview → Tasks → Team → Activity → Overview (4 tabs wrap back)
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const first = tablist.getByRole('tab').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');
  });

  test.skip('TB-R20 — loop=false clamps arrow nav at boundary [PLAYGROUND-DEP: no ?loop=false demo]', async () => {
    // Component accepts loop={false} on TabsList. Playground only demoes
    // default loop=true (which is verified above as wraparound).
  });
});
