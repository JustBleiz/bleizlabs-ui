# DatePicker — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/DatePicker`
**Playground:** http://localhost:3000/components/date-picker
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF inside the picker dialog
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to DatePicker input — NVDA: `<label> edit, <current value or placeholder>`
- [ ] Calendar trigger button (if separate) announces: `Choose date button, has popup dialog`
- [ ] If single combined control: input + chooser button both reachable
- [ ] Description (format hint e.g., "MM/DD/YYYY") reads via aria-describedby

## Keyboard activation

- [ ] Enter/Space on trigger button: opens calendar popup (role="dialog")
- [ ] On open, NVDA announces: `<month year> dialog`
- [ ] Direct typing into input (if editable): accepts formatted date; on blur, value parsed and announced
- [ ] Escape closes popup without changing value
- [ ] Enter on selected day: commits selection, popup closes, focus returns to trigger/input, new value announces

## Focus management

- [ ] On popup open, focus moves into grid — lands on current selection OR today OR first of month (per APG)
- [ ] Tab order within popup: Previous month → Month/year navigation (if present) → Next month → grid → other controls → Cancel/OK (if present) → wraps
- [ ] Escape closes popup, focus returns to trigger button (NOT input, unless integrated)

## Live regions / announcements

- [ ] Month navigation updates caption — announces new month (`May 2026`) via aria-live on caption or focus move
- [ ] Date selection — value announces in input via aria-live or value change reading on focus return

## Navigation within component

- [ ] ArrowLeft / Right — 1 day; NVDA: `Tuesday, April 15, 2026`
- [ ] ArrowUp / Down — 1 week
- [ ] Home — first day of week
- [ ] End — last day of week
- [ ] PageUp — previous month; PageDown — next month
- [ ] Shift+PageUp — previous year; Shift+PageDown — next year
- [ ] Enter — select date
- [ ] Space (if bound) — select date

## Disabled states

- [ ] Disabled DatePicker input: announces "disabled"
- [ ] Disabled dates in grid: announce "disabled" (aria-disabled preferred)
- [ ] Min/max boundary — Arrow beyond does nothing, NVDA stays on last valid cell

## Edge cases specific to DatePicker

- [ ] Today marker — announces "today"
- [ ] Selected date — announces "selected" (aria-selected on grid cell)
- [ ] Invalid typed input (editable mode): aria-invalid="true"; NVDA announces "invalid entry"
- [ ] Format hint via aria-describedby: reads after name on focus
- [ ] Range picker (if supported): start/end selection — NVDA announces "start date selected" then "end date selected"
- [ ] Month/year dropdowns (if present): each announces current value + role="combobox"

## Known NVDA-specific quirks

- NVDA reads full date with day-of-week in focus mode — confirm by toggling NVDA+Space
- When popup is role="dialog", NVDA should trap virtual cursor inside — verify arrow-up/down don't leak to page
- On close, NVDA re-announces input with new value — sometimes reads old value briefly if focus returns before DOM update; acceptable

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
