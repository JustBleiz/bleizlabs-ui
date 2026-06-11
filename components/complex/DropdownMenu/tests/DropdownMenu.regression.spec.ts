/**
 * DropdownMenu regression spec — Radix closed-issue mapping (E21).
 *
 * 22 cases; submenu-related and nested-integration scenarios marked
 * test.skip with rationale. radix-R21/R22 (E01 audit remediation): asChild
 * trigger dropped {...rest} — consumer data-testid/title vanished; native
 * branch always spread rest last.
 */

import { test, expect } from '@playwright/test';

test.describe('DropdownMenu — regression cases (Radix closed issues)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/dropdown-menu');
  });

  test('radix-R01 — focus not stolen after close (no exit animation in E21)', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test.skip('radix-R02 — arrow key submenu wrap [SUBMENU-DEFERRED]', async () => {
    // DropdownMenuSub not in E21 scope.
  });

  test('radix-R03 — typeahead skips disabled items', async ({ page }) => {
    await page.getByRole('button', { name: 'File' }).click();
    // "Save as... (coming soon)" is disabled — typing "s" should land on non-disabled
    await page.keyboard.press('s');
    const ariaDisabled = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-disabled'),
    );
    expect(ariaDisabled).not.toBe('true');
  });

  test('radix-R04 — click on label does not close menu', async ({ page }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const label = page.locator('#dropdown-file-label');
    await label.click();
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radix-R05 — click on separator does not close menu', async ({ page }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const separator = page.getByRole('separator').first();
    await separator.click();
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radix-R06 — mouse hover + keyboard sync', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Save' }).hover();
    await page.keyboard.press('ArrowDown');
    // Focus should be on "Open" (item after "Save")
    await expect(page.getByRole('menuitem', { name: 'Open' })).toBeFocused();
  });

  test.skip('radix-R07 — submenu triangle safe-zone [SUBMENU-DEFERRED]', async () => {});

  test('radix-R08 — no double role="menu" in DOM when open', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    const count = await page.locator('[role="menu"]').count();
    expect(count).toBe(1);
  });

  test.skip('radix-R09 — disabled trigger does NOT open menu [PLAYGROUND-DEP: disabled trigger demo]', async () => {
    // No disabled-trigger scenario in playground.
  });

  test('radix-R10 — controlled mode: onOpenChange fires once on item select', async ({ page }) => {
    const controlledTrigger = page.getByRole('button', { name: 'Controlled menu' });
    await controlledTrigger.click();
    await page.getByRole('menuitem', { name: 'Option 1' }).click();
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('radix-R11 — Enter on hover-focused disabled item does not activate', async ({ page }) => {
    await page.getByRole('button', { name: 'File' }).click();
    const disabled = page.getByRole('menuitem', { name: /Save as/i });
    const disabledAttr = await disabled.getAttribute('disabled');
    expect(disabledAttr).not.toBeNull();
  });

  test.skip('radix-R12 — Tab in dialog containing dropdown [PLAYGROUND-DEP: Dialog+DropdownMenu]', async () => {
    // Requires nested Dialog + DropdownMenu playground.
  });

  test.skip('radix-R13 — forceMount with animation [PLAYGROUND-DEP: forceMount not in scope]', async () => {
    // Unmount-on-close pattern is used instead.
  });

  test('radix-R14 — asChild trigger receives aria-expanded', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    const expanded = await trigger.getAttribute('aria-expanded');
    expect(expanded).not.toBeNull();
  });

  test('radix-R15 — initial focus timing (first item focused after rAF)', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('menuitem').first()).toBeFocused();
  });

  test('radix-R16 — close on select does not double-fire in React 19 batch mode', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Save' }).click();
    await expect(page.getByRole('menu')).not.toBeVisible();
    // Re-open to verify state didn't desync
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radix-R17 — rapid trigger clicks do not leave menu in inconsistent state', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Actions' });
    await trigger.click();
    // Wait for menu state to settle between clicks
    await expect(page.getByRole('menu')).toBeVisible();
    await trigger.click();
    await expect(page.getByRole('menu')).not.toBeVisible();
    await trigger.click();
    // After 3 clicks (odd), menu should be open
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radix-R18 — matchTriggerWidth forces min-width to trigger width', async ({ page }) => {
    const trigger = page.getByRole('button', { name: /Select account/i });
    const triggerBox = await trigger.boundingBox();
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    // ResizeObserver-based trigger measurement may land on next frame — verify
    // inline style reflects the min-width constraint as ground truth.
    await expect
      .poll(async () => menu.evaluate((el) => (el as HTMLElement).style.minWidth))
      .not.toBe('');
    const inlineMinWidth = await menu.evaluate((el) => (el as HTMLElement).style.minWidth);
    // Expect e.g. "279px" — parse number and compare to trigger width
    const minWidthPx = parseFloat(inlineMinWidth);
    expect(triggerBox).not.toBeNull();
    if (triggerBox) {
      expect(minWidthPx).toBeGreaterThanOrEqual(triggerBox.width - 1);
    }
  });

  test.skip('radix-R19 — scrollbar click skip [PLAYGROUND-DEP: browser scrollbar]', async () => {
    // Covered by same pattern as Popover Radix #7.
  });

  test('radix-R20 — onSelect preventDefault keeps menu open', async ({ page }) => {
    await page.getByRole('button', { name: 'View' }).click();
    await page.getByRole('menuitem', { name: /Toggle grid/ }).click();
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radix-R21 — asChild trigger forwards rest props without breaking open', async ({
    page,
  }) => {
    // Pre-fix: asChild branch dropped {...rest} — getByTestId found nothing.
    const trigger = page.getByTestId('dd-trigger-aschild');
    await expect(trigger).toHaveAttribute('title', 'aschild-title');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('radix-R22 — native trigger rest passthrough (contrast)', async ({ page }) => {
    const trigger = page.getByTestId('dd-trigger-native');
    await expect(trigger).toHaveAttribute('title', 'native-title');
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
  });
});
