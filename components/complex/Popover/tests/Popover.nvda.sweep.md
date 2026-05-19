# Popover — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Popover`
**Playground:** http://localhost:3000/components/popover
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (non-modal dialog) OR https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ depending on content
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS [ ] PASS with notes [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger — NVDA: `<label> button, has popup dialog, collapsed`
- [ ] aria-haspopup="dialog" + aria-expanded="false" announce
- [ ] Description (if any) reads after name

## Keyboard activation

- [ ] Enter / Space on trigger: popover opens; NVDA: `expanded, dialog, <content>`
- [ ] Role="dialog" on popover content; aria-labelledby points to a heading inside popover
- [ ] Non-modal: focus moves into popover but underlying page is NOT inerted

## Focus management

- [ ] On open, focus moves to first tabbable element inside popover (or explicit initialFocusRef)
- [ ] Focus ring visible
- [ ] Tab cycles within popover — OR — Tab exits popover to next page focusable (verify project policy; APG non-modal typically allows exit)
- [ ] Escape closes popover; focus returns to trigger
- [ ] Click outside closes popover; focus returns to trigger (or stays on clicked element)

## Live regions / announcements

- [ ] On open: dialog title reads via aria-labelledby
- [ ] Description (aria-describedby) reads if present
- [ ] Interactive content inside popover (forms, buttons) reachable and announce normally

## Navigation within component

- [ ] Tab traverses popover content in DOM order
- [ ] NVDA virtual cursor (browse mode) CAN enter popover content
- [ ] Virtual cursor CAN also move to underlying page (non-modal — different from Dialog)

## Disabled states

- [ ] Disabled trigger: "disabled" announced, popover does NOT open
- [ ] Disabled controls inside popover announce "disabled"

## Edge cases specific to Popover

- [ ] Non-modal: underlying page interactions still possible — verify clicking outside closes popover cleanly
- [ ] Nested popover (popover inside popover): inner popover opens, outer stays; Escape closes inner first
- [ ] Positioned via floating-ui: ensure popover stays on-screen; NVDA virtual cursor reaches content regardless of position
- [ ] Portal rendering: popover rendered at body root — aria-labelledby / aria-controls linkage must resolve
- [ ] Arrow/chevron indicator on popover: decorative, aria-hidden
- [ ] Focus-within close behavior: if trigger loses focus AND popover loses focus, popover closes

## Known NVDA-specific quirks

- Popover vs Tooltip: NVDA reads both via dialog/tooltip role; if content is interactive, dialog is correct (tooltip is read-only)
- Non-modal dialog: NVDA does NOT trap focus; user CAN Tab out; ensure this is intended
- If popover re-renders on content change, NVDA may re-announce — acceptable but monitor for spam

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
