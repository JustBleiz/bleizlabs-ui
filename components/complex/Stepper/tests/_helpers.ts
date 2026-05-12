/**
 * Stepper test helpers.
 *
 * Demo route at `/components/stepper`. Each `<Stepper>` carries a unique
 * `aria-label` for deterministic targeting via the landmark or wrapper.
 */

import type { Page, Locator } from '@playwright/test';

export function stepperBy(page: Page, ariaLabel: string): Locator {
  // Interactive mode renders <nav>; visual mode renders <div>. Either way
  // the data-orientation/data-size attrs hang on a single root element that
  // carries the aria-label.
  return page.locator(`[aria-label="${ariaLabel}"]`).first();
}

export function navBy(page: Page, ariaLabel: string): Locator {
  return page.locator(`nav[aria-label="${ariaLabel}"]`);
}

export function listOf(stepper: Locator): Locator {
  // In interactive mode the <ol> is nested inside <nav>; in visual mode
  // the root IS the <div> wrapping the <ol>. Both contain `ol[role=list]`.
  return stepper.locator('ol[role="list"]').first();
}

export function stepsOf(stepper: Locator): Locator {
  return stepper.locator('li[data-status]');
}

export function stepByLabel(stepper: Locator, label: string): Locator {
  return stepper.locator(`li[data-status]`).filter({ hasText: label });
}

export function clickableStepByIndex(
  stepper: Locator,
  index: number,
): Locator {
  return stepper.locator(`button[data-step-clickable="true"][data-step-index="${index}"]`);
}

export function liveRegionOf(stepper: Locator): Locator {
  return stepper.locator('[role="status"][aria-live="polite"]').first();
}

export function activeStep(stepper: Locator): Locator {
  return stepper.locator('li[aria-current="step"]');
}
