# Sheet — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Sheet`
**Playground:** http://localhost:3000/components/sheet
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (Sheet = side-anchored modal dialog, sibling of Drawer)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF inside sheet
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger — NVDA: `<label> button`
- [ ] Trigger does NOT expose aria-expanded (modal, not disclosure)

## Keyboard activation

- [ ] Enter / Space on trigger: sheet opens; NVDA: `<title> dialog`
- [ ] Role="dialog" + aria-modal="true" + aria-labelledby announce

## Focus management

- [ ] Initial focus: first tabbable element (or initialFocusRef)
- [ ] Focus ring visible
- [ ] Tab / Shift+Tab cycles within sheet only
- [ ] Escape closes sheet; focus returns to trigger
- [ ] Overlay click closes (if enabled); focus returns to trigger
- [ ] Close button reads `Close dialog button` or `Close sheet button`

## Live regions / announcements

- [ ] On open: title + description (if present) announce
- [ ] aria-describedby only present when description supplied

## Navigation within component

- [ ] Tab traverses sheet content in DOM order
- [ ] NVDA browse-mode cursor cannot escape to underlying page (inert on siblings)
- [ ] Landmarks (insert+F7): dialog not listed as landmark

## Disabled states

- [ ] Disabled controls inside sheet announce "disabled"

## Edge cases specific to Sheet

- [ ] Side anchor (left/right/top/bottom): position does NOT affect SR behavior; verify each variant
- [ ] Sheet width/height: on narrow viewports sheet may fill screen; NVDA reaches full content via scroll
- [ ] Nested Sheet (rare): innermost traps focus; Escape closes innermost first
- [ ] Focus trap reuses Dialog's useFocusTrap hook — behavior identical
- [ ] Scroll lock on body
- [ ] Distinction from Drawer: Sheet and Drawer are structurally similar; verify this component's specific role (typically role="dialog" either way)

## Known NVDA-specific quirks

- Sheet content sliding in — NVDA does NOT wait for animation; dialog announces immediately on `open=true`
- If Sheet is non-modal (rare for this name), role="complementary" or "region" — verify intent
- On rapid open/close, NVDA speech queue may lag — acceptable

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
