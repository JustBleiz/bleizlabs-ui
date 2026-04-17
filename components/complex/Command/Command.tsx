'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent as ReactCompositionEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { FloatingPortal } from '../../utils/floating';
import { useFocusTrap } from '../Dialog/useFocusTrap';
import styles from './Command.module.scss';

/**
 * Command — Cmd+K / Ctrl+K command palette (Phase 10 CI19).
 *
 * @layer    complex-interactive
 * @tokens   --color-surface, --color-surface-raised, --color-surface-muted,
 *           --color-border, --color-border-subtle, --color-brand,
 *           --color-text-primary, --color-text-muted, --color-overlay,
 *           --focus-ring (via mx.focus-ring mixin), --radius-md, --radius-lg,
 *           --shadow-lg, --duration-normal, --duration-fast, --easing-default,
 *           --space-{1,2,3,4,6}, --z-modal, --font-mono,
 *           --font-size-xs, --font-size-sm, --font-size-base
 * @deps     cn, mergeRefs, FloatingPortal (E23), useFocusTrap (Dialog E15)
 * @a11y     SECOND composition Epic after DatePicker E31. Combines APG
 *           `/combobox/` editable (text input + filtered listbox) with
 *           `/dialog-modal/` (modal shell, focus trap, Escape close,
 *           backdrop dismiss, scroll lock, inert siblings). NOT a compose
 *           of Combobox E28 directly — E28 carries floating machinery
 *           (useFloating + useFloatingDismiss + separate trigger+popup)
 *           that Command doesn't need. Command reimplements filter + item
 *           registry + listbox keyboard with shared PATTERNS from E28
 *           (substring filter default, hidden-sentinel for non-matching,
 *           aria-activedescendant, IME guard, deriveTextFromChildren).
 *           Dialog primitives REUSED: `useFocusTrap` hook from E15,
 *           `FloatingPortal` from E23. Escape + backdrop dismiss inline.
 *           Dialog element has `role="dialog" aria-modal="true"
 *           aria-label`. Input has `role="combobox" aria-expanded="true"
 *           aria-controls aria-activedescendant aria-autocomplete="list"`.
 *           List has `role="listbox" aria-labelledby`. Item
 *           `role="option" aria-selected aria-disabled`. Group
 *           `role="group" aria-labelledby`. Separator `role="none"`.
 *           Shortcut `aria-hidden="true"` decorative. Empty
 *           `role="presentation"`. Loading `role="status" aria-live="polite"`.
 *           Focus stays on input while navigating listbox
 *           (aria-activedescendant pattern). Scroll lock via
 *           `document.body.style.overflow`. Sibling inert via
 *           `aria-hidden="true"` on `document.body` children (own impl,
 *           matches Dialog). First item auto-highlighted on open + on
 *           search change (cmdk convention).
 *           **Keyboard trigger (Cmd+K / Ctrl+K) is consumer-owned** —
 *           different apps bind keys differently. Consumer calls
 *           `setOpen(true)` from their own `keydown` listener. Optional
 *           `useCommandShortcut(key, callback)` hook exported for
 *           convenience.
 * @apg      https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 *           https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *           (composition — no dedicated "command palette" APG spec;
 *           keyboard + ARIA conform to both pattern intersections).
 * @tested   tsc + eslint + next build (Playwright/NVDA/axe deferred per
 *           E15 scope).
 * @regressions tests/Command.{keyboard,focus,aria,regression}.spec.md —
 *           22 regression cases CMD-R01..R22 in `docs/specs/command-spec.md`
 *           (promoted from `_tmp` in E42).
 *
 * @example
 * // Basic controlled
 * const [open, setOpen] = useState(false);
 * useCommandShortcut('k', () => setOpen((o) => !o));
 * return (
 *   <Command open={open} onOpenChange={setOpen} aria-label="Command palette">
 *     <CommandInput placeholder="Type a command…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Actions">
 *         <CommandItem value="new-file" onSelect={() => {}}>
 *           New file
 *           <CommandShortcut>⌘N</CommandShortcut>
 *         </CommandItem>
 *         <CommandItem value="open-file" onSelect={() => {}}>
 *           Open file
 *           <CommandShortcut>⌘O</CommandShortcut>
 *         </CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </Command>
 * );
 */

