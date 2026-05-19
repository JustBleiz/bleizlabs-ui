# Slider — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Slider`
**Playground:** http://localhost:3000/components/slider
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/slider/ (single-thumb) OR https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/ (range)
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS [ ] PASS with notes [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF — slider requires focus mode for arrow keys
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Tab to Slider thumb — NVDA: `<label> slider, <current value>, minimum <min>, maximum <max>` (e.g., `Volume slider, 50, minimum 0, maximum 100`)
- [ ] role="slider" + aria-valuemin + aria-valuemax + aria-valuenow all announce
- [ ] aria-valuetext (if provided) overrides raw number — NVDA reads text (e.g., `Medium` instead of `50`)
- [ ] Orientation: aria-orientation="vertical" reads as "oriented vertically"; horizontal is default (not announced)

## Keyboard activation

- [ ] ArrowRight / ArrowUp: increment by step; NVDA reads new value
- [ ] ArrowLeft / ArrowDown: decrement by step; NVDA reads new value
- [ ] Home: jump to min; NVDA: `<min value>, minimum`
- [ ] End: jump to max; NVDA: `<max value>, maximum`
- [ ] PageUp / PageDown: large step (10% typically); NVDA reads new value
- [ ] Enter / Space (if bound for multi-thumb switching): may toggle active thumb — verify

## Focus management

- [ ] Focus ring visible on thumb
- [ ] Tab moves to next slider (if multiple) or next page focusable
- [ ] On multi-thumb range: Tab moves between thumbs; each thumb is independent slider role

## Live regions / announcements

- [ ] Value change announces immediately on keypress (via aria-valuenow / valuetext read on focus)
- [ ] Tooltip above thumb (if present) is visual only — aria-hidden to avoid double-reading
- [ ] Output value displayed (e.g., "50%") is visual duplicate — aria-hidden OR same as aria-valuetext

## Navigation within component

- [ ] Arrow keys: step-increment navigation
- [ ] Home / End: boundary jumps
- [ ] PageUp / PageDown: large steps
- [ ] Click on track (if supported): moves thumb, NVDA announces new value on refocus

## Disabled states

- [ ] Disabled slider: announces "disabled"; arrow keys do nothing
- [ ] aria-disabled preferred for discoverability

## Edge cases specific to Slider

- [ ] Vertical orientation: ArrowUp = increment (toward top); ArrowDown = decrement — verify this matches aria-orientation
- [ ] Range slider (two thumbs): each thumb has its own role="slider" with own valuenow, but shared valuemin/valuemax; NVDA announces both on Tab
- [ ] Discrete steps (e.g., integer-only): verify no fractional values announced
- [ ] aria-valuetext formatting: if value represents time ("5 minutes"), currency, etc., valuetext gives human-readable form
- [ ] Marks / ticks on track: decorative (aria-hidden)
- [ ] Thumb label (e.g., "Volume"): attached via aria-labelledby to parent label
- [ ] Out-of-range attempt: Arrow at min/max does nothing; NVDA may or may not re-announce; no spam

## Known NVDA-specific quirks

- NVDA announces valuenow AFTER every keypress — can feel verbose but is correct per APG
- If aria-valuetext is empty string, NVDA falls back to aria-valuenow — ensure valuetext is either populated or absent (not empty)
- Multi-thumb: NVDA may struggle to differentiate thumbs if both have same label — use aria-label like "Start" / "End"
- Range slider: if both thumbs overlap at same value, NVDA still announces each on Tab

## Findings

### PASS notes

- <anything unexpected but correct>

### Issues (severity)

- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** **\*\*\*\***\_\_**\*\*\*\*** **Date:** \***\*\_\_\*\*** **Tester:** \***\*\_\_\*\***
