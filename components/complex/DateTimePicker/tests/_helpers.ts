/**
 * Test helpers for DateTimePicker Playwright suites.
 *
 * Demo Use Cases carry unique `aria-label` on their `<DateTimePickerInput>`
 * (the combobox input) for deterministic targeting.
 */

import type { Page, Locator } from '@playwright/test';

export function pickerBy(page: Page, inputAriaLabel: string): Locator {
  return page
    .locator(`input[role="combobox"][aria-label="${inputAriaLabel}"]`)
    .locator('xpath=..');
}

export function inputOf(picker: Locator): Locator {
  return picker.locator('input[role="combobox"]').first();
}

export function dialogOf(page: Page): Locator {
  return page.locator('div[role="dialog"]').first();
}

export async function openPicker(picker: Locator): Promise<void> {
  const input = inputOf(picker);
  await input.focus();
  await input.press('Alt+ArrowDown');
}

export function calendarCellByIso(scope: Locator | Page, iso: string): Locator {
  return scope.locator(`button[data-calendar-cell="${iso}"]`);
}

export function hiddenInputOf(picker: Locator, name: string): Locator {
  return picker.locator(`input[type="hidden"][name="${name}"]`);
}

export function timeGroupOf(page: Page): Locator {
  return page.locator('div[role="dialog"] div[role="group"][aria-label="Time"]').first();
}

export function hourSpinOf(page: Page): Locator {
  return page.locator(
    'div[role="dialog"] input[role="spinbutton"][data-time-field="h"]',
  );
}

export function minuteSpinOf(page: Page): Locator {
  return page.locator(
    'div[role="dialog"] input[role="spinbutton"][data-time-field="m"]',
  );
}