// ============================================================================
// Types
// ============================================================================

export type CommandFilter =
  | 'auto'
  | false
  | ((items: CommandItemRecord[], search: string) => string[]);

export interface CommandItemRecord {
  id: string;
  value: string;
  textContent: string;
  disabled: boolean;
}

export interface CommandProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. Default `false`. */
  defaultOpen?: boolean;
  /** Fires on open/close transitions. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled search. */
  search?: string;
  /** Uncontrolled initial search. Default `''`. */
  defaultSearch?: string;
  /** Fires on every search change (typing, paste, clear). */
  onSearchChange?: (search: string) => void;
  /**
   * Filter mode. Default `'auto'` = case-insensitive substring contains on
   * each item's `textContent` (derived from `textValue` prop or child text).
   * `false` = consumer filters via externally-provided items (raw `textContent`
   * lookup). Custom function `(items, search) => visibleIds[]` for fuzzy
   * search or domain-specific ranking.
   */
  filter?: CommandFilter;
  /** Async loading state — shows CommandLoading when `true`. */
  loading?: boolean;
  /** Close dialog when backdrop clicked. Default `true`. */
  closeOnOutsideClick?: boolean;
  /** Close dialog when Escape pressed. Default `true`. */
  closeOnEscape?: boolean;
  /** Accessible name for the dialog. Required when not using `aria-labelledby`. */
  'aria-label'?: string;
  /** External label node id. */
  'aria-labelledby'?: string;
  /** Compound children — CommandInput + CommandList + sub-items. */
  children: ReactNode;
}

export type CommandInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size'
>;

export type CommandListProps = HTMLAttributes<HTMLDivElement>;

export type CommandEmptyProps = HTMLAttributes<HTMLDivElement>;

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional heading text displayed above items. */
  heading?: ReactNode;
  /** Keep heading visible even when all items are filtered. Default `false`. */
  forceMount?: boolean;
}

export interface CommandItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Unique identifier. Required. Passed to `onSelect`. */
  value: string;
  /**
   * Text used for filtering + typeahead. If omitted, derived from React
   * children (recursive string extraction).
   */
  textValue?: string;
  /** Disable selection (item stays visible but skipped by keyboard + mouse). */
  disabled?: boolean;
  /** Fires when user commits this item (Enter with highlight OR mouse click). */
  onSelect?: (value: string) => void;
}

export type CommandSeparatorProps = HTMLAttributes<HTMLDivElement>;

export type CommandShortcutProps = HTMLAttributes<HTMLSpanElement>;

export type CommandLoadingProps = HTMLAttributes<HTMLDivElement>;

// ============================================================================
// Helpers
// ============================================================================

function deriveTextFromChildren(children: ReactNode): string {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(deriveTextFromChildren).join('');
  }
  if (
    typeof children === 'object' &&
    'props' in children &&
    (children as { props?: { children?: ReactNode } }).props !== undefined
  ) {
    const childProps = (children as { props: { children?: ReactNode } }).props;
    return deriveTextFromChildren(childProps.children);
  }
  return '';
}

function defaultFilterMatch(textContent: string, search: string): boolean {
  if (search === '') return true;
  return textContent.toLowerCase().includes(search.toLowerCase());
}

// ============================================================================
// Context — root (state)
// ============================================================================

interface CommandContextValue {
  open: boolean;
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
  inputId: string;
  listId: string;
  labelId: string | undefined;
  registerItem: (record: CommandItemRecord) => void;
  unregisterItem: (id: string) => void;
  visibleItemIds: ReadonlySet<string>;
  matchCount: number;
  highlightedId: string | null;
  setHighlightedId: (id: string | null, source: 'keyboard' | 'mouse') => void;
  commitHighlighted: () => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setListKeyHandler: (handler: ((event: KeyboardEvent) => void) | null) => void;
  invokeListKeyHandler: (event: KeyboardEvent) => void;
  closeOnEscape: boolean;
  requestClose: () => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommandContext(hookName: string): CommandContextValue {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error(
      `${hookName} must be used inside <Command>. Compound children must live under a Command root.`,
    );
  }
  return ctx;
}

