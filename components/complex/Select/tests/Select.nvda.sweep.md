# Select — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Select`
**Playground:** http://localhost:3000/components/select
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (select-only combobox) OR https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ (listbox pattern when custom)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting with Select
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to Select trigger — NVDA: `<label> combobox, <current value>, has popup listbox, collapsed`
- [ ] role="combobox" + aria-expanded="false" + aria-haspopup="listbox" announce
- [ ] Placeholder reads if no value set
- [ ] Required/invalid states announce if applicable

## Keyboard activation

- [ ] Enter / Space / ArrowDown on trigger: opens listbox; NVDA: `expanded, listbox, <current or first option>, <N of M>`
- [ ] Alt+ArrowDown: opens listbox
- [ ] Escape: closes listbox; value unchanged
- [ ] Enter on option: commits selection, closes listbox, NVDA reads new trigger value

## Focus management

- [ ] On open, DOM focus may stay on trigger (activedescendant pattern) OR move into listbox (focus pattern) — verify project choice
- [ ] If activedescendant: aria-activedescendant points to highlighted option; NVDA announces option per navigation
- [ ] If focus-moves pattern: DOM focus moves to option; NVDA announces per focus
- [ ] Focus ring visible
- [ ] On close, focus returns to trigger

## Live regions / announcements

- [ ] aria-live not required if using activedescendant (option reads via NVDA focus tracking)
- [ ] Value change on trigger announces via NVDA reading trigger on focus return

## Navigation within component

- [ ] ArrowDown / ArrowUp: navigate options; wraps per APG
- [ ] Home: first option; End: last option
- [ ] Type-ahead: typing letter focuses first matching option AND announces it
- [ ] PgDn / PgUp (if supported): page-jump through options

## Disabled states

- [ ] Disabled Select: announces "disabled"
- [ ] Disabled options announce "disabled"
- [ ] aria-disabled preferred; focus skips or remains discoverable per policy

## Edge cases specific to Select

- [ ] Option groups (role="group" with aria-label or optgroup-style): NVDA announces group name when entering first item of group
- [ ] Icon inside option: decorative (aria-hidden) unless icon is only label — then use aria-label
- [ ] Long option text with ellipsis: NVDA reads FULL text (no visual truncation in SR layer)
- [ ] Multi-select variant (if supported): Ctrl+Click / Shift+Click select multiple; NVDA announces "selected" per action; aria-multiselectable="true"
- [ ] Selected option has aria-selected="true" — NVDA announces "selected"
- [ ] Current value in trigger matches selected option in listbox

## Known NVDA-specific quirks

- NVDA + native <select> works out of box; custom Select must match behavior with combobox+listbox ARIA
- NVDA reads `<current value>, combobox, collapsed` on trigger — current value MUST be in trigger label for this
- With focus-moves pattern: DOM focus going into listbox can confuse NVDA briefly — activedescendant is safer
- Type-ahead timeout: typing gap resets buffer; NVDA follows naturally

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
