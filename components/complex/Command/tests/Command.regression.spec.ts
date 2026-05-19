/**
 * Command regression spec (E142 L3d1).
 *
 * Coverage:
 * - CMD-R14 filter=auto substring filter
 * - CMD-R15 filter=false: no filtering (consumer-managed) [custom filter via playground section 6]
 * - CMD-R16 group auto-hide when all items filter out
 * - CMD-R18 hidden registry preserved across open/close
 * - Custom filter (startsWith) — section 6 demo
 * - Loading state shows CommandLoading
 * - SSR hydration safety
 */

import { test, expect } from '@playwright/test';

test.describe('Command — regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('CMD-R14 — filter auto mode: substring filter reduces option count', async ({ page }) => {
    await page.goto('/components/command');
    await page.getByRole('button', { name: 'Open city picker' }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    const allOptions = await dialog.getByRole('option').count();
    expect(allOptions).toBeGreaterThan(5);
    await input.fill('to');
    const filtered = await dialog.getByRole('option').count();
    expect(filtered).toBeLessThan(allOptions);
    expect(filtered).toBeGreaterThanOrEqual(1);
  });

  test('CMD-R16 — all-filter-out: CommandEmpty shows + no options visible', async ({ page }) => {
    await page.goto('/components/command');
    await page.getByRole('button', { name: 'Open city picker' }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('zxzz-no-match-123');
    const options = await dialog.getByRole('option').count();
    expect(options).toBe(0);
    await expect(dialog.getByText(/No cities found/i)).toBeVisible();
  });

  test('Custom filter (startsWith) — only prefix matches appear', async ({ page }) => {
    await page.goto('/components/command');
    await page.getByRole('button', { name: 'Open startsWith palette' }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('al');
    const options = dialog.getByRole('option');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText('Alice');
    await input.fill('ar');
    await expect(dialog.getByRole('option')).toHaveCount(0);
  });

  test('CMD-R18 — registry survives close/reopen (items re-visible after reopen)', async ({
    page,
  }) => {
    await page.goto('/components/command');
    await page.getByRole('button', { name: 'Open palette' }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('save');
    const filteredCount = await dialog.getByRole('option').count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // Reopen — search state cleared by component default; all items visible
    await page.getByRole('button', { name: 'Open palette' }).click();
    const reopenedDialog = page.getByRole('dialog');
    const reopenedCount = await reopenedDialog.getByRole('option').count();
    expect(reopenedCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('Loading state renders CommandLoading', async ({ page }) => {
    await page.goto('/components/command');
    await page.getByRole('button', { name: 'Open loading palette' }).click();
    const status = page.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/Loading/i);
  });

  test('SSR hydration: no hydration warnings on initial render', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        warnings.push(msg.text());
      }
    });
    await page.goto('/components/command');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    const hydrationWarnings = warnings.filter((w) => w.toLowerCase().includes('hydration'));
    expect(hydrationWarnings).toHaveLength(0);
  });

  test.skip('CMD-R15 — filter=false consumer-managed [PLAYGROUND-DEP: no filter={false} demo]', async () => {
    // All demos use default 'auto' or custom function filter. No
    // filter={false} example.
  });

  test.skip('CMD-R19 — virtualized command list [PLAYGROUND-DEP: virtualization deferred to v2]', async () => {});

  test.skip('CMD-R20 — nested command pages [PLAYGROUND-DEP: single-page only in v1]', async () => {});
});