// ============================================================================
// Command (root)
// ============================================================================

export const Command = forwardRef<HTMLDivElement, CommandProps>(function Command(
  {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    search: controlledSearch,
    defaultSearch = '',
    onSearchChange,
    filter = 'auto',
    loading = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isOpenControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;

  const isSearchControlled = controlledSearch !== undefined;
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearch);
  const search = isSearchControlled ? controlledSearch : uncontrolledSearch;

  const generatedId = useId();
  const inputId = `cmd-input-${generatedId}`;
  const listId = `cmd-list-${generatedId}`;
  const labelId = ariaLabelledby;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMemo(() => mergeRefs(ref, contentRef), [ref]);

  // Item registry — STATE Map (not ref) so filter can read during render per
  // React 19 react-hooks/refs rule. setRegistry creates a new Map instance
  // on every mutation to trigger subscribers.
  const [registry, setRegistry] = useState<ReadonlyMap<string, CommandItemRecord>>(
    () => new Map(),
  );

  const registerItem = useCallback((record: CommandItemRecord) => {
    setRegistry((prev) => {
      const next = new Map(prev);
      next.set(record.id, record);
      return next;
    });
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setRegistry((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Filter computation — derives visibleItemIds + matchCount from state +
  // search. Pure render-time memo on STATE (not ref). React 19 compliant.
  const { visibleItemIds, matchCount, firstVisibleEnabledId } = useMemo(() => {
    const all = Array.from(registry.values());
    let visibleIds: string[];
    if (filter === false) {
      visibleIds = all.map((r) => r.id);
    } else if (typeof filter === 'function') {
      visibleIds = filter(all, search);
    } else {
      visibleIds = all
        .filter((r) => defaultFilterMatch(r.textContent, search))
        .map((r) => r.id);
    }
    const visibleSet = new Set(visibleIds);
    const firstEnabled = all.find(
      (r) => visibleSet.has(r.id) && !r.disabled,
    );
    return {
      visibleItemIds: visibleSet,
      matchCount: visibleIds.length,
      firstVisibleEnabledId: firstEnabled ? firstEnabled.id : null,
    };
  }, [registry, search, filter]);

  const [highlightedId, setHighlightedIdState] = useState<string | null>(null);

  const setHighlightedId = useCallback(
    (id: string | null, source: 'keyboard' | 'mouse') => {
      setHighlightedIdState(id);
      if (source === 'keyboard' && id !== null) {
        const element = document.getElementById(id);
        element?.scrollIntoView({ block: 'nearest' });
      }
    },
    [],
  );

  // Render-time prop-sync for highlight reset — E34 Carousel / E31 DatePicker
  // precedent. Triggers when open / search / visibleItemIds changes.
  // `setState during render` branch only fires when values diverge, React
  // flushes before commit.
  const [highlightSync, setHighlightSync] = useState({
    open: false,
    search: '',
    firstId: null as string | null,
  });
  if (
    highlightSync.open !== open ||
    highlightSync.search !== search ||
    highlightSync.firstId !== firstVisibleEnabledId
  ) {
    setHighlightSync({
      open,
      search,
      firstId: firstVisibleEnabledId,
    });
    if (!open) {
      setHighlightedIdState(null);
    } else if (
      highlightedId === null ||
      !visibleItemIds.has(highlightedId)
    ) {
      setHighlightedIdState(firstVisibleEnabledId);
    }
  }

  // List key handler registration — stored in state (not context-reachable
  // ref) per React 19 react-hooks/immutability rule. List calls setHandler
  // on mount + cleanup; input invokes via invokeHandler().
  const [listKeyHandler, setListKeyHandlerState] = useState<
    ((event: KeyboardEvent) => void) | null
  >(null);

  const setListKeyHandler = useCallback(
    (handler: ((event: KeyboardEvent) => void) | null) => {
      setListKeyHandlerState(() => handler);
    },
    [],
  );

  const invokeListKeyHandler = useCallback(
    (event: KeyboardEvent) => {
      listKeyHandler?.(event);
    },
    [listKeyHandler],
  );

  const setSearch = useCallback(
    (next: string) => {
      if (!isSearchControlled) setUncontrolledSearch(next);
      onSearchChange?.(next);
    },
    [isSearchControlled, onSearchChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const requestClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const commitHighlighted = useCallback(() => {
    if (highlightedId === null) return;
    const record = registry.get(highlightedId);
    if (!record || record.disabled) return;
    // Dispatch to item's onSelect via event bubbling. The CommandItem
    // renders with data-cmd-item-id — we find the element and dispatch a
    // native 'cmd-select' event that the item handler listens for.
    const element = document.getElementById(highlightedId);
    element?.dispatchEvent(
      new CustomEvent('cmd-select', { bubbles: false }),
    );
  }, [highlightedId, registry]);

  // Focus trap — reuses Dialog E15 hook when dialog is open.
  useFocusTrap(contentRef, open, inputRef);

  // WCAG 2.1 SC 1.1.1 + axe-core `dialog-name` guard — dialog requires
  // accessible name. Dev-only `console.warn` stripped from production via
  // NODE_ENV gate. Fires once per mount.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!ariaLabel && !ariaLabelledby) {
      console.warn(
        '[Command] Missing accessible name. Pass either `aria-label` or `aria-labelledby` — an unlabelled dialog fails axe `dialog-name` rule + WCAG 2.1 SC 1.1.1 / 4.1.2 for screen reader users.',
      );
    }
    // Run once per mount; label changes post-mount are acceptable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll lock — matches Dialog pattern.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Inert siblings — set aria-hidden on body children (excluding portal root).
  useEffect(() => {
    if (!open) return;
    const portalMarker = contentRef.current;
    if (!portalMarker) return;
    const portalRoot = portalMarker.closest('[data-cmd-portal]');
    const siblings: Array<{ el: Element; prev: string | null }> = [];
    Array.from(document.body.children).forEach((child) => {
      if (child === portalRoot) return;
      const prev = child.getAttribute('aria-hidden');
      child.setAttribute('aria-hidden', 'true');
      siblings.push({ el: child, prev });
    });
    return () => {
      siblings.forEach(({ el, prev }) => {
        if (prev === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', prev);
      });
    };
  }, [open]);

  const contextValue = useMemo<CommandContextValue>(
    () => ({
      open,
      search,
      setSearch,
      loading,
      inputId,
      listId,
      labelId,
      registerItem,
      unregisterItem,
      visibleItemIds,
      matchCount,
      highlightedId,
      setHighlightedId,
      commitHighlighted,
      listRef,
      inputRef,
      setListKeyHandler,
      invokeListKeyHandler,
      closeOnEscape,
      requestClose,
    }),
    [
      open,
      search,
      setSearch,
      loading,
      inputId,
      listId,
      labelId,
      registerItem,
      unregisterItem,
      visibleItemIds,
      matchCount,
      highlightedId,
      setHighlightedId,
      commitHighlighted,
      listRef,
      inputRef,
      setListKeyHandler,
      invokeListKeyHandler,
      closeOnEscape,
      requestClose,
    ],
  );

  const handleOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!closeOnOutsideClick) return;
      if (event.target === event.currentTarget) {
        requestClose();
      }
    },
    [closeOnOutsideClick, requestClose],
  );

  if (!open) {
    return (
      <CommandContext.Provider value={contextValue}>
        {/* Register items even when closed so consumer state is preserved */}
        <div className={styles.hiddenRegistry} aria-hidden="true">
          {children}
        </div>
      </CommandContext.Provider>
    );
  }

  return (
    <CommandContext.Provider value={contextValue}>
      <FloatingPortal>
        <div data-cmd-portal className={styles.portalRoot}>
          <div
            className={styles.overlay}
            data-state="open"
            onClick={handleOverlayClick}
          />
          <div
            ref={mergedRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            data-state="open"
            className={cn(styles.root, className)}
            {...rest}
          >
            {children}
          </div>
        </div>
      </FloatingPortal>
    </CommandContext.Provider>
  );
});

// ============================================================================
// CommandInput
// ============================================================================

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  function CommandInput(
    { className, placeholder, onCompositionStart, onCompositionEnd, ...rest },
    ref,
  ) {
    const ctx = useCommandContext('CommandInput');
    const mergedRef = useMemo(
      () => mergeRefs(ref, ctx.inputRef),
      [ref, ctx.inputRef],
    );

    const isComposingRef = useRef(false);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        if (isComposingRef.current) return;
        ctx.setSearch(event.target.value);
      },
      [ctx],
    );

    const handleCompositionStart = useCallback(
      (event: ReactCompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = true;
        onCompositionStart?.(event);
      },
      [onCompositionStart],
    );

    const handleCompositionEnd = useCallback(
      (event: ReactCompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        ctx.setSearch((event.target as HTMLInputElement).value);
        onCompositionEnd?.(event);
      },
      [ctx, onCompositionEnd],
    );

    const handleKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (isComposingRef.current) return;
        if (event.key === 'Process' || event.keyCode === 229) return;

        // Escape — close dialog (inline, single dispatch).
        if (event.key === 'Escape') {
          if (ctx.closeOnEscape) {
            event.preventDefault();
            event.stopPropagation();
            ctx.requestClose();
          }
          return;
        }

        // Enter — commit highlighted item.
        if (event.key === 'Enter') {
          if (ctx.highlightedId !== null) {
            event.preventDefault();
            ctx.commitHighlighted();
          }
          return;
        }

        // Arrow / Home / End — route to list handler.
        if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'Home' ||
          event.key === 'End' ||
          event.key === 'PageDown' ||
          event.key === 'PageUp'
        ) {
          if (event.ctrlKey || event.metaKey || event.altKey) return;
          event.preventDefault();
          ctx.invokeListKeyHandler(event.nativeEvent);
        }
      },
      [ctx],
    );

    return (
      <div className={styles.inputWrap}>
        <svg
          className={styles.inputIcon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L13 13" />
        </svg>
        <input
          ref={mergedRef}
          id={ctx.inputId}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={ctx.listId}
          aria-activedescendant={ctx.highlightedId ?? undefined}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={ctx.search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={cn(styles.input, className)}
          {...rest}
        />
      </div>
    );
  },
);

