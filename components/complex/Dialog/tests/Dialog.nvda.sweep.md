# Dialog — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Dialog`
**Playground:** http://localhost:3000/components/dialog
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting inside dialog
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger button — NVDA: `<trigger label> button`
- [ ] Trigger does NOT expose aria-expanded (Dialog is not disclosure)
- [ ] Description (aria-describedby on trigger, if any) reads after name

## Keyboard activation

- [ ] Enter on trigger — dialog opens; NVDA announces: `<title> dialog` + description (if present) + first focused element
- [ ] Space on trigger — same behavior as Enter
- [ ] Role="dialog" + aria-modal="true" announce

## Focus management

- [ ] Initial focus lands on first tabbable element in dialog body (APG default) OR explicit initialFocusRef target
- [ ] Focus ring visible
- [ ] Tab cycles forward within dialog; Shift+Tab cycles backward — NEVER escapes to underlying page
- [ ] Escape closes dialog (unless closeOnEscape=false); focus returns to trigger
- [ ] Overlay click closes dialog (if closeOnOverlayClick=true); focus returns to trigger
- [ ] Close button (X) reads `Close dialog button` (NOT just "Close")
- [ ] Enter on Close button closes dialog; focus returns to trigger

## Live regions / announcements

- [ ] On open: NVDA announces dialog title (via aria-labelledby pointing to Heading) + description (via aria-describedby) + first focused element
- [ ] aria-describedby is ONLY present when description prop is set (per Radix #3007 fix — no empty describedby)

## Navigation within component

- [ ] Tab order: Close button (X) → body interactive elements → footer actions → wraps back to Close
- [ ] NVDA browse-mode cursor CANNOT enter elements outside dialog (siblings are inert / aria-hidden)
- [ ] Reading full document with NVDA+ArrowDown in browse mode: only dialog content is reachable

## Disabled states

- [ ] Disabled body controls announce "disabled"
- [ ] Disabled footer buttons announce "disabled"

## Edge cases specific to Dialog

- [ ] Siblings outside dialog have inert attribute (or aria-hidden="true") — verify underlying headings/landmarks don't appear in NVDA's landmark list (insert+F7)
- [ ] Scroll lock applied to body — NVDA virtual cursor focus stays inside dialog content area
- [ ] Multi-dialog stacking: if opening dialog-within-dialog, focus trap moves to innermost; Escape closes innermost only
- [ ] Dialog title is a heading (h2 typically) — announces as heading in browse mode
- [ ] Nested interactive elements (e.g., Combobox inside Dialog): combobox popup does NOT break focus trap — verify
- [ ] Long dialog with scroll: NVDA arrows scroll content; PgUp/PgDn work

## Known NVDA-specific quirks

- NVDA may briefly announce body content BEFORE title — ensure aria-labelledby wiring is on the dialog root so title is read first
- On Escape close, NVDA sometimes pre-reads trigger before DOM settles — focus restoration should be synchronous
- If description is long, NVDA reads full text on open — testers may need patience; can interrupt with Ctrl

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
