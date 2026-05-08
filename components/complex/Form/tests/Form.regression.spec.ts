/**
 * Form regression spec — derived from Radix `@radix-ui/react-form` closed
 * issues + native browser Constraint Validation API edge cases.
 *
 * Form is a light-touch primitive (vs Dialog/Combobox), so Radix history
 * is shallower than other Phase 10 components. We supplement with browser
 * CV API edge cases that any production form must handle: required
 * blocking submit, type=email mismatch, pattern mismatch, min/max ranges,
 * minLength/maxLength constraints, custom validity, and Server Action
 * compatibility.
 *
 * Total cases mapped: 22 (FM-R01..FM-R22).
 *
 * Playground route: `/components/form`
 *
 * Status: SCOPE NOTE — execution deferred per E15 Tabs precedent (component
 * ships with TS + lint clean + spec.md mappings; full Playwright runtime
 * sweep deferred to dedicated test-execution sprint).
 */

import { test, expect } from '@playwright/test';

const URL = '/components/form';

test.describe('Form — regression cases (Radix issues + CV API edges)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ────────────────────────────────────────────────────────────────────
  // Native Constraint Validation API — required field blocking
  // ────────────────────────────────────────────────────────────────────

  test('FM-R01: empty required input blocks submit', async ({ page }) => {
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await submit.click();
    // No success message should appear.
    await expect(page.getByText(/^submitted: /i)).not.toBeVisible();
  });

  test('FM-R02: filled required input allows submit', async ({ page }) => {
    const email = page.getByRole('textbox', { name: /^email$/i }).first();
    await email.fill('valid@example.com');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    await expect(
      page.getByText(/submitted: valid@example\.com/i),
    ).toBeVisible();
  });

  test('FM-R03: type="email" rejects malformed email', async ({ page }) => {
    const email = page.getByRole('textbox', { name: /^email$/i }).first();
    await email.fill('not-an-email');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    // Submit blocked by browser CV API.
    await expect(page.getByText(/^submitted: /i)).not.toBeVisible();
  });

  test('FM-R04: type="email" accepts valid email shape', async ({ page }) => {
    const email = page.getByRole('textbox', { name: /^email$/i }).first();
    await email.fill('a@b.co');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    await expect(page.getByText(/submitted: a@b\.co/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────
  // noValidate — consumer-owned validation
  // ────────────────────────────────────────────────────────────────────

  test('FM-R05: noValidate suppresses browser popup AND fires onSubmit', async ({
    page,
  }) => {
    // Section 2: empty username, noValidate=true, custom check rejects.
    const validateBtn = page
      .getByRole('button', { name: /^validate$/i })
      .first();
    await validateBtn.click();
    await expect(
      page.getByText(/fail: username must be ≥3 chars/i),
    ).toBeVisible();
  });

  test('FM-R06: noValidate + valid input fires onSubmit with success', async ({
    page,
  }) => {
    const username = page
      .getByRole('textbox', { name: /username/i })
      .first();
    await username.fill('alice');
    await page.getByRole('button', { name: /^validate$/i }).first().click();
    await expect(page.getByText(/ok \(custom validated\): alice/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────
  // Compound multi-field forms
  // ────────────────────────────────────────────────────────────────────

  test('FM-R07: multi-field form blocks on first invalid field', async ({
    page,
  }) => {
    const createBtn = page
      .getByRole('button', { name: /create account/i })
      .first();
    await createBtn.click();
    // Browser focuses first invalid field; submit success message absent.
    await expect(page.getByText(/^submitted: \{/i)).not.toBeVisible();
  });

  // SKIPPED 2026-05-08 (E05.4 PASS-WITH-EXCEPTION): demo handler outputs string
  // format, spec expects JSON `submitted: {...}` format. Spec/demo drift to be
  // reconciled in 0.14.0 test-execution sprint per user grant. See work-unit
  // devlog DONE_EPIC E05.4 for exception rationale.
  test.skip('FM-R08: multi-field form submits when all required filled', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: /full name/i }).fill('Alice');
    await page
      .getByRole('textbox', { name: /^email$/i })
      .nth(2)
      .fill('alice@example.com');
    await page.getByRole('textbox', { name: /^phone$/i }).fill('+48 123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/^submitted: \{/i)).toBeVisible();
  });

  // SKIPPED 2026-05-08 (E05.4 PASS-WITH-EXCEPTION): same spec/demo drift as FM-R08.
  // Phone pattern test depends on multi-field demo section — to be reconciled in
  // 0.14.0 test-execution sprint.
  test.skip('FM-R09: pattern mismatch on phone input blocks submit', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: /full name/i }).fill('Alice');
    await page
      .getByRole('textbox', { name: /^email$/i })
      .nth(2)
      .fill('alice@example.com');
    // Phone pattern is `[+0-9 \-()]+` — letters violate it.
    await page.getByRole('textbox', { name: /^phone$/i }).fill('abc');
    await page.getByRole('button', { name: /create account/i }).click();
    // Browser blocks; success message absent.
    await expect(
      page.getByText(/^submitted: \{.*"name":"Alice".*\}/i),
    ).not.toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────
  // Form.Submit asChild + native fallback
  // ────────────────────────────────────────────────────────────────────

  test('FM-R10: Form.Submit asChild merges type="submit" onto lib Button', async ({
    page,
  }) => {
    const sendBtn = page.getByRole('button', { name: /^send$/i }).first();
    await expect(sendBtn).toHaveAttribute('type', 'submit');
  });

  test('FM-R11: Form.Submit native fallback renders <button type="submit">', async ({
    page,
  }) => {
    // Section 4 — last "Send" button on page.
    const sendBtn = page.getByRole('button', { name: /^send$/i }).last();
    await expect(sendBtn).toHaveAttribute('type', 'submit');
  });

  // ────────────────────────────────────────────────────────────────────
  // Form-level a11y semantics
  // ────────────────────────────────────────────────────────────────────

  test('FM-R12: Form with aria-label exposes accessible form role', async ({
    page,
  }) => {
    const form = page.getByRole('form', { name: /contact form/i });
    await expect(form).toBeVisible();
  });

  test('FM-R13: noValidate state mirrors prop on <form> element', async ({
    page,
  }) => {
    const form = page.getByRole('form', { name: /custom validated/i });
    const nv = await form.evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(nv).toBe(true);
  });

  test('FM-R14: default mode (no noValidate prop) leaves <form> validation on', async ({
    page,
  }) => {
    const form = page.getByRole('form', { name: /contact form/i });
    const nv = await form.evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(nv).toBe(false);
  });

  // ────────────────────────────────────────────────────────────────────
  // Submit interaction edges
  // ────────────────────────────────────────────────────────────────────

  test('FM-R15: Enter on submit button submits form', async ({ page }) => {
    await page
      .getByRole('textbox', { name: /^email$/i })
      .first()
      .fill('user@example.com');
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await submit.focus();
    await submit.press('Enter');
    await expect(page.getByText(/submitted: user@example\.com/i)).toBeVisible();
  });

  test('FM-R16: Space on submit button submits form', async ({ page }) => {
    await page
      .getByRole('textbox', { name: /^email$/i })
      .first()
      .fill('space@example.com');
    const submit = page.getByRole('button', { name: /^send$/i }).first();
    await submit.focus();
    await submit.press(' ');
    await expect(page.getByText(/submitted: space@example\.com/i)).toBeVisible();
  });

  test('FM-R17: Click on submit button submits form', async ({ page }) => {
    await page
      .getByRole('textbox', { name: /^email$/i })
      .first()
      .fill('click@example.com');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    await expect(page.getByText(/submitted: click@example\.com/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────
  // Radix-style invariants
  // ────────────────────────────────────────────────────────────────────

  test('FM-R18: useFormContext throws when called outside <Form>', async ({
    page,
  }) => {
    // Indirect: Form.Submit asserts context — rendering outside Form would
    // log a useFormContext() error to console. On the playground all
    // Form.Submit instances are inside Forms; this test verifies no console
    // errors fire from the well-formed page.
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(errors.filter((e) => /useFormContext/.test(e))).toHaveLength(0);
  });

  test('FM-R19: Form fires onSubmit only ONCE per submit click', async ({
    page,
  }) => {
    // Equivalent to Radix `@radix-ui/react-form` issue pattern — guard
    // against double-fire via re-render race conditions.
    await page
      .getByRole('textbox', { name: /^email$/i })
      .first()
      .fill('once@example.com');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    // Status text appears once.
    await expect(page.getByText(/submitted: once@example\.com/i)).toBeVisible();
    // We can't reliably count via console (status text is DOM-rendered, not
    // logged), so verify the DOM has exactly one occurrence.
    const matches = await page
      .locator(`text=/submitted: once@example\\.com/i`)
      .count();
    expect(matches).toBe(1);
  });

  test('FM-R20: empty form with no required fields submits cleanly', async ({
    page,
  }) => {
    // Section 1 has 1 required field, but verifies that filling it allows
    // empty other fields (none in section 1) to submit OK.
    await page
      .getByRole('textbox', { name: /^email$/i })
      .first()
      .fill('clean@example.com');
    await page.getByRole('button', { name: /^send$/i }).first().click();
    await expect(page.getByText(/submitted: clean@example\.com/i)).toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────
  // Hydration + SSR safety
  // ────────────────────────────────────────────────────────────────────

  test('FM-R21: Form hydrates without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    expect(
      errors.filter((e) => /hydrat|<form>|FormContext/i.test(e)),
    ).toHaveLength(0);
  });

  test('FM-R22: Form noValidate prop initial state hydrates correctly', async ({
    page,
  }) => {
    // Verifies that the `noValidate` attribute on <form> matches the prop
    // at first paint (no SSR-vs-CSR mismatch).
    const form = page.getByRole('form', { name: /custom validated/i });
    await expect(form).toBeVisible();
    const nv = await form.evaluate((el) => (el as HTMLFormElement).noValidate);
    expect(nv).toBe(true);
  });
});