// ============================================================================
// CommandList
// ============================================================================

export const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  function CommandList({ className, children, ...rest }, ref) {
    const ctx = useCommandContext('CommandList');
    const mergedRef = useMemo(
      () => mergeRefs(ref, ctx.listRef),
      [ref, ctx.listRef],
    );

    // Register keyboard handler for input-routed keys. Handler reads listRef
    // (own local ref from ctx, not mutated) + highlightedId via ctx. State
    // registration (not ref slot) per React 19 immutability rule.
    const { setListKeyHandler, setHighlightedId, highlightedId, listRef: ctxListRef } = ctx;
    useLayoutEffect(() => {
      const handler = (event: KeyboardEvent) => {
        const all = Array.from(
          ctxListRef.current?.querySelectorAll<HTMLElement>(
            '[data-cmd-item][data-visible="true"]:not([aria-disabled="true"])',
          ) ?? [],
        );
        if (all.length === 0) return;
        const currentIdx = highlightedId
          ? all.findIndex((el) => el.id === highlightedId)
          : -1;

        let nextIdx = currentIdx;
        if (event.key === 'ArrowDown') {
          nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % all.length;
        } else if (event.key === 'ArrowUp') {
          nextIdx =
            currentIdx === -1
              ? all.length - 1
              : (currentIdx - 1 + all.length) % all.length;
        } else if (event.key === 'Home') {
          nextIdx = 0;
        } else if (event.key === 'End') {
          nextIdx = all.length - 1;
        } else if (event.key === 'PageDown') {
          nextIdx = Math.min(currentIdx + 10, all.length - 1);
          if (currentIdx === -1) nextIdx = Math.min(10, all.length - 1);
        } else if (event.key === 'PageUp') {
          nextIdx = Math.max(currentIdx - 10, 0);
          if (currentIdx === -1) nextIdx = 0;
        } else {
          return;
        }

        const target = all[nextIdx];
        if (target) setHighlightedId(target.id, 'keyboard');
      };
      setListKeyHandler(handler);
      return () => {
        setListKeyHandler(null);
      };
    }, [setListKeyHandler, setHighlightedId, highlightedId, ctxListRef]);

    return (
      <div
        ref={mergedRef}
        id={ctx.listId}
        role="listbox"
        aria-labelledby={ctx.inputId}
        className={cn(styles.list, className)}
        {...rest}
      >
        {ctx.loading ? <CommandLoading>Loading…</CommandLoading> : null}
        {children}
      </div>
    );
  },
);

