# Tooltip — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Tooltip`
**Playground:** http://localhost:3000/components/tooltip
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS [ ] PASS with notes [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when focusing triggers; toggle ON to verify virtual cursor reach
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to Tooltip trigger (e.g., icon button) — NVDA announces trigger's accessible name FIRST
- [ ] Tooltip content reads AFTER trigger name via aria-describedby (e.g., `Save button, Save file, Ctrl+S`)
- [ ] role="tooltip" on tooltip content
- [ ] Tooltip opens on focus (keyboard parity with hover per APG)

## Keyboard activation

- [ ] Focus (Tab) opens tooltip; NVDA reads supplementary text
- [ ] Escape hides tooltip WITHOUT moving focus (APG requirement)
- [ ] Tab to next element: tooltip closes; NVDA does not re-announce old tooltip

## Focus management

- [ ] Focus stays on trigger while tooltip visible
- [ ] Focus ring visible on trigger
- [ ] Tooltip content has NO interactive elements (APG — tooltip is display-only)
- [ ] Virtual cursor CAN reach tooltip content in browse mode (modeless, supplementary)

## Live regions / announcements

- [ ] Tooltip content announces via aria-describedby link on trigger — read ONCE on focus
- [ ] No aria-live on tooltip (APG does NOT require live region; describedby handles it)
- [ ] Does NOT re-announce on hover-end / hover-restart (common NVDA bug to verify)

## Navigation within component

- [ ] Tooltip contains no interactive content — no internal navigation
- [ ] If tooltip contains icon + text, only the text is announced (icon aria-hidden)

## Disabled states

- [ ] Disabled trigger: tooltip MAY still appear (modern UX — show hint about why disabled); verify project policy
- [ ] Native `disabled` buttons don't fire focus/hover — if tooltip needed on disabled state, trigger uses aria-disabled instead

## Edge cases specific to Tooltip

- [ ] Tooltip on icon-only button: describedby provides extra context; trigger's aria-label is primary name
- [ ] Tooltip content is short text only — no buttons, no links (if interactive content needed, use Popover with role="dialog")
- [ ] Escape hides tooltip: NVDA stops announcing; trigger retains focus
- [ ] Multiple triggers in sequence: each tooltip opens on focus, closes on blur — no lingering tooltips
- [ ] Tooltip positioned via floating-ui: position does not affect SR (virtual cursor works regardless)
- [ ] Portal rendering: tooltip DOM at body root; aria-describedby linkage must resolve
- [ ] Delay before showing: NVDA reads on focus immediately regardless of visual delay (ARIA linkage is pre-established)
- [ ] Tooltip with shortcut hint (e.g., "Save (Ctrl+S)"): shortcut in aria-label or visible text — both read correctly

## Known NVDA-specific quirks

- NVDA occasionally reads aria-describedby content twice in browse mode (once via describedby, once as virtual cursor walks text) — acceptable
- Hover-only tooltip opening (no focus path) is a BUG — ensure focus opens tooltip for keyboard users
- If tooltip uses aria-labelledby instead of aria-describedby, it REPLACES trigger name instead of supplementing — describedby is correct per APG
- Tooltip on <button disabled>: native disabled blocks focus, so tooltip never appears for keyboard users — if tooltip needed, button must use aria-disabled

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
