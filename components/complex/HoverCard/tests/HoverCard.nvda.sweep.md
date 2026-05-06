# HoverCard — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/HoverCard`
**Playground:** http://localhost:3000/components/hover-card
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ (HoverCard = rich tooltip / content-supplement, non-modal)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF for focus-triggered behavior; toggle ON to test virtual cursor reach
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to trigger (typically a link or button) — NVDA announces trigger role + name
- [ ] On focus, HoverCard opens (focus-open behavior per APG tooltip pattern)
- [ ] HoverCard content announces via aria-describedby pointing to card content
- [ ] aria-describedby reads AFTER the trigger's name (e.g., `Profile link, followed by description of user card`)

## Keyboard activation

- [ ] Focus opens HoverCard (no click needed) — NVDA reads supplementary content
- [ ] Escape closes HoverCard without blurring trigger (APG tooltip pattern)
- [ ] Tab moves focus away; HoverCard closes automatically

## Focus management

- [ ] Focus remains on trigger while card is open — does NOT move into card
- [ ] Focus ring visible on trigger
- [ ] HoverCard content is modeless — NVDA virtual cursor CAN move into it via arrow keys (browse mode)
- [ ] Tab skips over card content to next page focusable (card content is typically not in tab order)

## Live regions / announcements

- [ ] HoverCard content read via aria-describedby on trigger — announced once on focus
- [ ] Does NOT re-announce on hover-end / hover-restart (common NVDA pitfall — verify)
- [ ] If HoverCard has interactive content (links inside), those become reachable via virtual cursor

## Navigation within component

- [ ] HoverCard is supplementary — typically no internal arrow navigation
- [ ] If it contains interactive elements (rare for HoverCard), those are reachable via Tab sequence OR virtual cursor only

## Disabled states

- [ ] If trigger is disabled, HoverCard does NOT open (disabled elements don't receive focus/hover by convention)
- [ ] Links inside HoverCard content are not disabled typically

## Edge cases specific to HoverCard

- [ ] Hover-only opening (without keyboard path) is NOT sufficient — ensure focus ALSO opens (keyboard parity)
- [ ] Long-delay open (e.g., 500ms hover): on focus, should open immediately — no delay for keyboard users
- [ ] Closing on blur: when trigger loses focus, card closes; NVDA should not re-announce empty state
- [ ] Card contains rich content (images, headings): ensure images have alt text; headings reachable via virtual cursor H-key
- [ ] Portal rendering: card is rendered at document body but aria-describedby linkage must resolve — verify NVDA reads content despite DOM distance

## Known NVDA-specific quirks

- NVDA sometimes double-reads aria-describedby content if both on focus AND in virtual cursor — acceptable but verbose
- If trigger is a link with HoverCard, NVDA may read link + card simultaneously — expected for tooltip pattern
- HoverCard with interactive content (buttons inside): APG recommends using Popover role="dialog" pattern instead — this component is for non-interactive supplementary content

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
