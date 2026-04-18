# DropdownMenu — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/DropdownMenu`
**Playground:** http://localhost:3000/components/dropdown-menu
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger — NVDA: `<label> menu button, has popup menu, collapsed`
- [ ] aria-haspopup="menu" + aria-expanded="false" announce correctly
- [ ] Description (if any) reads after name

## Keyboard activation

- [ ] Enter / Space / ArrowDown on trigger: opens menu; NVDA: `expanded, menu, <first item>`
- [ ] ArrowUp on closed trigger: opens menu with focus on last item
- [ ] Menu opens with focus on first menuitem (per APG)

## Focus management

- [ ] DOM focus moves from trigger to first menuitem
- [ ] Focus ring visible on item
- [ ] Escape closes menu; focus returns to trigger
- [ ] Tab closes menu AND advances to next focusable element on page (APG menu pattern — differs from Dialog)
- [ ] Shift+Tab closes menu AND moves to previous focusable before trigger
- [ ] Click outside closes; focus returns to trigger

## Live regions / announcements

- [ ] No aria-live needed; focus moves announce items
- [ ] Checkbox/radio item state changes announce on toggle

## Navigation within component

- [ ] ArrowDown: next item (wraps)
- [ ] ArrowUp: previous item
- [ ] Home: first item; End: last item
- [ ] Type-ahead: typing focuses first item starting with that letter; NVDA announces item
- [ ] ArrowRight on submenu parent: opens submenu, focus moves to first submenu item
- [ ] ArrowLeft in submenu: closes submenu, focus to parent item

## Disabled states

- [ ] Disabled menuitems announce "disabled" (aria-disabled)
- [ ] aria-disabled items remain focusable; Enter is no-op

## Edge cases specific to DropdownMenu

- [ ] Checkbox items: role="menuitemcheckbox" + aria-checked — NVDA announces `<label>, checked` / `unchecked`
- [ ] Radio groups: role="menuitemradio" inside role="group" with aria-label — NVDA announces `<group>, <label>, <N of M>, selected`
- [ ] Icon-only items: MUST have aria-label (chevrons decorative via aria-hidden)
- [ ] Keyboard shortcut display: in aria-keyshortcuts or hidden text inside label
- [ ] Separator: role="separator" — NVDA may read as "separator" in browse mode; focus-mode skips
- [ ] Nested submenu: NVDA announces `<parent> submenu` on ArrowRight, then first item

## Known NVDA-specific quirks

- NVDA correctly differentiates role="menubar" (NavigationMenu) from role="menu" (this) — ensure roles are not confused
- On rapid ArrowDown, NVDA may skip announcements if below speech queue threshold — usually fine
- Submenu opening can have slight delay; NVDA waits for focus stabilization before announcing

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
