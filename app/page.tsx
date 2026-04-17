import Link from 'next/link';
import styles from './page.module.scss';

interface ComponentLink {
  href: string;
  name: string;
  description: string;
  phase: string;
  status: 'available' | 'pending';
}

const components: ComponentLink[] = [
  {
    href: '/components/stack',
    name: 'Stack',
    description: 'Vertical flex layout atom with gap, align, justify, divider.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/inline',
    name: 'Inline',
    description: 'Horizontal flex layout atom with wrap and collapseBelow.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/container',
    name: 'Container',
    description: 'Max-width centered wrapper with size + padding variants.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/section',
    name: 'Section',
    description:
      'Full-width semantic band with bg variants and tag override.',
    phase: 'Phase 1 — Layout',
    status: 'available',
  },
  {
    href: '/components/heading',
    name: 'Heading',
    description:
      'Semantic h1-h6 with decoupled visual size, weight, color, align, asChild.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/text',
    name: 'Text',
    description:
      'Universal body text with five variants, weight, color, uppercase, asChild.',
    phase: 'Phase 2 — Typography',
    status: 'available',
  },
  {
    href: '/components/card',
    name: 'Card',
    description:
      'Surface container with 4 variants, hoverable, accent positions, and 4 flat slot components.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/badge',
    name: 'Badge',
    description:
      'Inline status / category indicator with 6 colors, pill, dot, icon, uppercase, asChild.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/separator',
    name: 'Separator',
    description:
      'Divider line with subtle / gradient / brand variants, horizontal + vertical orientation.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/icon-box',
    name: 'IconBox',
    description:
      'Square icon container with 5 variants, 3 sizes, and asChild for interactive use.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/avatar',
    name: 'Avatar',
    description:
      'User identity with image / initials fallback chain, 5 sizes, status indicator.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/skeleton',
    name: 'Skeleton',
    description:
      'Loading placeholder with text / rect / circle variants and pulse / shimmer animations.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/spinner',
    name: 'Spinner',
    description:
      'Inline loading indicator with 4 sizes, 3 colors, and accessible status semantics.',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/aspect-ratio',
    name: 'AspectRatio',
    description:
      'Media container with fixed aspect ratio for images, video, iframes (Tier B).',
    phase: 'Phase 3 — Display',
    status: 'available',
  },
  {
    href: '/components/button',
    name: 'Button + ButtonGroup',
    description:
      '5 variants, 3 sizes, icon + iconOnly + href fallback + asChild. ButtonGroup joins via joined-group mixin (server-safe).',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/input',
    name: 'Input + Label + Textarea',
    description:
      'Form trio with controlled / uncontrolled state, auto-id label coupling, error + helper, start/end icons.',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/selection',
    name: 'Checkbox + RadioGroup',
    description:
      'Native form inputs with custom styling, checkmark + radioFill animations, controlled state, context-driven group.',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/toggles',
    name: 'Toggle + Switch + Accordion',
    description:
      'Toggle (aria-pressed), ToggleGroup (single/multiple, joined-group reuse), Switch (animated thumb), Accordion (APG disclosure).',
    phase: 'Phase 4 — Simple Interactive',
    status: 'available',
  },
  {
    href: '/components/input-production',
    name: 'Input Production Hardening',
    description:
      'E08 — Input prefix/suffix/counter/clearable/loading, InputGroup + InputGroupText, NumberInput, MaskedInput, PhoneInput, PasswordInput.',
    phase: 'Phase 4 — Simple Interactive (E08)',
    status: 'available',
  },
  {
    href: '/components/feedback',
    name: 'Feedback',
    description:
      'E09 — Empty (zero-result slot + CTA), Alert (4 variants + opt-in dismiss + href body), Progress (discriminated union stages XOR percent).',
    phase: 'Phase 5 — Feedback',
    status: 'available',
  },
  {
    href: '/components/specialized',
    name: 'Specialized',
    description:
      'E10+E11 — Dot, MetricBar, AnimatedCounter, Breadcrumb, Pagination (Tier A) + UsageDonut, AvailabilityBar, Kbd (Tier B). Phase 6 complete.',
    phase: 'Phase 6 — Specialized',
    status: 'available',
  },
  {
    href: '/components/molecules',
    name: 'Molecules',
    description:
      'E12 — DataRow, BackLink, SectionDivider, AccordionGroup (single/multiple), ToggleGroupFilter, DeadlineBadge (hydration-safe countdown).',
    phase: 'Phase 7 — Molecules',
    status: 'available',
  },
  {
    href: '/components/presets',
    name: 'Card Presets',
    description:
      'E13 — ContentCard, SidebarCard, FormCard, StatsCard (stacked/inline/icon-lead), ActionCard (severity-driven accent).',
    phase: 'Phase 8 — Card Presets',
    status: 'available',
  },
  {
    href: '/demo',
    name: 'Demo showcase',
    description:
      'E14 — one-stop showcase of all 66 components in 9 phase sections (incl. Phase 10 complex interactive) with runtime theme toggle.',
    phase: 'Phase 9 — Demo & Docs',
    status: 'available',
  },
  {
    href: '/components/dialog',
    name: 'Dialog',
    description:
      'E15 CI1 — modal dialog with portal, focus trap, scroll lock, Escape close. First Phase 10 complex interactive. APG /dialog-modal/ pattern.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/alert-dialog',
    name: 'AlertDialog',
    description:
      'E16 CI2 — modal alert dialog with required aria-describedby, least-destructive initial focus, background inert, confirm/cancel action row. APG /alertdialog/ pattern. Reuses useFocusTrap from Dialog.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/drawer',
    name: 'Drawer',
    description:
      'E17 CI3 — bottom-positioned modal sheet. Slide-up keyframe, top-only border-radius, iOS safe-area-inset, sticky footer with scrollable body, height variants (sm/md/lg dvh). APG /dialog-modal/ modifier. Reuses useFocusTrap from Dialog.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/sheet',
    name: 'Sheet',
    description:
      'E18 CI4 — 4-directional side panel (left/right/top/bottom). Per-side animation, inner-corner border-radius, safe-area-inset. Horizontal uses width variants, vertical uses height. Closes the Drawer family. Reuses useFocusTrap.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/tooltip',
    name: 'Tooltip',
    description:
      'E19 CI6 — modeless floating label on hover/focus. Own positioning engine (utils/position.ts + utils/useFloating.ts, zero deps), 12 placements with flip + shift, TooltipProvider delay group, SC 1.4.13 compliant (dismissable + hoverable + focus parity). APG /tooltip/.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/popover',
    name: 'Popover',
    description:
      'E20 CI5 — floating panel anchored to a trigger. Compound flat API (Popover + PopoverTrigger + PopoverContent). Extends positioning engine with arrow middleware + optional arrow ref in useFloating. Non-modal default or opt-in modal (reuses useFocusTrap). Outside-click pointerdown capture dismiss. APG /dialog-modal/ modeless modifier.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/dropdown-menu',
    name: 'DropdownMenu',
    description:
      'E21 CI7 — accessible menu with 7 compound flat exports (DropdownMenu + Trigger + Content + Item + Separator + Label + Group). Full APG /menu/ keyboard model: Enter/Space/ArrowDown opens first item, ArrowUp opens last, arrow keys cycle with wraparound, Home/End jump, typeahead (multi-char buffer 500ms reset), Escape restores focus, Tab closes. Own compound API (does not reuse Popover — role="dialog" incompatible). onSelect cancelable event for future Checkbox/Radio items.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/context-menu',
    name: 'ContextMenu',
    description:
      'E22 CI8 — right-click menu per APG /menu/. Inherits full DropdownMenu keyboard model + adds contextmenu event trigger, position-at-cursor via direct computePosition call (skip useFloating), native browser context menu suppression, close-on-scroll convention. 7 flat compound exports. E23 floating primitives consumer (dismiss + portal + focus + state + context).',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/hover-card',
    name: 'HoverCard',
    description:
      'E24 CI9 — hover-triggered floating surface for rich contextual content (user profile previews, link previews). Compound flat API (HoverCard + Provider + Trigger + Content). FIRST validate-in-production consumer of E23 floating primitives (useFloatingState + FloatingPortal + createFloatingContext + useFloating). Skips useFloatingDismiss + useFloatingFocus (closes via mouseleave + grace area, not Escape; non-modal so no focus trap). Tooltip-style timer pattern + delay group + coarse pointer detection. SC 1.4.13 compliant. role="dialog" aria-modal="false" (NOT tooltip — interactive content). Desktop-only (touch users get focus path).',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/navigation-menu',
    name: 'NavigationMenu',
    description:
      'E25 CI10 — accessible navigation menubar per APG /menubar/. 7 named exports (NavigationMenu + List + Item + Trigger + Content + Link + Provider). Roving tabindex via DOM attribute updates (no React re-render). Right/Left arrow cycle menubar, Down/Enter/Space opens submenu first item, Up opens last, Escape returns to parent menubar item, Tab exits menubar entirely, Home/End scope-aware, typeahead 500ms reset. NavigationMenuProvider mirrors HoverCardProvider delay group. Hover (200ms default — snappier than HoverCard 700ms) + click + keyboard, coarse pointer skips hover. Validate-in-production #2 of E23 primitives — first consumer to combine useFloatingFocus + useFloatingDismiss together. Standalone Link items can render directly inside menubar without aria-haspopup (mixed dropdown + standalone navigation pattern).',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/tabs',
    name: 'Tabs',
    description:
      'E26 CI11 — accessible tabs widget per APG /tabs/. 4 compound flat exports (Tabs + TabsList + TabsTrigger + TabsContent). Self-contained — zero E23 floating primitives needed (content inline, not floating). Roving tabindex pattern reused from NavigationMenu via inline helper. 3 variants (underline default, pill, segmented iOS-style). Horizontal + vertical orientations. Automatic activation (default — tab activates on focus) OR manual (Space/Enter required, for async-loaded panels). Auto-generated IDs via useId wire aria-controls + aria-labelledby. Tabpanel tabindex={0} so Tab from active trigger moves focus INTO panel per APG composite widget contract. Disabled triggers skipped by arrow nav + Home/End. RTL support via dir prop. Modifier-key guard (Cmd/Ctrl/Alt/Shift + arrow not intercepted — browser hotkeys like Cmd+← back-nav take precedence, Radix TB-R04 fix).',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/select',
    name: 'Select',
    description:
      'E27 CI12 — accessible single-value dropdown form field per APG /combobox/ collapsed-listbox (select-only) + /listbox/. 8 compound flat exports (Select + Trigger + Value + Content + Group + Label + Item + Separator). FIRST listbox sub-family in Phase 10. aria-activedescendant pattern — focus stays on the trigger, highlighted option is virtual (differs from NavigationMenu/Tabs roving tabindex). E23 primitives consumed 4/5: useFloatingState + createFloatingContext + FloatingPortal + useFloatingDismiss; skips useFloatingFocus because focus never leaves trigger. Inline value state (string | null) and typeahead per E27 Phase 2 self-audit override — Rule of Three extraction deferred to E28 Combobox as 4th consumer. Full APG keyboard: Space/Enter/Arrow open, Home/End, PageDown/Up ±10, Enter/Space commit, Escape no-commit, Tab commit + propagate (Radix convention), Alt+ArrowUp no-commit, printable char typeahead 500ms reset. Form participation via hidden <input> synced to value when name prop provided. aria-disabled only (NOT native disabled) per NavigationMenu/Tabs precedent.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/combobox',
    name: 'Combobox',
    description:
      'E28 CI13 — accessible autocomplete input per APG /combobox/ editable variant. 8 compound flat exports (Combobox + Input + Content + Item + Empty + Group + Label + Separator). SECOND listbox sub-family — pattern-child of Select E27. Extends Select with text input trigger + case-insensitive contains filter on item textContent/textValue. Consumes 4/5 E23 primitives (same as Select — skips useFloatingFocus). Three filter modes: "auto" default (built-in substring match), false (consumer-controlled via search prop + pre-filtered items), or custom function (items, search) => items[]. Hidden items omitted from DOM when non-matching. Radix Strategy A blur — auto-commit on exact match + revert input to committed value label on mismatch. Escape (closed + non-empty search) clears search keeping value; Escape (open) closes + reverts search. Alt+ArrowDown opens showing ALL items ignoring filter. IME composition events (onCompositionStart/End) guard prevents mid-char opens for CJK users. acceptFreeText prop opt-in for tag-input patterns where Enter commits typed text on no-match. ComboboxEmpty slot renders when filter yields 0 matches. 4 state slots (open, value, search, highlightedId). Rule of Three extractions (useFloatingValueState<T> + useTypeahead<T>) DEFERRED to E29 dedicated refactor sprint per E23 FloatingRoot precedent.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/slider',
    name: 'Slider',
    description:
      'E33 CI14 — accessible single-thumb value selector per APG /slider/. 4 compound flat exports (Slider + SliderTrack + SliderRange + SliderThumb). FIRST drag-gesture primitive consumer in the library. Zero-dep drag via PointerEvent + setPointerCapture on track (React onPointer* handlers receive events via capture bubble even when pointer leaves visible bounds). role="slider" on thumb with aria-valuenow/min/max/orientation/valuetext. Keyboard: Arrow ±step, Shift+Arrow ±largeStep (default step×10 Radix convention), PageUp/Dn ±largeStep, Home/End → min/max. Modifier guard Ctrl/Meta/Alt skip (Shift IS largeStep). RTL horizontal mirror (ArrowLeft = increase when dir="rtl"); vertical Up always increases. `inverted` prop composable with RTL via XOR. Decimal-step precision-safe via Math.round((raw - min) / step) * step + min + toFixed(decimals). Disabled via aria-disabled only (focusable). ReadOnly focusable + no changes. Form participation via hidden <input type="range"> when name prop set. Touch target 44×44 via ::before pseudo at @media (pointer: coarse) — visible thumb 1.125rem. forced-colors: active HCM block. formatValue callback → aria-valuetext override. onValueCommit fires on pointerup + keyboard keyup. Pattern-parent for Carousel CI21 + future range slider + splitter + Drawer resize handle.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/carousel',
    name: 'Carousel',
    description:
      'E34 CI21 — accessible auto-rotating content slider per APG /carousel/. 6 compound flat exports (Carousel + CarouselViewport + CarouselSlide + CarouselPrev + CarouselNext + CarouselPause). SECOND drag-gesture primitive consumer + FIRST auto-rotation + FIRST live-region component. role="region" aria-roledescription="carousel" + required aria-label; slides role="group" aria-roledescription="slide" aria-label="N of M" + aria-hidden when not current. WCAG 2.2.2 pause control — CarouselPause button aria-pressed toggle required when autoRotate (renders null otherwise). WCAG 1.4.13 pause on hover/focus/visibilitychange + prefers-reduced-motion reactive via pauseReasons Set state (React 19 refs-rule compliant — state not ref so derived isPaused/isReducedMotion/shouldRotate are safe during render). Live region role="status" aria-live="polite" aria-atomic="true" announces "Slide N of M" on index change; silent during auto-rotation by default, opt-in via announceAutoRotate. Initial mount silent via render-time prop-sync sentinel (E31 precedent). Drag via PointerEvent + setPointerCapture on viewport — 2nd consumer reusing Slider E33 pattern. Snap threshold max(viewportWidth * 0.2, 40px). touch-action: pan-y blocks horizontal swipe stealing without blocking vertical page scroll. Keyboard on viewport (tabIndex=0): ArrowLeft/Right prev/next (RTL-mirrored), Home/End, modifier-key guard. Linear clamp default; `loop?` wraps. Nav buttons aria-disabled at edges or total ≤ 1. Phase 5 CRIT fix: prefers-reduced-motion transition suppression MUST live in JS inline trackStyle (CSS !important cannot override inline style — dead rule removed from SCSS). Drag INLINE per Rule of Three — extraction to utils/gesture/usePointerDrag.ts deferred until 3rd consumer (ScrollArea thumb CI20). Pattern-parent for future multi-slide variant + grouped picker.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/scroll-area',
    name: 'ScrollArea',
    description:
      'E35 CI20 — custom-scrollbar wrapper preserving native scroll. 5 compound flat exports (ScrollArea + ScrollAreaViewport + ScrollAreaScrollbar + ScrollAreaThumb + ScrollAreaCorner). THIRD drag-gesture primitive consumer → TRIGGERS Rule of Three for utils/gesture/usePointerDrag.ts extraction (deferred to E36 refactor Epic per E23 FloatingRoot + E29 useFloatingValueState precedent). No APG pattern (scroll regions implicit browser behavior); WCAG 2.1.1 satisfied via viewport tabIndex=0 preserving native PageUp/Dn/Arrow/Home/End/Space keyboard scroll. Native scrollbars hidden (scrollbar-width: none + ::-webkit-scrollbar display:none + -ms-overflow-style: none). Our scrollbars VISUAL + POINTER-DRAG only, not keyboard-focusable. 4 visibility modes: always (design tools) + scroll DEFAULT (auto-hide 600ms linger OS convention) + hover (desktop minimalist) + auto (pointer:fine scroll mode, pointer:coarse entirely hidden so mobile native takes over). Proportional thumb size clientSize/scrollSize * trackSize with 24px floor. Drag via setPointerCapture + ratio-based scrollTo({behavior:instant}) method call (NOT direct viewport.scrollTop=X assignment per React 19 react-hooks/immutability rule). Track click-to-page scrollBy({behavior:smooth|instant}) PRM-reactive. Single ResizeObserver on viewport + first content child; metrics state prev/next comparison avoids redundant re-renders. Auto-default children via React.Children type-check traversal (Phase 5 CRIT bug fix — initial truthy check was broken because ReactElement is truthy). usePointerCoarse + useReducedMotion via useSyncExternalStore/matchMedia reactive. forced-colors HCM block. Pattern-parent for future DataTable.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/input-otp',
    name: 'InputOTP',
    description:
      'E36 CI18 — one-time password / verification code entry. 4 compound flat exports (InputOTP + InputOTPGroup + InputOTPSlot + InputOTPSeparator). Single semantic <input> stretched absolutely across decorative slot cells (guilhermerodz input-otp zero-dep reimplementation per D5/D25). Real input transparent color/caret + ::selection → hidden but focusable; slots aria-hidden="true" decorative, read index from context + render value[index] char + fake CSS caret. Slot click → setSelectionRange(i,i) repositions caret driving active-slot highlight via data-active. Pattern filter — "numeric" (default), "alphanumeric", "alpha", or custom RegExp — invalid chars rejected silently via onBeforeInput preventDefault + onChange safety filter. IME composition guard (isComposingRef + key="Process" + keyCode=229) per E28 Combobox precedent. Paste handler strips whitespace/hyphens, filters by pattern, truncates at maxLength, splices at caret. onComplete fires ONCE per transition to full length via prevCompleteRef (initialized false — defaultValue full-length still triggers first user completion). autoComplete="one-time-code" DEFAULT enables iOS Safari 12+ + Android Chrome 84+ SMS autofill. inputMode derived from pattern. Auto-default Slots when no children via internal DefaultSlots component. Form participation via name on single real input. 44×44 touch target via @include touch-target mixin. forced-colors: active HCM block. prefers-reduced-motion disables caret blink + transitions. WCAG 2.1 SC 1.1.1 DEV-mode warning if missing both aria-label + aria-labelledby. Pattern-parent for future PinInput / ConfirmationCode / license-key entry.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/command',
    name: 'Command',
    description:
      'E37 CI19 — Cmd+K command palette. SECOND composition Epic after DatePicker E31. 9 compound flat exports (Command + CommandInput + CommandList + CommandEmpty + CommandGroup + CommandItem + CommandSeparator + CommandShortcut + CommandLoading) + useCommandShortcut hook. Combines APG /combobox/ editable (text input + filtered listbox) + /dialog-modal/ (modal shell with focus trap, Escape close, backdrop dismiss, scroll lock, inert siblings). Reuses Dialog E15 useFocusTrap + FloatingPortal E23 — does NOT compose Combobox E28 code (E28 carries floating machinery Command doesn\'t need; reimplements filter + listbox with shared PATTERNS: IME guard, deriveTextFromChildren, aria-activedescendant, first-visible-enabled auto-highlight). Item registry via STATE Map (new Map on mutation) per React 19 react-hooks/refs rule. Render-time prop-sync highlight reset (E34 Carousel precedent) when open/search/visible items change. Filter modes: "auto" substring default, false (consumer-owned items), or custom (items, search) => visibleIds[] function. Group heading auto-hides when all children filter out (forceMount prop opts out). CommandShortcut = decorative inline kbd pill (aria-hidden). commitHighlighted dispatches synthetic "cmd-select" CustomEvent on item element; item listens via addEventListener for controller-style commit. List key handler registered via setState callback (not context-reachable ref slot per React 19 immutability). useCommandShortcut hook optional — binds Cmd+K/Ctrl+K globally to toggle open state (consumer-owned per D8 separation of concerns). Keyboard: type filters live, ArrowDown/Up navigates with wraparound + skip disabled, Home/End first/last, PageDown/Up ±10, Enter commits highlighted, Escape closes + restore focus, Tab cycles focus trap, backdrop click dismisses. WCAG 2.1 SC 1.1.1 DEV-mode warn if missing aria-label + aria-labelledby. Pattern-parent for SearchBar (non-modal combobox in header) + Spotlight (floating search) + Admin Center (nested pages).',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
  {
    href: '/components/sidebar',
    name: 'Sidebar',
    description:
      'E38 CI22 FINISHER — lands 80/80 Phase 10 COMPLETE. Composition — APG /disclosure/ (trigger + collapsible panel with aria-expanded/aria-controls) + plain navigation (<nav> + <a> + aria-current="page"). 9 compound flat exports (SidebarProvider + Sidebar + SidebarTrigger + SidebarHeader + SidebarContent + SidebarFooter + SidebarGroup + SidebarItem + SidebarSeparator) + useSidebar hook. Responsive: desktop fixed <aside> rail (sticky, border, 280px) + mobile drawer via FloatingPortal E23 + useFocusTrap (Dialog E15) + scroll lock + inert siblings + Escape + backdrop dismiss (all inline — single dispatch, no outside-click hook). Mobile breakpoint default 768px (overridable) via useSyncExternalStore + matchMedia (Carousel E34 / ScrollArea E35 precedent — triggers Rule of Three for useMatchMedia<T> extraction deferred to post-Phase 10 refactor). Opt-in cookie persistence (persist prop + cookieName) — consumer reads cookie in Server Component layout and passes to defaultOpen for SSR-friendly no-flash hydration. SidebarItem polymorphic via asChild (Next.js Link wrappers), isActive → aria-current="page" + data-active, disabled → aria-disabled + tabIndex=-1 + onClick preventDefault (link stays focusable per Tabs/NavigationMenu/Select precedent; native disabled invalid on <a>). SidebarTrigger polymorphic, default renders hamburger SVG that flips on open state. SidebarGroup role="group" + optional label prop auto-wires aria-labelledby. SidebarSeparator role="separator" aria-orientation="horizontal". side="left" | "right" explicit (no RTL auto-mirror). collapseMode "offcanvas" (default — desktop hides fully, mobile drawer) | "none" (always visible). 44×44 touch target on Trigger + Item via @include touch-target mixin. forced-colors: active HCM block (Canvas/CanvasText/LinkText/Highlight/HighlightText/GrayText/ButtonText). prefers-reduced-motion disables drawer animations + transitions. Cmd+B shortcut NOT built-in — consumer opts in via useSidebar() hook + own window keydown listener (D8 separation of concerns). WCAG 2.1 SC 1.1.1 DEV-mode warn if missing aria-label + aria-labelledby. Defers icon collapse mode (needs Tooltip E19), SidebarRail drag-resize, floating/inset variants, nested submenus — YAGNI / post-Phase-10 scope. Pattern-parent for future dashboard layouts + admin shells + settings panes.',
    phase: 'Phase 10 — Complex Interactive',
    status: 'available',
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>bleizlabs-ui</h1>
        <p>
          Internal dev playground. Each link below renders a component in
          isolation against the live token system.
        </p>
      </header>
      <ul className={styles.grid}>
        {components.map((c) => (
          <li key={c.href} className={styles.card} data-status={c.status}>
            <Link href={c.href}>
              <span className={styles.phase}>{c.phase}</span>
              <strong>{c.name}</strong>
              <span className={styles.description}>{c.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
