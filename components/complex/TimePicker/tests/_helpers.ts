/**
 * Test helpers for TimePicker Playwright suites.
 *
 * Each demo Use Case carries a unique `aria-label` on its `<TimePickerInput>`
 * (the `<input role="combobox">`), so tests can target deterministic
 * instances regardless of DOM order.
 */

import type { Page, Locator } from '@playwright/test';

export function pickerBy(page: Page, inputAriaLabel: string): Locator {
  // The input owns the aria-label. The dialog is portal-rendered. We use
  // the input itself as the entry point and navigate outwards via xpath.
  return page.locator(`input[role="combobox"][aria-label="${inputAriaLabel}"]`).locator('xpath=..');
}

export function inputOf(picker: Locator): Locator {
  return picker.locator('input[role="combobox"]').first();
}

export function dialogOf(page: Page): Locator {
  return page.locator('div[role="dialog"]').first();
}

export function listboxOf(page: Page, field: 'h' | 'm' | 's' | 'p'): Locator {
  return page.locator(`ul[data-listbox="${field}"]`).first();
}

export function optionByValue(page: Page, field: 'h' | 'm' | 's' | 'p', value: string): Locator {
  return page.locator(`ul[data-listbox="${field}"] li[data-option-value="${value}"]`);
}

export async function openPicker(picker: Locator): Promise<void> {
  const input = inputOf(picker);
  await input.focus();
  await input.press('Alt+ArrowDown');
}

export function hiddenInputOf(picker: Locator, name: string): Locator {
  return picker.locator(`input[type="hidden"][name="${name}"]`);
}
