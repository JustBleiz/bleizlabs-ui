/**
 * TagsInput test helpers.
 *
 * Demo route at `/components/tags-input`. Each `<TagsInput>` carries a unique
 * `aria-label` on its typing `<input>` for deterministic targeting; the
 * wrapper is reached via `.locator('xpath=..')`.
 */

import type { Page, Locator } from '@playwright/test';

export function inputBy(page: Page, ariaLabel: string): Locator {
  return page.locator(`input[type="text"][aria-label="${ariaLabel}"]`);
}

export function wrapperOf(input: Locator): Locator {
  return input.locator('xpath=..');
}

export function chipsOf(wrapper: Locator): Locator {
  return wrapper.locator('[role="listitem"]');
}

export function removeBtnOf(wrapper: Locator, tagName: string): Locator {
  return wrapper.locator(`button[aria-label="Remove ${tagName}"]`);
}

export function liveRegionOf(wrapper: Locator): Locator {
  return wrapper.locator('[role="status"][aria-live="polite"]').first();
}

export function hiddenInputOf(wrapper: Locator): Locator {
  return wrapper.locator('input[type="hidden"]').first();
}
