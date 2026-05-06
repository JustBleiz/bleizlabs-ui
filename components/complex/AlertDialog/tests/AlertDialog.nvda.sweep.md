# AlertDialog — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/AlertDialog`
**Playground:** http://localhost:3000/components/alert-dialog
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running (insert+N to open settings if needed)
- [ ] Speech rate set to a speed comfortable for review (default 50)
- [ ] Browse mode OFF when interacting with the component (NVDA+Space toggles)
- [ ] Dev server running (`npm run dev` or prod build on :3000)
- [ ] Playground page loaded, focus at top of document

## Role + name + state announcements (initial)

- [ ] Tab to trigger button — NVDA announces: `<trigger name> button` (e.g., `Delete account button`)
- [ ] No stale aria-expanded on trigger (AlertDialog trigger is not disclosure — does not expose `expanded`)
- [ ] Description (if any) reads after name

## Keyboard activation

- [ ] Press Enter on trigger — AlertDialog opens
- [ ] Press Space on trigger — AlertDialog opens
- [ ] On open, NVDA announces: `<title> dialog` then body text then first focused action button
- [ ] Role announces as `alertdialog` (NVDA reads "alert dialog" or "dialog" — both acceptable)

## Focus management

- [ ] Initial focus lands on the LEAST destructive action (per APG: Cancel by default, NOT the destructive "Delete")
- [ ] Focus is visible (CSS focus ring + NVDA focus tracking)
- [ ] Tab cycles within dialog only — focus never escapes to underlying page
- [ ] Shift+Tab wraps backward within dialog
- [ ] Escape closes dialog — focus returns to trigger
- [ ] Clicking overlay: confirm expected behavior (AlertDialog typically does NOT close on overlay click — more aggressive than Dialog)
- [ ] After close, trigger re-announces on focus

## Live regions / announcements

- [ ] Dialog content itself is announced on open (title + description per aria-labelledby / aria-describedby)
- [ ] `aria-describedby` only present when description prop is supplied (avoid empty describedby)

## Navigation within component

- [ ] Tab / Shift+Tab traverses all interactive elements in order: Cancel, Confirm (or as designed)
- [ ] NVDA browse-mode arrow keys CAN read dialog content but CANNOT move to elements outside dialog (inert/aria-hidden on siblings)

## Disabled states

- [ ] If action button is disabled (e.g., during confirmation in-flight), NVDA announces "disabled"
- [ ] Prefer `aria-disabled` for SR discoverability when button should remain focusable

## Edge cases specific to AlertDialog

- [ ] Non-dismissable by overlay click — NVDA users cannot "click outside" to escape; Escape is the only keyboard escape
- [ ] If destructive action is explicitly focused by intent (non-default), verify tester is aware
- [ ] Close button (X) — if present — reads "Close" and is reachable via Tab
- [ ] Underlying page content is NOT in virtual cursor range (inert applied)

## Known NVDA-specific quirks

- NVDA occasionally reads `role="alertdialog"` as plain "dialog" — acceptable per APG (both role types valid)
- When `aria-describedby` points to multi-paragraph text, NVDA reads full concatenation on open — expected
- Focus trap: on rapid Tab spam, ensure NVDA stays within dialog (no leak to browser chrome)

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
