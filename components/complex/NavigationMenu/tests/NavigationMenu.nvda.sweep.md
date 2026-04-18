# NavigationMenu — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/NavigationMenu`
**Playground:** http://localhost:3000/components/navigation-menu
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ (menubar with disclosure submenus — often disclosure pattern https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ for submenu triggers)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when navigating menubar items
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab into nav — NVDA announces: `<aria-label> navigation` landmark
- [ ] First menubar item: `<label>, menu bar, <N of M>` (if role="menubar") OR `<label>, list, <N of M>` (if uses role="list")
- [ ] Submenu trigger (disclosure): announces aria-expanded state (`<label> button, collapsed` / `expanded`)
- [ ] Current page item: aria-current="page" — NVDA announces `current page`

## Keyboard activation

- [ ] Enter / Space on submenu trigger: opens submenu, NVDA announces `expanded` + first submenu item (or aria-live region reads menu content)
- [ ] ArrowDown on submenu trigger (if using menubar pattern): opens submenu, focus moves to first submenu item
- [ ] Clicking link item: navigates normally; NVDA announces link
- [ ] Escape closes open submenu; focus returns to trigger

## Focus management

- [ ] Tab stops once per menubar (roving tabindex — only active item has tabindex=0) OR once at nav start if using list pattern
- [ ] Focus ring visible
- [ ] On submenu open, focus moves to first submenu item (menubar pattern) OR stays on trigger (disclosure pattern) — verify which pattern this component uses
- [ ] Tab within menubar moves to next page focusable (exits menubar in menubar pattern)
- [ ] Arrow keys navigate between menubar items

## Live regions / announcements

- [ ] Submenu open: NVDA reads submenu content either via focus move (menubar) or aria-live (disclosure)
- [ ] aria-current="page": NVDA reads "current page" on the active nav item

## Navigation within component

- [ ] ArrowLeft / ArrowRight: move between top-level items (aria-orientation="horizontal")
- [ ] Home: first item; End: last item
- [ ] ArrowDown: if disclosure, opens submenu; if menubar horizontal, opens submenu and moves to first item
- [ ] ArrowUp: opens submenu to last item (menubar) or closes (disclosure)
- [ ] Type-ahead: typing letter focuses first matching top-level or submenu item
- [ ] In submenu: ArrowDown/Up moves between items; ArrowLeft closes submenu

## Disabled states

- [ ] Disabled nav items announce "disabled"
- [ ] aria-disabled preferred

## Edge cases specific to NavigationMenu

- [ ] Hover-open on submenu: does NOT trigger NVDA announcements (NVDA doesn't track hover); focus-open announces
- [ ] Only one submenu open at a time (typical): opening another auto-closes previous
- [ ] Current-page visual highlight + aria-current="page" — both required; NVDA reads aria-current
- [ ] Rich submenu content (images, descriptions, multiple columns): all content reachable via virtual cursor
- [ ] Mobile variant: often becomes hamburger → Sheet/Drawer; verify separate NVDA pass for mobile pattern
- [ ] Submenu trigger announces aria-haspopup (menu / true) — NVDA: `has popup menu`
- [ ] NavigationMenu root is wrapped in <nav> with aria-label — appears in landmarks list (insert+F7)

## Known NVDA-specific quirks

- NVDA reads role="menubar" as "menu bar"; role="menu" as "menu"; role="list" as "list"
- aria-orientation="horizontal" reads as "orientation horizontal" in some NVDA versions — acceptable
- Disclosure vs menubar pattern: if component uses disclosure, submenu items are just buttons in a popup (not menuitems) — NVDA reads accordingly
- If submenu trigger is also a link (hybrid), announce both role="link" AND aria-expanded — unusual but valid

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
