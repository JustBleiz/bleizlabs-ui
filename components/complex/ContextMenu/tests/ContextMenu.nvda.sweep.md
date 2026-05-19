# ContextMenu — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/ContextMenu`
**Playground:** http://localhost:3000/components/context-menu
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/menu/
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

- [ ] Tab into context-menu target (e.g., "Right-click area") — NVDA announces target role/name
- [ ] Target exposes aria-haspopup="menu" — NVDA: `has popup menu`

## Keyboard activation

- [ ] Press Shift+F10 OR dedicated context key — menu opens; NVDA announces: `menu` + first item
- [ ] Some implementations use Enter/Space on target too — verify project pattern
- [ ] Right-click via physical mouse — menu opens at cursor; NVDA focus-follows if keyboard-invoked

## Focus management

- [ ] On open, focus moves to first menu item (or previously active item)
- [ ] Focus ring visible on item
- [ ] Escape closes menu; focus returns to target element
- [ ] Tab: closes menu AND moves focus to next focusable element on page (APG menu pattern)
- [ ] Clicking outside closes menu, focus returns to target

## Live regions / announcements

- [ ] No aria-live needed — focus-moved items self-announce
- [ ] Checkbox/radio item state changes announce on activation (`checked` / `unchecked`)

## Navigation within component

- [ ] ArrowDown: next item (wraps per APG)
- [ ] ArrowUp: previous item
- [ ] Home: first item
- [ ] End: last item
- [ ] Type-ahead: typing a letter focuses first item starting with that letter; NVDA announces item
- [ ] ArrowRight on item with submenu: opens submenu, focus moves to first submenu item; NVDA announces: `<submenu parent> submenu, <first item>`
- [ ] ArrowLeft in submenu: closes submenu, focus returns to parent item

## Disabled states

- [ ] Disabled menuitems announce "disabled" via aria-disabled
- [ ] aria-disabled items remain focusable; Enter is no-op
- [ ] Separator items (role="separator") — NVDA may or may not announce; not required

## Edge cases specific to ContextMenu

- [ ] Checkbox items: role="menuitemcheckbox" + aria-checked — NVDA announces `<label>, checked` / `unchecked`
- [ ] Radio items: role="menuitemradio" grouped via role="group" — NVDA announces `<label>, <N of M>, selected`
- [ ] Keyboard shortcut hint (visual Cmd+C): must be in aria-keyshortcuts OR in accessible name
- [ ] Icon-only menuitem: must have aria-label
- [ ] Submenu indicator (chevron icon): decorative, aria-hidden
- [ ] Menu positioning on small viewport: should not clip below screen; NVDA cursor should still reach all items

## Known NVDA-specific quirks

- NVDA reads role="menu" as "menu" and role="menuitem" as "menu item"
- On submenu open via ArrowRight, NVDA may briefly re-read parent label before first submenu item — acceptable
- Shift+F10 invocation: NVDA announces context menu opening automatically; ensure our implementation doesn't suppress this

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
