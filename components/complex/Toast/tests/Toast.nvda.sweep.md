# Toast — NVDA Sweep Protocol

**Component:** `@bleizlabs/ui/components/complex/Toast`
**Playground:** http://localhost:3000/components/toast
**APG pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/alert/ (for urgent toasts) + status / polite live regions for non-urgent
**NVDA version tested:** NVDA 2024.x (record actual)
**Browser:** Firefox (primary) / Chrome (secondary)
**Executed on:** YYYY-MM-DD by <name>
**Verdict:** [ ] PASS  [ ] PASS with notes  [ ] FAIL

---

## Pre-flight

- [ ] NVDA running
- [ ] Speech rate comfortable for review
- [ ] Browse mode OFF when interacting with triggers
- [ ] Dev server running on :3000
- [ ] Playground page loaded

## Role + name + state announcements (initial)

- [ ] Toast container (region) has role="region" + aria-label (e.g., "Notifications") — appears in landmarks (insert+F7)
- [ ] Individual toast has role="status" (polite) OR role="alert" (assertive) depending on severity
- [ ] On toast spawn: NVDA announces toast content automatically (no focus move needed)

## Keyboard activation

- [ ] F6 (browser rotor) should cycle into toast region — NVDA lists notifications landmark via insert+F7
- [ ] Close button on toast reads: `Close notification button` — Enter dismisses
- [ ] Action button in toast (e.g., "Undo") reads button role; Enter activates
- [ ] Escape on focused toast may close it (project-specific)

## Focus management

- [ ] Toast does NOT steal focus on appear (APG requirement — would be disorienting)
- [ ] Focus moves to toast ONLY on explicit user interaction (click or F6 rotation)
- [ ] After close/dismiss, focus returns to element that invoked toast (or stays where it was)

## Live regions / announcements

- [ ] role="status" (polite): NVDA waits for current speech to finish before announcing — no interruption
- [ ] role="alert" (assertive): NVDA interrupts current speech to announce immediately
- [ ] Toast content read ONCE — not re-read on DOM removal (verify no double-announce)
- [ ] Queued toasts: each announces in order; polite queue does not pile up

## Navigation within component

- [ ] Virtual cursor (NVDA browse) can navigate to toast region via insert+F7 → toast landmark
- [ ] Inside toast: links, buttons reachable via Tab if focused; otherwise virtual cursor arrows

## Disabled states

- [ ] Action buttons within a toast (e.g., "Undo" after timeout) may disable — announce "disabled"

## Edge cases specific to Toast

- [ ] Auto-dismiss (timeout): content read once on spawn; NOT re-read on hide
- [ ] Pause on hover: not SR-relevant (NVDA doesn't hover); but focus should pause timeout
- [ ] Focus on toast pauses timeout (APG requirement): verify timeout doesn't kill toast while user reads
- [ ] Multiple toasts stacked: each announces separately; order preserved
- [ ] Toast with icon (success, error, warning): icon is decorative (aria-hidden); severity conveyed via aria-live level (assertive for errors)
- [ ] Rich toast (title + description): NVDA reads full content in one announcement
- [ ] Dismiss button must be reachable via F6 → Tab sequence (APG requirement)
- [ ] Toast persists until dismissed OR times out — both paths should work for SR users

## Known NVDA-specific quirks

- NVDA + Firefox is best for live regions; Chrome sometimes delays status announcements
- role="alert" on the toast itself (vs on a wrapping region) both work — verify project choice
- If toast DOM is removed while NVDA is still reading it, speech stops abruptly — acceptable
- Stacked toasts: NVDA may coalesce consecutive status messages — expected with polite queue

## Findings

### PASS notes
- <anything unexpected but correct>

### Issues (severity)
- **CRITICAL:** <blocks SR users>
- **IMPORTANT:** <degraded UX>
- **NITPICK:** <cosmetic>

---

**Verdict:** __________________ **Date:** __________ **Tester:** __________
