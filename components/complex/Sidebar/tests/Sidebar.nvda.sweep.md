# Sidebar — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Sidebar`
**Playground:** http://localhost:3000/components/sidebar
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/complementary.html (complementary landmark) + https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/ (collapsible sections)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when activating items
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Landmark list (insert+F7) shows Sidebar as `complementary` (aside) OR `navigation` (if aria-label names it) — verify expected role
- [ ] Tab into Sidebar — NVDA announces landmark on entry (`complementary` or `navigation, <label>`)
- [ ] First item announces role + label (e.g., `Dashboard link` or `Settings button, collapsed`)

## Keyboard activation

- [ ] Enter on link: navigates
- [ ] Enter / Space on collapsible section trigger: toggles; NVDA announces `expanded` / `collapsed`
- [ ] Collapse toggle (global — show/hide sidebar): NVDA announces `Collapse sidebar button, expanded/collapsed`

## Focus management

- [ ] Tab moves through all interactive items in DOM order
- [ ] Focus ring visible
- [ ] Current page item: aria-current="page" — NVDA announces "current page"
- [ ] Skip link (if present) to main content: reachable via first Tab, activates on Enter

## Live regions / announcements

- [ ] Collapsed sidebar variant: icons-only mode — icon buttons MUST have aria-label; NVDA reads full name despite icon-only visual
- [ ] Active/current section: aria-current="page" announces

## Navigation within component

- [ ] Tab: linear through all items
- [ ] If sidebar uses role="tree" (rare): ArrowUp/Down navigate tree; ArrowRight expands; ArrowLeft collapses
- [ ] Disclosure sections: Enter/Space toggle; sub-items become reachable via Tab when expanded

## Disabled states

- [ ] Disabled items announce "disabled" (aria-disabled)

## Edge cases specific to Sidebar

- [ ] Collapsed (icon-only) vs expanded variant: NVDA reads aria-label regardless of visual text
- [ ] Toggle button for global collapse: aria-label="Toggle sidebar" or "Collapse sidebar" + aria-expanded
- [ ] Mobile variant: sidebar becomes Sheet/Drawer — separate NVDA pass for that mode
- [ ] Nested navigation (section → items): parent announces aria-expanded when collapsible; children reachable when expanded
- [ ] Active section auto-expands on mount: NVDA reads expanded state correctly
- [ ] Sidebar inside <aside> OR <nav>: landmark role follows the wrapping element; ensure only ONE complementary/navigation landmark per sidebar instance
- [ ] Scrollable sidebar: NVDA scrolls content when virtual cursor moves

## Known NVDA-specific quirks

- NVDA lists landmarks with insert+F7 — Sidebar should appear once; sub-exports (e.g., SidebarGroup) should NOT each create landmarks
- aria-current="page" reads as "current page" — consistent across NVDA versions
- If sidebar contains a full <nav>, landmark type is "navigation" not "complementary" — ensure component exposes intended role via prop

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
