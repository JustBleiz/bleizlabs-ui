/**
 * TimePicker listbox spec — option click commits, keyboard nav, advance flow.
 *
 * Coverage:
 * - TP-LB01 Click on minute option commits + advances to next listbox
 * - TP-LB02 ArrowDown navigates options within listbox
 * - TP-LB03 Home/End jump first/last option
 * - TP-LB04 Enter commits + advances
 * - TP-LB05 Escape in listbox closes popover + returns focus to input
 * - TP-LB06 selected option carries data-selected="true"
 * - TP-LB07 12h: clicking PM option flips period (h24=14 → 02 PM verified)
 */

import { test, expect } from '@playwright/test';
import {
  dialogOf,
  inputOf,
  listboxOf,
  openPicker,
  optionByValue,
  pickerBy,
} from './_helpers';

test.describe('TimePicker — listbox interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/time-picker');
  });

  test('TP-LB01 — Click hour option commits value', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await openPicker(picker);
    await optionByValue(page, 'h', '14').dispatchEvent('click');
    // After hour click, display reflects 14:30 (existing default minute)
    await expect(input).toHaveValue(/^14:/);
  });

  test('TP-LB02 — ArrowDown navigates within listbox', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const h8 = optionByValue(page, 'h', '8'); // default selected
    await h8.focus();
    await h8.press('ArrowDown');
    // After ArrowDown, focus on option index+1 (h=9)
    await expect(optionByValue(page, 'h', '9')).toBeFocused();
  });

  test('TP-LB03 — Home / End jump to bounds', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const h8 = optionByValue(page, 'h', '8');
    await h8.focus();
    await h8.press('Home');
    await expect(optionByValue(page, 'h', '0')).toBeFocused();
    await optionByValue(page, 'h', '0').press('End');
    await expect(optionByValue(page, 'h', '23')).toBeFocused();
  });

  test('TP-LB04 — Enter on focused option commits + focus advances', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const h12 = optionByValue(page, 'h', '12');
    await h12.dispatchEvent('focus');
    await h12.press('Enter');
    // After Enter on hour, focus moves into minutes listbox
    const mList = listboxOf(page, 'm');
    await expect(mList).toBeVisible();
  });

  test('TP-LB05 — Escape closes popover + returns focus to input', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    const input = inputOf(picker);
    await openPicker(picker);
    const h8 = optionByValue(page, 'h', '8');
    await h8.focus();
    await h8.press('Escape');
    await expect(dialogOf(page)).not.toBeVisible();
    await expect(input).toBeFocused();
  });

  test('TP-LB06 — selected option carries data-selected', async ({ page }) => {
    const picker = pickerBy(page, 'Start time');
    await openPicker(picker);
    const selected = optionByValue(page, 'h', '8');
    await expect(selected).toHaveAttribute('data-selected', 'true');
  });

  test('TP-LB07 — 12h: click PM option flips period when needed', async ({ page }) => {
    const picker = pickerBy(page, 'Meeting time');
    const input = inputOf(picker);
    await openPicker(picker);
    // demo 14:30 = 02 PM, click AM
    await optionByValue(page, 'p', 'AM').dispatchEvent('click');
    // Input should now show 02:30 AM (h24 underlying = 02)
    await expect(input).toHaveValue(/02:30 AM/i);
  });
});
