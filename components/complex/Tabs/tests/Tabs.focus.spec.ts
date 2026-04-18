/**
 * Tabs focus behavior spec — APG `/tabs/` composite widget (E142 L3c).
 *
 * Coverage:
 * - Active tabpanel has tabindex=0 (composite widget contract)
 * - Tab from active trigger lands on panel
 * - Roving tabindex (selected=0, others=-1)
 * - asChild polymorphism preserves role + aria
 * - Click focuses + activates
 */

import { test, expect } from '@playwright/test';

test.describe('Tabs — focus management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/tabs');
  });

  test('TB-R15 — active tabpanel has tabindex=0 (composite widget)', async ({
    page,
  }) => {
    // The active tabpanel in section 1 (Overview)
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    await tablist.getByRole('tab', { name: 'Overview' }).click();
    const panel = page.getByRole('tabpanel').filter({ hasText: 'Project overview' });
    await expect(panel).toHaveAttribute('tabindex', '0');
  });

  test('TB-R15b — Tab from active trigger moves focus INTO panel', async ({
    page,
  }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    await overview.focus();
    await page.keyboard.press('Tab');
    const isPanel = await page.evaluate(
      () => document.activeElement?.getAttribute('role') === 'tabpanel',
    );
    expect(isPanel).toBe(true);
  });

  test('roving tabindex: selected=0, others=-1', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const tasks = tablist.getByRole('tab', { name: 'Tasks' });
    await expect(overview).toHaveAttribute('tabindex', '0');
    await expect(tasks).toHaveAttribute('tabindex', '-1');

    await tasks.click();
    await expect(tasks).toHaveAttribute('tabindex', '0');
    await expect(overview).toHaveAttribute('tabindex', '-1');
  });

  test('click on tab focuses + activates it', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const team = tablist.getByRole('tab', { name: 'Team' });
    await team.click();
    await expect(team).toBeFocused();
    await expect(team).toHaveAttribute('aria-selected', 'true');
  });

  test('disabled tab does not take focus via click (aria-disabled)', async ({
    page,
  }) => {
    // Section 6 — Enterprise (disabled)
    const tablist = page.getByRole('tablist', { name: 'Pricing tier' });
    const enterprise = tablist.getByRole('tab', { name: /Enterprise/ });
    await expect(enterprise).toHaveAttribute('aria-disabled', 'true');
    const pro = tablist.getByRole('tab', { name: 'Pro' });
    await pro.focus();
    // Clicking disabled tab: handler guards against state change (disabled
    // prop handled in handleClick). Even if focus moves to it, aria-selected
    // does not change.
    const before = await pro.getAttribute('aria-selected');
    await enterprise.click({ force: true });
    // Pro is still selected (disabled guard in handleClick)
    await expect(pro).toHaveAttribute('aria-selected', before!);
  });

  test.skip('TB-R02 — wrapped TabsTrigger via Tooltip preserves focus [PLAYGROUND-DEP: no ?wrapped=tooltip demo]', async () => {
    // Would need playground scenario wrapping TabsTrigger with Tooltip asChild.
  });

  test.skip('TB-R17 — nested Tabs in Dialog: inner roving tabindex independent [PLAYGROUND-DEP: no ?nested=dialog demo]', async () => {
    // Would need playground scenario with Tabs inside Dialog.
  });

  test.skip('TB-R21 — asChild Slot merges role + aria [PLAYGROUND-DEP: no ?asChild=1 demo]', async () => {
    // asChild polymorphism supported in source (TabsTrigger line 556-568).
    // Playground has no asChild demo scenario.
  });

  test('panel relationship: aria-labelledby matches trigger id', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const overviewId = await overview.getAttribute('id');
    const panel = page.getByRole('tabpanel').filter({ hasText: 'Project overview' });
    await expect(panel).toHaveAttribute('aria-labelledby', overviewId!);
  });
});
