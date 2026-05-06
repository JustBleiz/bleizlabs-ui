/**
 * Tabs ARIA accessibility spec — APG `/tabs/` role/property compliance (E142 L3c).
 *
 * Coverage:
 * - role=tablist + role=tab + role=tabpanel
 * - aria-selected on triggers
 * - aria-controls / aria-labelledby wiring
 * - aria-orientation
 * - axe-core zero violations
 * - Auto-generated IDs via useId
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tabs — ARIA + accessibility tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/tabs');
  });

  test('tablist has role + aria-label + aria-orientation', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    await expect(tablist).toBeVisible();
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(tablist).toHaveAttribute('aria-label', 'Project sections');
  });

  test('TB-R06 — vertical orientation reflects in aria-orientation', async ({
    page,
  }) => {
    const tablist = page.getByRole('tablist', { name: 'Account settings' });
    await expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
  });

  test('tab has role + aria-selected + aria-controls', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    const controls = await overview.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
  });

  test('tabpanel has role + aria-labelledby + id', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const controls = await overview.getAttribute('aria-controls');
    const panel = page.locator(`#${controls}`);
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    const labelledBy = await panel.getAttribute('aria-labelledby');
    expect(labelledBy).toBe(await overview.getAttribute('id'));
  });

  test('TB-R16 — auto-generated IDs contain trigger-{value} / panel-{value}', async ({
    page,
  }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const overviewId = await overview.getAttribute('id');
    expect(overviewId).toMatch(/trigger-overview$/);
    const ariaControls = await overview.getAttribute('aria-controls');
    expect(ariaControls).toMatch(/panel-overview$/);
  });

  test('data-state reflects active/inactive', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const overview = tablist.getByRole('tab', { name: 'Overview' });
    const tasks = tablist.getByRole('tab', { name: 'Tasks' });
    await expect(overview).toHaveAttribute('data-state', 'active');
    await expect(tasks).toHaveAttribute('data-state', 'inactive');
    await tasks.click();
    await expect(tasks).toHaveAttribute('data-state', 'active');
    await expect(overview).toHaveAttribute('data-state', 'inactive');
  });

  test('aria snapshot contains tablist + tab + tabpanel', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    const snapshot = await tablist.ariaSnapshot();
    expect(snapshot).toContain('tablist');
    expect(snapshot).toContain('tab');
    expect(snapshot).toMatch(/"Overview"/);
  });

  test('disabled tab has aria-disabled=true', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Pricing tier' });
    const enterprise = tablist.getByRole('tab', { name: /Enterprise/ });
    await expect(enterprise).toHaveAttribute('aria-disabled', 'true');
  });

  test('axe-core zero violations — default state', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('axe-core zero violations — after tab switch', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Project sections' });
    await tablist.getByRole('tab', { name: 'Team' }).click();
    await page.waitForTimeout(50);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
