# Carousel — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Carousel`
**Playground:** http://localhost:3000/components/carousel
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
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

- [ ] Tab into Carousel — root region announces: `<label>, carousel` (aria-roledescription="carousel" + aria-label or aria-labelledby)
- [ ] Slide container announces: `<label>, carousel` region
- [ ] Each slide announces `<N of M>, slide, <slide label>` (aria-roledescription="slide")

## Keyboard activation

- [ ] Tab to Previous button — NVDA: `Previous slide button`
- [ ] Tab to Next button — NVDA: `Next slide button`
- [ ] Enter/Space on Next — slide advances, NVDA announces new slide content (via aria-live)
- [ ] Enter/Space on Previous — slide recedes, NVDA announces new slide content
- [ ] If Play/Pause button present: announces current state (`Pause button` ↔ `Play button`) and toggles aria-pressed if used

## Focus management

- [ ] Focus remains on Prev/Next button after activation (does NOT jump to slide content)
- [ ] Focus ring visible on active button
- [ ] Tab progression: Previous → Next → slide content (if interactive) → dots/indicators → exit

## Live regions / announcements

- [ ] Slide container has `aria-live="polite"` when auto-rotate is paused / manual; `aria-live="off"` during auto-rotate (APG requirement)
- [ ] On manual Prev/Next click, new slide text announces via polite region
- [ ] During auto-rotate, NVDA does NOT announce every slide change (per APG — prevents speech spam)
- [ ] When auto-rotate pauses (focus/hover/explicit pause), subsequent manual advances DO announce

## Navigation within component

- [ ] Indicator dots (if present) — each is a button with aria-label "Slide N of M"
- [ ] Arrow keys on indicators: ArrowLeft/Right moves between dots (roving tabindex)
- [ ] Enter on dot: jumps to that slide; NVDA announces new slide

## Disabled states

- [ ] If not looping: Previous on first slide is disabled — NVDA announces "disabled"
- [ ] Same for Next on last slide

## Edge cases specific to Carousel

- [ ] Auto-rotate pauses when ANY child receives focus (APG requirement) — verify by Tab-ing into slide link, rotation halts
- [ ] Auto-rotate pauses on hover (if implemented) — not SR-relevant but document
- [ ] Slide content images: alt text announces; decorative images have empty alt
- [ ] Current slide indicator reads aria-current="true" (or aria-selected)
- [ ] aria-roledescription="carousel" / "slide" — NVDA 2021+ honors; older versions may fall back to role
- [ ] If user Tabs OUT of carousel during auto-rotate, rotation resumes — announcement policy should not change

## Known NVDA-specific quirks

- NVDA may read aria-roledescription="slide" as "slide region" or just "slide" depending on version — both acceptable
- polite live region: NVDA waits for speech pause before announcing new slide — this is expected, not a bug
- During rapid manual paging, live region may coalesce announcements — acceptable per WAI-ARIA

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