// ============================================================================
// CommandEmpty
// ============================================================================

export const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  function CommandEmpty({ className, children, ...rest }, ref) {
    const ctx = useCommandContext('CommandEmpty');
    if (ctx.matchCount > 0) return null;
    if (ctx.loading) return null;
    return (
      <div
        ref={ref}
        role="presentation"
        className={cn(styles.empty, className)}
        {...rest}
      >
        {children ?? 'No results found.'}
      </div>
    );
  },
);

// ============================================================================
// CommandGroup
// ============================================================================

interface CommandGroupContextValue {
  labelId: string | undefined;
  visibleCountRef: React.MutableRefObject<Set<string>>;
  registerVisibility: (id: string, visible: boolean) => void;
}

const CommandGroupContext = createContext<CommandGroupContextValue | null>(
  null,
);

export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  function CommandGroup(
    { heading, forceMount = false, className, children, ...rest },
    ref,
  ) {
    const ctx = useCommandContext('CommandGroup');
    const generatedId = useId();
    const labelId = heading ? `cmd-group-label-${generatedId}` : undefined;

    const visibleIdsRef = useRef<Set<string>>(new Set());
    const [visibleCount, setVisibleCount] = useState(0);

    const registerVisibility = useCallback(
      (id: string, visible: boolean) => {
        const set = visibleIdsRef.current;
        const had = set.has(id);
        if (visible && !had) {
          set.add(id);
          setVisibleCount(set.size);
        } else if (!visible && had) {
          set.delete(id);
          setVisibleCount(set.size);
        }
      },
      [],
    );

    const groupContextValue = useMemo<CommandGroupContextValue>(
      () => ({
        labelId,
        visibleCountRef: visibleIdsRef,
        registerVisibility,
      }),
      [labelId, registerVisibility],
    );

    // Hide whole group when 0 items visible (unless forceMount).
    const shouldHide =
      !forceMount && !ctx.loading && visibleCount === 0;

    return (
      <CommandGroupContext.Provider value={groupContextValue}>
        <div
          ref={ref}
          role="group"
          aria-labelledby={labelId}
          data-hidden={shouldHide ? 'true' : undefined}
          className={cn(styles.group, className)}
          {...rest}
        >
          {heading ? (
            <div
              id={labelId}
              role="presentation"
              className={styles.groupHeading}
            >
              {heading}
            </div>
          ) : null}
          <div className={styles.groupItems}>{children}</div>
        </div>
      </CommandGroupContext.Provider>
    );
  },
);

