# Calendar — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Calendar`
**Playground:** http://localhost:3000/components/calendar
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/grid/ (date-picker dialog variant: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS [ ] PASS with notes [ ] FAIL

---

## Pre-flight

- [ ] NVDA running (insert+N to open settings if needed)
- [ ] Speech rate comfortable for review (default 50)
- [ ] Browse mode OFF when navigating grid cells (NVDA+Space toggles)
- [ ] Dev server running on :3000
- [ ] Playground page loaded, focus at top of document

## Role + name + state announcements (initial)

- [ ] Tab into Calendar — first focused element announces (typically previous-month chevron): `Previous month button`
- [ ] Month/year heading reads: `<Month Year>` (e.g., `April 2026`) — NVDA reads as heading level 2
- [ ] Weekday header row announces column headers when entering grid
- [ ] Grid itself announces `grid` role with label (e.g., `April 2026 grid`)

## Keyboard activation

- [ ] Previous/Next month chevrons: Enter/Space advances month and NVDA announces new month heading (aria-live or focus-moved)
- [ ] Enter on selectable day cell — day becomes selected, aria-selected=true reads "selected"

## Focus management

- [ ] Initial grid focus lands on today (or selected date, or first of month per APG)
- [ ] Focus is visible (CSS ring visible on cell)
- [ ] Arrow keys move a roving tabindex — only one cell is in tab order at a time
- [ ] Tab leaves grid — next Tab focuses first element AFTER calendar, not another cell

## Live regions / announcements

- [ ] On month navigation, NVDA announces new month heading (via focus move or aria-live on caption)
- [ ] Selection announcement: when pressing Enter on a cell, NVDA re-announces the cell with "selected" state

## Navigation within component

- [ ] ArrowLeft / ArrowRight — move 1 day; NVDA announces: `Monday, April 14, 2026` (full date with day-of-week)
- [ ] ArrowUp / ArrowDown — move 1 week; full date announces
- [ ] Home — first day of current week
- [ ] End — last day of current week
- [ ] PageUp — previous month (same day), focus lands in new grid
- [ ] PageDown — next month (same day)
- [ ] Shift+PageUp — previous year
- [ ] Shift+PageDown — next year

## Disabled states

- [ ] Disabled days (out-of-range, min/max) announce as "disabled" or "dimmed"
- [ ] aria-disabled preferred so NVDA keeps them focusable for discovery
- [ ] Out-of-month filler cells (if shown) — confirm they are aria-hidden OR announce as disabled

## Edge cases specific to Calendar

- [ ] Today marker — NVDA announces "today" as part of cell label (e.g., `Monday, April 18, 2026, today`)
- [ ] Selected date — announces as "selected"
- [ ] Weekend days — no special announcement expected (visual only)
- [ ] Keyboard crossing month boundary via Arrow — focus moves to adjacent month, grid re-announces new month
- [ ] Min/max date boundaries — Arrow beyond boundary does nothing, NVDA stays on last valid cell

## Known NVDA-specific quirks

- NVDA in browse mode may NOT read full date per cell — always verify in focus mode (Browse Mode OFF)
- Grid role + column headers (`th[scope="col"]`) — NVDA should read weekday on column entry
- When grid is inside a dialog, ensure dialog role is NOT announced per cell (only once on dialog open)

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
