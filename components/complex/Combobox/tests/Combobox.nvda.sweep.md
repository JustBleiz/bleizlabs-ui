# Combobox — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Combobox`
**Playground:** http://localhost:3000/components/combobox
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF — combobox requires focus mode for arrow keys
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab into Combobox input — NVDA: `<label> combobox, has popup listbox, collapsed`
- [ ] role="combobox" + aria-expanded="false" + aria-haspopup="listbox" all announce
- [ ] Required/invalid states announce ("required", "invalid entry") if applicable
- [ ] Description (aria-describedby hint text) reads after name

## Keyboard activation

- [ ] ArrowDown on closed Combobox: opens listbox, NVDA announces: `expanded, listbox, <first option>, 1 of N`
- [ ] Alt+ArrowDown: opens listbox without moving focus to first option
- [ ] Enter on closed combobox with value: submits (if form) or no-op
- [ ] Typing characters: filters list; NVDA reads typed chars AND remaining match count
- [ ] Escape: closes listbox, NVDA announces `collapsed`; input value restored if editable-select mode

## Focus management

- [ ] DOM focus stays in input (NEVER moves to option — APG requirement)
- [ ] aria-activedescendant points to highlighted option
- [ ] On option navigation, NVDA announces option text AND state (e.g., `Orange, 2 of 10`)
- [ ] Selected option has aria-selected="true" — NVDA announces "selected"
- [ ] Focus ring visible on input (not on option — option has visual highlight via CSS)

## Live regions / announcements

- [ ] When filtering, result count announces via aria-live (e.g., `15 options, then 3 matches`)
- [ ] When value selected and popup closes, input reads new value
- [ ] No duplicate announcements (NVDA + activedescendant can double-read — verify)

## Navigation within component

- [ ] ArrowDown (open): moves activedescendant to next option; NVDA announces new option
- [ ] ArrowUp (open): moves activedescendant to previous option; wraps per APG spec
- [ ] Home: first option
- [ ] End: last option
- [ ] Type-ahead character: for autocomplete combobox, filters; for "both" pattern, moves to first matching option AND announces it

## Disabled states

- [ ] Disabled combobox: NVDA announces "disabled"; still focusable for SR discovery if aria-disabled
- [ ] Disabled options in listbox: announce "disabled"; arrow navigation skips or NVDA announces as unavailable (per policy)

## Edge cases specific to Combobox

- [ ] Editable (autocomplete="list" or "both") vs read-only combobox: verify which mode this is
  - For editable: typed text reads per keystroke + match announces
  - For read-only: typing does type-ahead match
- [ ] Empty state: "No results" message announces via aria-live or role="status"
- [ ] Multi-select (if supported): selecting option does NOT close listbox; selection count announces
- [ ] Clear button: reads "Clear selection button"; Enter clears and focuses input
- [ ] Loading state (async options): NVDA announces "loading" via aria-busy or live region

## Known NVDA-specific quirks

- NVDA + Firefox historically has best combobox support; Chrome may read activedescendant with slight delay
- NVDA reads BOTH typed chars AND active option per keystroke — can feel verbose; acceptable per APG
- aria-autocomplete="list" vs "both" behavior: NVDA correctly differentiates (list = popup filter; both = popup filter + inline completion)

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
