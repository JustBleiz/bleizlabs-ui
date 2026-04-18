# Tabs — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Tabs`
**Playground:** http://localhost:3000/components/tabs
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when navigating tabs
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab into Tabs — NVDA announces tablist: `<aria-label>, tab list` (if labeled)
- [ ] Selected tab announces: `<label> tab, selected, <N of M>`
- [ ] Unselected tabs (on arrow navigation): announce `<label> tab, <N of M>` (without "selected")
- [ ] role="tablist", role="tab", aria-selected all announce
- [ ] aria-orientation="horizontal" (default) or "vertical" reads correctly

## Keyboard activation

- [ ] Only ONE tab is Tab-reachable (roving tabindex=0); others have tabindex=-1
- [ ] Arrow keys within tablist: navigate to next/prev tab
- [ ] APG has two activation modes: automatic (tab selects on arrow focus) and manual (Space/Enter required) — verify which this component uses
  - Automatic: tabpanel changes on ArrowLeft/Right; NVDA reads new panel
  - Manual: Arrow only moves focus; Enter/Space selects
- [ ] Home: first tab; End: last tab

## Focus management

- [ ] Roving tabindex: Tab enters tablist once, arrow keys within; Tab exits to tabpanel or next page focusable
- [ ] Focus ring visible on active tab
- [ ] Tab from tablist → tabpanel (if tabpanel has tabindex=0) — NVDA reads panel on focus
- [ ] Tab from tabpanel → next focusable in panel OR next focusable outside

## Live regions / announcements

- [ ] Selection change announces via aria-selected state on focus
- [ ] Tabpanel content read via virtual cursor; ensure panel has aria-labelledby pointing to its tab

## Navigation within component

- [ ] ArrowRight / ArrowLeft (horizontal): next/prev tab (wraps per APG)
- [ ] ArrowDown / ArrowUp (vertical orientation): next/prev tab
- [ ] Home: first tab; End: last tab
- [ ] Delete (if closable tabs supported): removes tab; NVDA announces removal

## Disabled states

- [ ] Disabled tabs announce "disabled" (aria-disabled)
- [ ] aria-disabled tabs remain focusable for discovery; selection attempt is no-op

## Edge cases specific to Tabs

- [ ] role="tabpanel" on content container; aria-labelledby points to tab id
- [ ] Only active panel is displayed (others hidden via CSS or hidden attribute) — NVDA virtual cursor reads only active panel
- [ ] Automatic activation mode: on arrow, tab selects immediately AND panel changes — NVDA reads both
- [ ] Manual activation: on arrow, focus moves but selection unchanged — NVDA reads "<tab>" (no "selected"); Space/Enter then selects
- [ ] Nested tabs (tabs within a tabpanel): roving tabindex scoped per tablist; each tablist independent
- [ ] Icon-only tabs: MUST have aria-label
- [ ] Tab with badge (e.g., "3 new"): badge text should be in aria-label or hidden text, not just visual

## Known NVDA-specific quirks

- NVDA reads "tab" twice for role="tab" inside tablist — once as item, once as role — acceptable
- aria-selected announcement: NVDA reads "selected" reliably; "not selected" is silent (by design)
- Automatic vs manual: NVDA users often prefer manual for complex panels (prevents accidental panel swap on arrow)

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
