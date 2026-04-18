# Drawer — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Drawer`
**Playground:** http://localhost:3000/components/drawer
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (Drawer = side-anchored modal dialog)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting inside drawer
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger — NVDA: `<trigger label> button`
- [ ] Trigger does NOT expose aria-expanded (modal, not disclosure)

## Keyboard activation

- [ ] Enter/Space on trigger: drawer opens; NVDA: `<title> dialog`
- [ ] Role="dialog" + aria-modal="true" + aria-labelledby announce correctly
- [ ] If drawer is non-modal variant (rare): role="region" / "complementary"; adjust expectations

## Focus management

- [ ] Initial focus lands on first tabbable element (or initialFocusRef)
- [ ] Focus ring visible
- [ ] Tab/Shift+Tab cycles within drawer only
- [ ] Escape closes drawer; focus returns to trigger
- [ ] Overlay click closes drawer (if enabled); focus returns to trigger
- [ ] Close button reads `Close drawer button` (or Close dialog)

## Live regions / announcements

- [ ] On open: title + description (if present) announce
- [ ] aria-describedby only present when description provided

## Navigation within component

- [ ] Tab traverses drawer content in DOM order
- [ ] NVDA browse-mode cursor cannot escape to underlying page (inert on siblings)
- [ ] Landmark list (insert+F7): dialog role does NOT appear as landmark; only explicit landmark children inside drawer (rare) do

## Disabled states

- [ ] Disabled controls inside drawer announce "disabled"

## Edge cases specific to Drawer

- [ ] Side-anchored (left / right / top / bottom): position does NOT affect SR behavior — verify all four anchor variants on playground
- [ ] Gesture-driven close (swipe on touch): not SR-relevant but document — ensure keyboard Escape works regardless
- [ ] Drawer with nested scrollable content: NVDA PgUp/PgDn scrolls content within drawer, not page
- [ ] Focus trap reuses Dialog's useFocusTrap hook — behavior identical to Dialog
- [ ] Scroll lock applied to body

## Known NVDA-specific quirks

- Drawer content visually slides in — NVDA does NOT wait for animation; dialog is announced immediately on `open=true`
- Multi-drawer stacking (rare): innermost traps focus; Escape closes innermost only
- If Drawer is used as non-modal (region role), NVDA will NOT trap virtual cursor — verify role matches intent

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
