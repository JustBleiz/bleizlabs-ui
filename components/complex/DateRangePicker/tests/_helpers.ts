/**
 * Test helpers for DateRangePicker Playwright suites.
 *
 * `rangeBy(page, label)` returns a DateRangePicker root by its aria-label —
 * each demo Use Case carries a unique aria-label so tests target deterministic
 * instances regardless of DOM order (per audit-meta-finding I4).
 *
 * `cellByIso(picker, iso)` returns the Calendar cell button for a specific
 * ISO date inside the picker's open popover.
 */

import type { Page, Locator } from '@playwright/test';

export function allRangePickers(page: Page): Locator {
  // Demo route renders DateRangePicker roots with aria-label per use case.
  // The aria-label lands on the root <div> rendered by DateRangePicker (via
  // {...rest} spread); selecting by [aria-label] catches the root.
  return page.locator(
    'div[aria-label*="range" i], div[aria-label*="month" i], div[aria-label*="weekend" i], div[aria-label*="required" i]',
  );
}

export function rangeBy(page: Page, label: string): Locator {
  return page.locator(`div[aria-label="${label}"]`);
}

export function inputOf(picker: Locator): Locator {
  return picker.locator('input[role="combobox"]');
}

export function dialogOf(page: Page): Locator {
  // Dialog renders into FloatingPortal — search at page level
  return page.locator('div[role="dialog"]').first();
}

export function cellByIso(scope: Locator | Page, iso: string): Locator {
  return scope.locator(`button[data-calendar-cell="${iso}"]`);
}

/**
 * Force-click a Calendar cell. Cells inside the popover may be outside the
 * viewport on small windows / certain placements — Playwright's actionability
 * check (including `force:true`) still fails on out-of-viewport elements.
 * Mirrors DataTable test precedent: dispatch native click event programmatically
 * to bypass viewport-bound interaction.
 */
export async function clickCell(scope: Locator | Page, iso: string): Promise<boolean> {
  const cell = cellByIso(scope, iso);
  if ((await cell.count()) === 0) return false;
  await cell.dispatchEvent('click');
  return true;
}

export async function openPicker(picker: Locator): Promise<void> {
  // Mirror DatePicker pattern: input click does NOT open popover (just focuses).
  // Either click the calendar icon button, or press Alt+ArrowDown on the input.
  // Icon button is more reliable cross-test (mouse-driven open).
  const input = inputOf(picker);
  await input.focus();
  await input.press('Alt+ArrowDown');
}
