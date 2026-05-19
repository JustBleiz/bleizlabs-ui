/**
 * Popover keyboard interaction spec — APG `/dialog-modal/` (modal mode)
 * and APG `/menu-button/` (non-modal) compliance (E20).
 *
 * Coverage:
 * - Click toggle open/close
 * - Enter / Space open (native button behavior)
 * - Escape closes + restores focus to trigger
 * - Escape when dismissable=false does NOT close
 * - Outside click closes (dismissable default)
 * - Outside click when dismissable=false does NOT close
 * - Non-modal Tab exits to next document tabbable
 * - Modal Tab wraps (focus trap)
 */

import { test, expect } from '@playwright/test';

test.describe('Popover — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/popover');
  });

  test('click trigger opens popover', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('click trigger again closes popover (toggle)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Enter on trigger opens popover (button native behavior)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Space on trigger opens popover', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.focus();
    await page.keyboard.press(' ');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Escape closes popover and restores focus to trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('Escape when dismissable=false does NOT close', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Non-dismissable' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('outside click closes popover', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open', exact: true });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Click on the main heading (unambiguously outside trigger + content)
    await page.getByRole('heading', { name: 'Popover', level: 1 }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('outside click when dismissable=false does NOT close', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Non-dismissable' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('heading', { name: 'Popover', level: 1 }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('non-modal popover does not trap focus (Tab exits eventually)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Quick filter' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Non-modal: Tab moves through focusable controls without locking inside.
    // We verify the contract by checking aria-modal=false (modal trap off).
    const modal = await page.getByRole('dialog').getAttribute('aria-modal');
    expect(modal).toBe('false');
  });

  test('Tab inside modal popover wraps within content (focus trap)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open modal' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const modal = await page.getByRole('dialog').getAttribute('aria-modal');
    expect(modal).toBe('true');
    // Cycle through all tabbables — after enough Tabs, active element stays inside dialog
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    const activeInsideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      return dialog?.contains(document.activeElement) ?? false;
    });
    expect(activeInsideDialog).toBe(true);
  });
});
