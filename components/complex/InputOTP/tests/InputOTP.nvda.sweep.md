# InputOTP — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/InputOTP`
**Playground:** http://localhost:3000/components/input-otp
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/ (no dedicated OTP pattern — follows textbox + group conventions)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when typing into slots
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab into OTP group — NVDA announces group name (via role="group" + aria-label, e.g., `Verification code, group`)
- [ ] First slot announces: `<label> edit, 1 of 6` (slot position + total)
- [ ] Placeholder char (if any) reads as empty; NVDA announces "blank"
- [ ] aria-describedby (e.g., "Enter the 6-digit code sent to your email") reads after name

## Keyboard activation

- [ ] Type a digit — character inserts into current slot; focus auto-advances to next slot; NVDA announces: `<digit>, <N of M>`
- [ ] Backspace on filled slot: clears, focus moves back one slot
- [ ] Backspace on empty slot: focus moves back one slot (does NOT delete previous value unless policy says so — verify)
- [ ] ArrowLeft / ArrowRight: manual navigation between slots
- [ ] Home: first slot; End: last slot
- [ ] Paste (Ctrl+V) full OTP code: all slots fill, focus lands on last slot, NVDA announces filled state (e.g., `123456 entered`)

## Focus management

- [ ] Tab enters group, lands on first empty (or first) slot
- [ ] Tab exits group (single Tab stop for whole group per APG pattern) — does NOT tab through each slot
- [ ] Shift+Tab exits to previous focusable
- [ ] Focus ring visible on active slot
- [ ] Auto-advance on input: focus moves to next slot after digit entered

## Live regions / announcements

- [ ] On paste: coalesced announcement (NOT per-slot spam)
- [ ] On complete (all slots filled): optional aria-live announcement (`Code complete` or similar) via role="status"
- [ ] Invalid state (wrong code): aria-invalid="true" on group — NVDA announces "invalid entry"
- [ ] Error message: role="alert" or aria-live="assertive" — NVDA interrupts with error text

## Navigation within component

- [ ] ArrowLeft: previous slot
- [ ] ArrowRight: next slot
- [ ] Home: first slot
- [ ] End: last slot
- [ ] Typing: auto-advances after valid char

## Disabled states

- [ ] Disabled group: all slots announce "disabled"
- [ ] aria-disabled preferred for SR discoverability

## Edge cases specific to InputOTP

- [ ] Numeric-only input: non-digit key presses ignored silently; NVDA does not re-announce
- [ ] Masked input (password-style): NVDA reads "dot" or nothing per char; full value NOT re-read; verify policy (typically OTP is NOT masked so user can verify)
- [ ] Paste with fewer digits than slots: fills from first slot; remaining slots empty; focus lands on first empty
- [ ] Paste with more digits than slots: truncates; focus on last slot
- [ ] Separator character (e.g., dash between groups): decorative, aria-hidden — not read
- [ ] Autocomplete="one-time-code" — NVDA + browser may offer SMS autofill; ensure announcement when autofilled
- [ ] Form submission on complete: optional — if auto-submits, announce submission state

## Known NVDA-specific quirks

- NVDA may announce EACH slot on auto-advance — can feel chatty but is correct per APG
- Paste announcement: NVDA reads full pasted value; ensure group aria-label context keeps it clear
- Masked mode: NVDA may read dots per keystroke — prefer unmasked for OTP unless security policy requires

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
