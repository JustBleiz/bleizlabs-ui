# SiteHeader — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/presets/SiteHeader`
**Playground:** http://localhost:3000/components/site-header
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/banner.html (banner landmark) + https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html (navigation landmark within banner)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when activating; toggle ON for landmark exploration
- [ ] Dev server running on :3000
- [ ] Playground page loaded (desktop viewport first; mobile viewport second pass)

## Role + name + state announcements (initial)

- [ ] Landmark list (insert+F7): shows `banner` landmark once (the <header>)
- [ ] Inside banner, `navigation` landmark appears (if Nav sub-export is used) — labeled via aria-label
- [ ] Tab from top of page — first focusable lands on skip link (if present) OR Brand link; NVDA announces landmark on entry
- [ ] Brand / logo link announces: `<brand name> link` (logo img has alt text or aria-label)

## Keyboard activation

- [ ] Enter on Brand link: navigates to home
- [ ] Tab through nav links: each announces `<label> link` + aria-current="page" on active route
- [ ] Actions (e.g., Sign In / Sign Up buttons): announce role + label
- [ ] Mobile hamburger button: announces `Menu button, collapsed` / `expanded` via aria-expanded
- [ ] Enter / Space on hamburger: opens mobile nav (Sheet/Drawer); NVDA announces dialog + nav contents

## Focus management

- [ ] Tab order: skip-link (if any) → Brand → Nav links (in DOM order) → Actions → end of header → next landmark
- [ ] Focus ring visible on all focusable elements
- [ ] On mobile nav open: focus moves into mobile menu (Sheet/Drawer behavior); Escape closes, focus returns to hamburger

## Live regions / announcements

- [ ] No live regions on header itself
- [ ] aria-current="page" on active nav link — NVDA reads "current page"
- [ ] If header shows auth state (e.g., "Logged in as X"), that status reads on load or on change

## Navigation within component

- [ ] Tab: linear through all interactive elements
- [ ] Sub-exports (Brand, Nav, Actions): should NOT each register as separate landmarks — only the wrapping <header> is banner
- [ ] If Nav uses <nav> element: second landmark ("navigation") is expected; ensure aria-label differentiates from other navs on page

## Disabled states

- [ ] Disabled action buttons (if any) announce "disabled"

## Edge cases specific to SiteHeader

- [ ] Banner landmark requirement: <header> element at page root creates banner; nested <header>s (e.g., inside <article>) do NOT — verify SiteHeader is at root of <body>/layout
- [ ] Single banner per page: if another component also uses <header>, only the top-level one becomes banner (HTML AAM spec)
- [ ] Mobile hamburger + Sheet integration: mobile Sheet should be tested separately for focus trap behavior (reuse Sheet NVDA protocol)
- [ ] Dropdown menus in header (e.g., "Products ▾"): each uses DropdownMenu pattern (separate NVDA protocol)
- [ ] Sticky/fixed header: NVDA does not care about position — content reachable regardless
- [ ] Search input (if present): announces role="searchbox" or role="search" landmark; separate assessment if complex
- [ ] Skip link: first in DOM, reveals on focus; announces "Skip to main content link"; Enter jumps focus to <main>

## Known NVDA-specific quirks

- NVDA reads banner landmark as "banner" in landmark list; aria-label on <header> (if set) augments but doesn't replace role name
- Double landmarks (banner + nav inside banner) is CORRECT per WAI-ARIA — user can jump to either via insert+F7
- aria-current="page" reads "current page" — reliable across NVDA 2020+
- Mobile hamburger opening Sheet: ensure focus trap in Sheet doesn't conflict with NVDA quick-nav — Escape should exit Sheet focus trap

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