// ============================================================================
// CommandItem
// ============================================================================

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  function CommandItem(
    {
      value,
      textValue,
      disabled = false,
      onSelect,
      className,
      children,
      onMouseMove,
      onClick,
      ...rest
    },
    ref,
  ) {
    const ctx = useCommandContext('CommandItem');
    const group = useContext(CommandGroupContext);
    const generatedId = useId();
    const id = `cmd-item-${generatedId}`;

    const derivedText = useMemo(
      () => textValue ?? deriveTextFromChildren(children),
      [textValue, children],
    );

    // Depend only on the stable register/unregister callbacks (useCallback
    // with empty deps in the root Command). Using the full `ctx` object as a
    // dependency re-runs the effect on every Command re-render — the context
    // value re-memos whenever the registry state changes (registry drives
    // visibleItemIds / highlightedId), creating a register → setRegistry →
    // ctx re-memo → effect re-runs → unregister → setRegistry infinite loop.
    // Reported in E137 bug 2 ("Maximum update depth exceeded" at line 319's
    // setRegistry). Same trap as Carousel registerSlide, fixed in E132.
    const { registerItem, unregisterItem } = ctx;
    useLayoutEffect(() => {
      registerItem({ id, value, textContent: derivedText, disabled });
      return () => {
        unregisterItem(id);
      };
    }, [registerItem, unregisterItem, id, value, derivedText, disabled]);

    const isVisible = ctx.visibleItemIds.has(id);
    const isHighlighted = ctx.highlightedId === id;

    // Report visibility to group (for group-heading hide logic).
    useLayoutEffect(() => {
      if (!group) return;
      group.registerVisibility(id, isVisible);
      return () => {
        group.registerVisibility(id, false);
      };
    }, [group, id, isVisible]);

    // Listen for synthetic cmd-select event from commitHighlighted().
    const elementRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = useMemo(
      () => mergeRefs(ref, elementRef),
      [ref],
    );

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      const handler = () => {
        if (disabled) return;
        onSelect?.(value);
      };
      element.addEventListener('cmd-select', handler);
      return () => element.removeEventListener('cmd-select', handler);
    }, [disabled, onSelect, value]);

    const handleMouseMove = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onMouseMove?.(event);
        if (disabled) return;
        if (ctx.highlightedId !== id) {
          ctx.setHighlightedId(id, 'mouse');
        }
      },
      [onMouseMove, disabled, ctx, id],
    );

    const handleClick = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (disabled) return;
        onSelect?.(value);
      },
      [onClick, disabled, onSelect, value],
    );

    if (!isVisible) {
      return <div data-cmd-item-hidden="true" style={{ display: 'none' }} />;
    }

    return (
      <div
        ref={mergedRef}
        id={id}
        role="option"
        data-cmd-item=""
        data-value={value}
        data-visible="true"
        data-highlighted={isHighlighted ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        aria-selected={isHighlighted}
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={cn(styles.item, className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

// ============================================================================
// CommandSeparator
// ============================================================================

export const CommandSeparator = forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(function CommandSeparator({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      role="none"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
});

// ============================================================================
// CommandShortcut — inline <kbd> pill, decorative
// ============================================================================

export const CommandShortcut = forwardRef<
  HTMLSpanElement,
  CommandShortcutProps
>(function CommandShortcut({ className, children, ...rest }, ref) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(styles.shortcut, className)}
      {...rest}
    >
      {children}
    </span>
  );
});

// ============================================================================
// CommandLoading
// ============================================================================

export const CommandLoading = forwardRef<HTMLDivElement, CommandLoadingProps>(
  function CommandLoading({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label="Loading"
        className={cn(styles.loading, className)}
        {...rest}
      >
        {children ?? 'Loading…'}
      </div>
    );
  },
);

// ============================================================================
// useCommandShortcut — optional keyboard binding helper
// ============================================================================

/**
 * useCommandShortcut — binds Cmd+<key> (macOS) / Ctrl+<key> (Windows/Linux)
 * to invoke `callback`. Use outside Command to toggle dialog open state.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * useCommandShortcut('k', () => setOpen((o) => !o));
 */
export function useCommandShortcut(
  key: string,
  callback: () => void,
): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isModKey = event.metaKey || event.ctrlKey;
      if (!isModKey) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      event.preventDefault();
      callback();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}
