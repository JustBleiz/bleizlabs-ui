/**
 * Toolbar keyboard interaction spec — APG `/toolbar/` compliance.
 *
 * Coverage:
 * - Arrow navigation horizontal + vertical
 * - Home/End jump
 * - Loop=true (default) wraparound
 * - Loop=false clamp
 * - Modifier-key pass-through
 * - Disabled item skip
 * - RTL axis reversal
 * - Enter/Space NOT intercepted (bubbles to child)
 */

import { test, expect } from '@playwright/test';

test.describe('Toolbar — keyboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/toolbar');
  });

  test('ArrowRight moves focus to next item (horizontal default)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    await newBtn.focus();
    await page.keyboard.press('ArrowRight');
    await expect(openBtn).toBeFocused();
  });

  test('ArrowLeft wraps from first item to last (loop=true default)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await newBtn.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(printBtn).toBeFocused();
  });

  test('ArrowRight from last item wraps to first (loop=true default)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await printBtn.focus();
    await page.keyboard.press('ArrowRight');
    await expect(newBtn).toBeFocused();
  });

  test('Home jumps to first focusable item', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await printBtn.focus();
    await page.keyboard.press('Home');
    await expect(newBtn).toBeFocused();
  });

  test('End jumps to last focusable item', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    const printBtn = toolbar.getByRole('button', { name: 'Print' });
    await newBtn.focus();
    await page.keyboard.press('End');
    await expect(printBtn).toBeFocused();
  });

  test('disabled item is skipped during arrow navigation', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const openBtn = toolbar.getByRole('button', { name: 'Open' });
    const exportBtn = toolbar.getByRole('button', { name: 'Export' });
    await openBtn.focus();
    await page.keyboard.press('ArrowRight');
    // The Save button is disabled — arrow should land on Export, not Save.
    await expect(exportBtn).toBeFocused();
  });

  test('vertical orientation: ArrowDown moves to next, ArrowRight is a no-op', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Tools' });
    const pencil = toolbar.getByRole('button', { name: 'Pencil' });
    const eraser = toolbar.getByRole('button', { name: 'Eraser' });
    await pencil.focus();
    await page.keyboard.press('ArrowDown');
    await expect(eraser).toBeFocused();
    // ArrowRight in vertical mode is not intercepted.
    await page.keyboard.press('ArrowRight');
    await expect(eraser).toBeFocused();
  });

  test('vertical orientation: ArrowUp moves to previous', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Tools' });
    const pencil = toolbar.getByRole('button', { name: 'Pencil' });
    const eraser = toolbar.getByRole('button', { name: 'Eraser' });
    await eraser.focus();
    await page.keyboard.press('ArrowUp');
    await expect(pencil).toBeFocused();
  });

  test('loop=false clamps at last item — ArrowRight from last is a no-op', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Navigation history' });
    const reload = toolbar.getByRole('button', { name: 'Reload' });
    await reload.focus();
    await page.keyboard.press('ArrowRight');
    // Stays on Reload — no wrap-around.
    await expect(reload).toBeFocused();
  });

  test('loop=false clamps at first item — ArrowLeft from first is a no-op', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Navigation history' });
    const back = toolbar.getByRole('button', { name: 'Back' });
    await back.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(back).toBeFocused();
  });

  test('modifier + arrow does not move focus (browser hotkey pass-through)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    await newBtn.focus();
    // Cmd+ArrowRight (Meta) — should NOT advance toolbar focus.
    await page.keyboard.down('Meta');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.up('Meta');
    await expect(newBtn).toBeFocused();
  });

  test('Enter on Button child activates the button (not intercepted)', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Document actions' });
    const newBtn = toolbar.getByRole('button', { name: 'New' });
    let clicked = false;
    await page.exposeBinding('toolbarButtonClicked', () => {
      clicked = true;
    });
    await newBtn.evaluate((el) => {
      el.addEventListener('click', () =>
        (window as unknown as { toolbarButtonClicked: () => void }).toolbarButtonClicked(),
      );
    });
    await newBtn.focus();
    await page.keyboard.press('Enter');
    expect(clicked).toBe(true);
  });

  test('RTL horizontal: ArrowRight moves to PREVIOUS item', async ({ page }) => {
    const toolbar = page.getByRole('toolbar', { name: 'Editor (RTL)' });
    // dir="rtl" in toolbar — visual order is reversed but DOM order stays
    // the same. We focus the second DOM child and ArrowRight should move
    // to the first DOM child (which is the visual-right neighbor in RTL).
    const all = toolbar.getByRole('button');
    const first = all.nth(0);
    const second = all.nth(1);
    await second.focus();
    await page.keyboard.press('ArrowRight');
    await expect(first).toBeFocused();
  });
});
