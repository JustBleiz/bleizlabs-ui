# Command — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Command`
**Playground:** http://localhost:3000/components/command
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (command-palette variant — combobox with listbox popup)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF
- [ ] Dev server running on :3000
- [ ] Playground page loaded; Command palette invoked (via trigger or Ctrl+K if bound)

## Role + name + state announcements (initial)

- [ ] On open, NVDA announces dialog role (if wrapped in Dialog) OR focuses input directly
- [ ] Input announces: `<placeholder> combobox, has popup listbox, expanded`
- [ ] First option (if any results on empty input) reads via activedescendant

## Keyboard activation

- [ ] Type a query: NVDA reads each typed char; result count announces via live region (e.g., `3 matches`)
- [ ] ArrowDown: activedescendant moves to next option; NVDA: `<item label>, <N of M>`
- [ ] Enter on highlighted item: executes command; palette closes (or stays, per design); NVDA announces action if any
- [ ] Escape: closes palette; focus returns to trigger

## Focus management

- [ ] DOM focus stays in input (APG combobox pattern)
- [ ] aria-activedescendant points to highlighted item
- [ ] Focus ring visible on input; highlighted item has visual indicator (CSS)
- [ ] On palette close, focus returns to element that opened it

## Live regions / announcements

- [ ] Empty results: `No results found` announces via role="status" or aria-live="polite"
- [ ] Result count changes announce via aria-live
- [ ] Groups / section headers: announce when first item of group becomes active (e.g., `Suggestions group, Search docs, 1 of 5`)

## Navigation within component

- [ ] ArrowDown / ArrowUp — moves through flat list of items (skipping group headers)
- [ ] Home — first item
- [ ] End — last item
- [ ] PageDown / PageUp (if implemented) — page jumps
- [ ] Typing refines filter — active item updates to first match

## Disabled states

- [ ] Disabled command items announce "disabled" via aria-disabled
- [ ] aria-disabled items remain in activedescendant chain for discovery; Enter is no-op

## Edge cases specific to Command

- [ ] Group headers (role="presentation" or role="group" with aria-label): announce as group label when entering
- [ ] Keyboard shortcut hints (e.g., `Ctrl+K` displayed next to item): read via aria-label or hidden text — verify announcement
- [ ] Recent / Suggestions sections: announce group name distinctly
- [ ] Icon-only items: must have accessible name via aria-label (not just icon)
- [ ] Loading state for async search: `Loading` announces via aria-busy or live region

## Known NVDA-specific quirks

- Command palette is often inside a modal — verify dialog trap does NOT double-announce on every keystroke
- With very rapid typing, NVDA may skip some live region updates — acceptable
- If palette uses cmdk or similar lib, verify its internal aria-live region is polite, not assertive (assertive on every keystroke = painful)

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
