/**
 * Test helpers for TimeInput Playwright suites.
 *
 * Each demo Use Case renders a TimeInput with a distinct `label` prop which
 * lands as the inner `<div role="group" aria-label>` for SR users. We target
 * by that aria-label for deterministic instance selection across the demo
 * route regardless of DOM order.
 */

import type { Page, Locator } from '@playwright/test';

export function timeInputBy(page: Page, label: string): Locator {
  // role=group + aria-label lands on the inputWrap inner div; we go up one
  // level to the outer wrapper so children (hidden input, error, helper)
  // are inside the scope.
  return page.locator(`div[role="group"][aria-label="${label}"]`).locator('xpath=..');
}

export function groupOf(picker: Locator): Locator {
  return picker.locator('div[role="group"]').first();
}

export function hourFieldOf(picker: Locator): Locator {
  return picker.locator('input[role="spinbutton"][data-time-field="h"]').first();
}

export function minuteFieldOf(picker: Locator): Locator {
  return picker.locator('input[role="spinbutton"][data-time-field="m"]').first();
}

export function secondFieldOf(picker: Locator): Locator {
  return picker.locator('input[role="spinbutton"][data-time-field="s"]').first();
}

export function periodToggleOf(picker: Locator): Locator {
  return picker.locator('button[role="switch"]').first();
}

export function hiddenInputOf(picker: Locator, name: string): Locator {
  return picker.locator(`input[type="hidden"][name="${name}"]`);
}
