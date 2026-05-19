# ScrollArea — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/ScrollArea`
**Playground:** http://localhost:3000/components/scroll-area
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/ (no dedicated ScrollArea pattern — wrapper for scrollable content; scrollbar = https://www.w3.org/WAI/ARIA/apg/patterns/scrollbar/ but custom UI scrollbars are typically decorative only)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS [ ] PASS with notes [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting with inner content
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab INTO ScrollArea inner content — NVDA announces inner content normally (ScrollArea wrapper is transparent)
- [ ] ScrollArea wrapper itself has NO announced role (div with overflow — decorative from SR perspective)
- [ ] Custom scrollbar thumb/track elements have aria-hidden="true" — NVDA does not reach them in virtual cursor

## Keyboard activation

- [ ] If inner content has focusable items (links, buttons), Tab reaches them normally
- [ ] PgUp / PgDn scrolls the viewport (browser default); NVDA tracks scroll, virtual cursor stays at focus
- [ ] ArrowUp / ArrowDown in browse mode scrolls content line-by-line
- [ ] Home / End jumps to top / bottom of scrollable content

## Focus management

- [ ] Focus ring visible on interactive children inside scroll area
- [ ] Focused item auto-scrolls into view (browser default + scroll-margin CSS)
- [ ] Focus trap is NOT expected (ScrollArea is not modal)

## Live regions / announcements

- [ ] No live region expected on the ScrollArea itself
- [ ] Inner content announcements depend on inner components (each tested separately)

## Navigation within component

- [ ] Virtual cursor reads full inner content top-to-bottom; NVDA does NOT stop at viewport boundary
- [ ] NVDA+F reads full content continuously; scroll auto-adjusts to keep cursor visible

## Disabled states

- [ ] N/A for ScrollArea itself — scroll is a wrapper behavior

## Edge cases specific to ScrollArea

- [ ] Custom scrollbar thumb: aria-hidden="true" so virtual cursor doesn't announce "scrollbar" repeatedly
- [ ] Scrollbar is visible-on-hover OR always-visible: NVDA does not track hover, so scroll indicator invisibility doesn't affect SR UX
- [ ] Content larger than viewport: NVDA reaches all content via browse mode arrows (browser handles scroll on virtual cursor move)
- [ ] Horizontal scroll variant: same — browser handles scroll when virtual cursor moves past viewport edge
- [ ] Does NOT register as landmark (no role="region" / "complementary") — wrapper only
- [ ] Nested ScrollArea (scroll within scroll): each handles its own scroll; NVDA walks content linearly

## Known NVDA-specific quirks

- NVDA browse mode arrows may not auto-scroll as smoothly with CSS `overflow: hidden` on parent — verify parent allows overflow
- If ScrollArea uses `scroll-behavior: smooth`, NVDA scroll-to-focus may feel delayed — acceptable; purely visual
- Custom scrollbar implementations that use role="scrollbar" would need full scrollbar pattern (aria-valuenow/min/max); this component treats scrollbar as decorative

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
