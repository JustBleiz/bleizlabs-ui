'use client';

import {
  forwardRef,
  Fragment,
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../utils/cn';
import { useMatchMedia } from '../../utils/match-media';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../display/Table';
import { Empty } from '../../feedback/Empty';
import { Alert } from '../../feedback/Alert';
import { Skeleton } from '../../display/Skeleton';
import { Pagination } from '../../specialized/Pagination';
import { Input } from '../../interactive/Input';
import styles from './DataTable.module.scss';

/**
 * DataTable — generic-data grid primitive z sortowaniem, filtrowaniem,
 *   paginacją, selection, expansion + APG `/grid/` keyboard model.
 *
 * @layer   complex-interactive (Phase 10 — extended a11y pipeline)
 * @tokens  --color-surface, --color-surface-raised, --color-surface-hover,
 *          --color-border, --color-border-subtle, --color-text-primary,
 *          --color-text-secondary, --color-text-muted, --color-brand,
 *          --color-error, --space-{1..8}, --radius-{sm,md},
 *          --font-size-{sm,base}, --font-weight-medium,
 *          --duration-fast, --easing-default, --focus-ring
 * @deps    cn, useMatchMedia, lib primitives (Table compound, Empty, Alert,
 *          Skeleton, Pagination)
 * @a11y    APG `/grid/` pattern — `role="grid"` on Table root,
 *          `role="columnheader"` z `aria-sort`, `role="gridcell"`,
 *          `aria-rowcount` / `aria-colcount` / `aria-rowindex`,
 *          aria-live polite region dla state change announcements,
 *          keyboard model: Arrow keys (cell nav), Home/End (row boundaries),
 *          Ctrl+Home/End (table boundaries), PageUp/Down (~10 rows),
 *          Enter (activate), Space (selection), F2 (widget-mode entry),
 *          Escape (widget-mode exit). NIE traps Tab — exits naturally.
 *          Sort indicator NOT color-only (icon-based).
 * @notes   Server-Component UNSAFE — wymaga `'use client'` (stan, observer,
 *          keyboard). Consumer powinien `useMemo` columns dla perf.
 *          Default mode = client-side (slice po filter+sort). Server-side
 *          gdy `pagination.totalRows` jest podane (controlled).
 *
 *          v1 status: foundation skeleton (sort + pagination + states +
 *          density + striped/hoverable + sticky header). Selection,
 *          expansion, filter UI, frozen columns, mobile fallback, RTL,
 *          aria-live, full APG keyboard, imperative handle → w kolejnych
 *          sesjach implementacyjnych.
 *
 * @example
 *   import { DataTable, type ColumnDef } from '@bleizlabs/ui';
 *
 *   const columns: ColumnDef<Project>[] = useMemo(() => [
 *     { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
 *     { id: 'status', header: 'Status', cell: (row) => <Badge>{row.status}</Badge> },
 *   ], []);
 *
 *   <DataTable
 *     data={projects}
 *     columns={columns}
 *     pagination={{ pageSize: 25 }}
 *     density="cozy"
 *   />
 */

// ============================================================================
// TYPES
// ============================================================================

/** Sort direction. `null` = unsorted. */
export type SortDirection = 'asc' | 'desc' | null;

/** Density preset — wpływa na row height + cell padding. */
export type DataTableDensity = 'compact' | 'cozy' | 'comfortable';

/** Visual tonacja per wiersz. */
export type RowVariant = 'default' | 'success' | 'warning' | 'error';

/** Filter declarative type — guide dla domyślnej filter UI. */
export type FilterType = 'text' | 'enum' | 'number';

/** Context dostarczany do custom cell renderer + row predicates. */
export interface CellContext<T> {
  /** Aktualny wiersz. */
  row: T;
  /** Index w aktualnej stronie (po sort + filter + paginate). */
  rowIndex: number;
  /** Stabilne ID wiersza (per `getRowId`). */
  rowId: string;
  /** ID kolumny. */
  columnId: string;
  /** Czy wiersz jest aktualnie zaznaczony. */
  isSelected: boolean;
  /** Czy wiersz jest aktualnie rozwinięty. */
  isExpanded: boolean;
}

/**
 * Deklaratywna definicja kolumny.
 *
 * Każda kolumna ma `id` + `header`. Content cell pobierany przez `accessorKey`
 * (auto-extract z `T[accessorKey]`) LUB `cell(row, ctx) => ReactNode` (custom
 * render). `cell` wygrywa nad `accessorKey` gdy oba podane.
 */
export interface ColumnDef<T> {
  /** Stabilne ID kolumny (key React, identifier dla sort/filter state). */
  id: string;
  /** Renderowany w header cell. */
  header: ReactNode;
  /** Property name na `T` dla auto-extract value. */
  accessorKey?: keyof T;
  /** Custom cell renderer. Wygrywa nad `accessorKey`. */
  cell?: (row: T, ctx: CellContext<T>) => ReactNode;
  /** `true` = domyślny string/number sort. Funkcja = custom comparator. */
  sortable?: boolean | ((a: T, b: T) => number);
  /** `true` = domyślny text filter UI. String = filter type. */
  filterable?: boolean | FilterType;
  /** Custom filter UI w header. Wygrywa nad domyślnym `filterable` UI. */
  renderFilter?: (value: unknown, onChange: (next: unknown) => void) => ReactNode;
  /** Width: '120px' | '1fr' | 'auto'. */
  width?: string;
  /** Text alignment w cell + header. */
  align?: 'left' | 'center' | 'right';
  /** Sticky column (frozen w horizontal scroll). */
  sticky?: 'left' | 'right';
  /** Dodatkowa klasa dla header cell. */
  headerClassName?: string;
  /** Dodatkowa klasa dla data cell. */
  cellClassName?: string;
  /** Kolumna ukryta (NIE renderowana, ale state persists). */
  hidden?: boolean;
}

/** Konfiguracja paginacji. */
export interface DataTablePaginationConfig {
  /** Rozmiar strony. Domyślnie 25. */
  pageSize?: number;
  /** Index aktualnej strony (zero-based). Controlled gdy podane. */
  pageIndex?: number;
  /** Total rows (server-side mode marker). Gdy podane → controlled mode. */
  totalRows?: number;
  /** Opcje page size selectora. Domyślnie [10, 25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Callback przy zmianie strony LUB rozmiaru strony. */
  onPaginationChange?: (state: { pageIndex: number; pageSize: number }) => void;
}

/** Stan sortowania. */
export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

/** Stan filtrów per-column (rekord: columnId → filter value). */
export type ColumnFiltersState = Record<string, unknown>;

/** Konfiguracja expansion. */
export interface ExpansionConfig<T> {
  /** Renderer panelu detail dla rozwiniętego wiersza. */
  renderExpanded: (row: T) => ReactNode;
}

/** i18n labels (English defaults gdy nie podane). */
export interface DataTableLabels {
  selectAll: string;
  selectRow: string;
  noData: string;
  loading: string;
  errorTitle: string;
  retry: string;
  rowsPerPage: string;
  pageOf: (current: number, total: number) => string;
  showingRows: (visible: number, total: number) => string;
  selectedRows: (n: number) => string;
  sortAscending: string;
  sortDescending: string;
  sortNone: string;
  expand: string;
  collapse: string;
  filterPlaceholder: (columnName: string) => string;
}

/** Imperative handle (forward ref API). */
export interface DataTableHandle<T> {
  /** Zwraca tablicę zaznaczonych wierszy. */
  getSelectedRows: () => T[];
  /** Czyści zaznaczenie. */
  clearSelection: () => void;
  /** Toggle expansion wiersza po `rowId`. */
  toggleRowExpanded: (rowId: string) => void;
  /** Toggle widoczność kolumny po `columnId`. */
  toggleColumnVisibility: (columnId: string) => void;
  /** Scroll do wiersza (index w aktualnej stronie). */
  scrollToRow: (rowIndex: number) => void;
}

/** Base props (wspólne dla wszystkich selection modes). */
interface DataTableBaseProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Tablica danych (immutable — consumer reuploaduje dla update). */
  data: T[];
  /** Definicje kolumn. Stable reference (useMemo) dla perf. */
  columns: ColumnDef<T>[];
  /** Stabilne ID wiersza dla selection/expansion stability across reloads. */
  getRowId?: (row: T, index: number) => string;
  /** Tonacja density wpływająca na row height + padding. Domyślnie 'cozy'. */
  density?: DataTableDensity;
  /** Striped row backgrounds. Domyślnie false. */
  striped?: boolean;
  /** Hover state na wierszach. Domyślnie true. */
  hoverable?: boolean;
  /** Sticky header podczas vertical scroll. Domyślnie true. */
  stickyHeader?: boolean;
  /** Klik gdziekolwiek na wierszu → callback (NIE fire na interactive children). */
  onRowClick?: (row: T) => void;
  /** Visual cursor: pointer + hover state gdy `onRowClick` ustawiony. */
  rowClickable?: boolean;
  /** Tonacja per wiersz (status). */
  rowVariant?: (row: T) => RowVariant;
  /** Wiersz disabled (no select, no expand, reduced opacity, no onRowClick). */
  rowDisabled?: (row: T) => boolean;
  /** Konfiguracja paginacji. `false` = bez pagination footer. */
  pagination?: DataTablePaginationConfig | false;
  /** Default sort gdy uncontrolled. */
  defaultSort?: SortState;
  /** Aktualny sort (controlled mode). */
  sort?: SortState | null;
  /** Callback gdy sort się zmienia (controlled mode). */
  onSortChange?: (next: SortState | null) => void;
  /** Global filter value (controlled). */
  globalFilter?: string;
  /** Per-column filters (controlled). */
  columnFilters?: ColumnFiltersState;
  /** Callback gdy column filters się zmieniają. */
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  /** Konfiguracja expansion (opt-in). */
  expandable?: ExpansionConfig<T>;
  /** State machine wrapper. */
  state?: 'idle' | 'loading' | 'error';
  /** Message dla error state. */
  errorMessage?: string;
  /** Callback dla retry button w error state. */
  onRetry?: () => void;
  /** Liczba skeleton rows w loading state. Domyślnie 5. */
  loadingRowCount?: number;
  /** Custom empty state slot (override default `<Empty>`). */
  renderEmpty?: () => ReactNode;
  /** Breakpoint poniżej którego render = card fallback. Domyślnie 768. */
  mobileBreakpoint?: number;
  /** Subset kolumn w mobile view. Domyślnie wszystkie visible. */
  mobileColumns?: string[];
  /** RTL direction. Domyślnie 'ltr'. */
  dir?: 'ltr' | 'rtl';
  /** ARIA label dla grid. */
  'aria-label'?: string;
  /** ARIA labelledby dla grid. */
  'aria-labelledby'?: string;
  /** i18n labels (English defaults gdy nie podane). */
  labels?: Partial<DataTableLabels>;
}

/** Selection NONE mode (default). */
interface DataTableNoSelectionProps<T> extends DataTableBaseProps<T> {
  selection?: 'none';
}

/** Selection SINGLE mode. */
interface DataTableSingleSelectionProps<T> extends DataTableBaseProps<T> {
  selection: 'single';
  selectedRow?: T | null;
  defaultSelectedRow?: T | null;
  onSelectionChange?: (row: T | null) => void;
}

/** Selection MULTIPLE mode. */
interface DataTableMultipleSelectionProps<T> extends DataTableBaseProps<T> {
  selection: 'multiple';
  selectedRows?: T[];
  defaultSelectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
}

/**
 * DataTable props — discriminated union per selection mode dla TS-enforced
 * `onSelectionChange` typing.
 */
export type DataTableProps<T> =
  | DataTableNoSelectionProps<T>
  | DataTableSingleSelectionProps<T>
  | DataTableMultipleSelectionProps<T>;

// ============================================================================
// DEFAULT LABELS (English)
// ============================================================================

export const DEFAULT_DATA_TABLE_LABELS: DataTableLabels = {
  selectAll: 'Select all rows',
  selectRow: 'Select row',
  noData: 'No data',
  loading: 'Loading',
  errorTitle: 'Error loading data',
  retry: 'Retry',
  rowsPerPage: 'Rows per page',
  pageOf: (current, total) => `Page ${current} of ${total}`,
  showingRows: (visible, total) => `Showing ${visible} of ${total} rows`,
  selectedRows: (n) => (n === 1 ? '1 row selected' : `${n} rows selected`),
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
  sortNone: 'Clear sort',
  expand: 'Expand row',
  collapse: 'Collapse row',
  filterPlaceholder: (col) => `Filter ${col}`,
};

// ============================================================================
// UTILITIES — sort / filter / paginate (pure functions)
// ============================================================================

/**
 * Sort rows in-place semantically (returns new array, NIE mutates input).
 * Używa column's custom comparator gdy `sortable` jest funkcją, w przeciwnym
 * razie automatic: string (locale-aware), number, Date, boolean, null-safe.
 */
function sortRows<T>(
  rows: T[],
  sort: SortState | null,
  columns: ColumnDef<T>[],
): T[] {
  if (!sort) return rows;
  const column = columns.find((c) => c.id === sort.columnId);
  if (!column || !column.sortable) return rows;

  const comparator =
    typeof column.sortable === 'function'
      ? column.sortable
      : defaultComparator(column);

  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => comparator(a, b) * direction);
}

/** Default comparator — handles string (locale), number, Date, boolean, null. */
function defaultComparator<T>(column: ColumnDef<T>): (a: T, b: T) => number {
  return (a, b) => {
    const av = extractValue(a, column);
    const bv = extractValue(b, column);

    // null-safe: null/undefined zawsze last
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    // typed comparison
    if (typeof av === 'string' && typeof bv === 'string') {
      return av.localeCompare(bv);
    }
    if (typeof av === 'number' && typeof bv === 'number') {
      return av - bv;
    }
    if (av instanceof Date && bv instanceof Date) {
      return av.getTime() - bv.getTime();
    }
    if (typeof av === 'boolean' && typeof bv === 'boolean') {
      return av === bv ? 0 : av ? 1 : -1;
    }
    // fallback: stringify
    return String(av).localeCompare(String(bv));
  };
}

/** Extract value z wiersza per column (accessor → cell-derived → undefined). */
function extractValue<T>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorKey != null) {
    return row[column.accessorKey];
  }
  return undefined;
}

/**
 * Filter rows per global filter + column filters.
 * - Global filter: case-insensitive substring match na wszystkich accessor values.
 * - Column filters: per-column, type-aware.
 */
function filterRows<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  globalFilter: string | undefined,
  columnFilters: ColumnFiltersState | undefined,
): T[] {
  const hasGlobal = globalFilter && globalFilter.trim().length > 0;
  const columnFilterEntries = columnFilters
    ? Object.entries(columnFilters).filter(([, v]) => v != null && v !== '')
    : [];

  if (!hasGlobal && columnFilterEntries.length === 0) return rows;

  const globalNeedle = hasGlobal ? globalFilter!.trim().toLowerCase() : null;

  return rows.filter((row) => {
    // global filter — match na dowolnym accessor value
    if (globalNeedle) {
      const found = columns.some((col) => {
        if (col.accessorKey == null) return false;
        const v = row[col.accessorKey];
        if (v == null) return false;
        return String(v).toLowerCase().includes(globalNeedle);
      });
      if (!found) return false;
    }

    // per-column filters
    for (const [columnId, filterValue] of columnFilterEntries) {
      const col = columns.find((c) => c.id === columnId);
      if (!col || col.accessorKey == null) continue;
      const v = row[col.accessorKey];
      if (!matchesColumnFilter(v, filterValue, col.filterable)) return false;
    }

    return true;
  });
}

/** Pojedynczy match wiersza vs column filter. Type-aware per `filterable`. */
function matchesColumnFilter(
  value: unknown,
  filterValue: unknown,
  filterable: ColumnDef<unknown>['filterable'],
): boolean {
  if (value == null) return false;
  const type =
    typeof filterable === 'string' ? filterable : 'text';

  if (type === 'enum') {
    return value === filterValue;
  }
  if (type === 'number') {
    return typeof value === 'number' && value === filterValue;
  }
  // default: text contains (case-insensitive)
  return String(value)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
}

/** Slice rows dla aktualnej strony (client-side mode). */
function paginateRows<T>(
  rows: T[],
  pageIndex: number,
  pageSize: number,
): T[] {
  const start = pageIndex * pageSize;
  return rows.slice(start, start + pageSize);
}

// ============================================================================
// SELECTION HELPERS (discriminated union extraction)
// ============================================================================

interface ExtractedSelectionConfig<T> {
  mode: 'none' | 'single' | 'multiple';
  controlledValue: T | T[] | null | undefined;
  defaultValue: T | T[] | null | undefined;
  onChange: ((val: T | null | T[]) => void) | undefined;
}

/**
 * Narrow discriminated union selection props into single shape.
 * Type-erased via `any` cast — TS dyskryminator (`selection` literal) gwarantuje
 * runtime correctness na podstawie mode value.
 */
function extractSelectionConfig<T>(
  props: DataTableProps<T>,
): ExtractedSelectionConfig<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyProps = props as any;
  const mode: 'none' | 'single' | 'multiple' = anyProps.selection ?? 'none';
  if (mode === 'single') {
    return {
      mode,
      controlledValue: anyProps.selectedRow,
      defaultValue: anyProps.defaultSelectedRow,
      onChange: anyProps.onSelectionChange,
    };
  }
  if (mode === 'multiple') {
    return {
      mode,
      controlledValue: anyProps.selectedRows,
      defaultValue: anyProps.defaultSelectedRows,
      onChange: anyProps.onSelectionChange,
    };
  }
  return {
    mode,
    controlledValue: undefined,
    defaultValue: undefined,
    onChange: undefined,
  };
}

// ============================================================================
// STATE HOOK
// ============================================================================

interface UseDataTableStateOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  defaultSort?: SortState;
  sort?: SortState | null;
  onSortChange?: (next: SortState | null) => void;
  globalFilter?: string;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  pagination?: DataTablePaginationConfig | false;
}

interface DataTableStateResult<T> {
  /** Wiersze do renderowania (po sort + filter + paginate). */
  visibleRows: T[];
  /** Wszystkie wiersze po filter (przed paginate). */
  filteredRows: T[];
  /** Aktualny sort state. */
  sortState: SortState | null;
  /** Toggle sort dla kolumny (asc → desc → null cycle). */
  toggleSort: (columnId: string) => void;
  /** Aktualny page index. */
  pageIndex: number;
  /** Aktualny page size. */
  pageSize: number;
  /** Total pages. */
  totalPages: number;
  /** Total rows (po filter; server-side = totalRows prop). */
  totalRows: number;
  /** Setter dla page (clamped). */
  setPageIndex: (next: number) => void;
  /** Setter dla page size (resets pageIndex). */
  setPageSize: (next: number) => void;
}

/**
 * `useDataTableState` — core state machine dla DataTable.
 *
 * Eksportowany dla power users którzy chcą pełnej kontroli (server-side mode,
 * custom UI dla pagination, etc.).
 */
export function useDataTableState<T>(
  options: UseDataTableStateOptions<T>,
): DataTableStateResult<T> {
  const {
    data,
    columns,
    defaultSort = undefined,
    sort: controlledSort,
    onSortChange,
    globalFilter,
    columnFilters,
    pagination,
  } = options;

  // Sort state (controlled vs uncontrolled)
  const [uncontrolledSort, setUncontrolledSort] = useState<SortState | null>(
    defaultSort ?? null,
  );
  const sortState = controlledSort !== undefined ? controlledSort : uncontrolledSort;

  const toggleSort = useCallback(
    (columnId: string) => {
      const current = controlledSort !== undefined ? controlledSort : uncontrolledSort;
      let next: SortState | null;
      if (!current || current.columnId !== columnId) {
        next = { columnId, direction: 'asc' };
      } else if (current.direction === 'asc') {
        next = { columnId, direction: 'desc' };
      } else {
        next = null;
      }
      if (controlledSort === undefined) setUncontrolledSort(next);
      onSortChange?.(next);
    },
    [controlledSort, uncontrolledSort, onSortChange],
  );

  // Pagination config
  const paginationEnabled = pagination !== false;
  const pageSize = paginationEnabled ? pagination?.pageSize ?? 25 : data.length;
  const serverSide = paginationEnabled && pagination?.totalRows != null;

  const [uncontrolledPageIndex, setUncontrolledPageIndex] = useState(0);
  const pageIndex = paginationEnabled
    ? pagination?.pageIndex ?? uncontrolledPageIndex
    : 0;

  // Filter + sort (client-side mode only; server-side respektuje data as-is)
  const filteredRows = useMemo(() => {
    if (serverSide) return data;
    return filterRows(data, columns, globalFilter, columnFilters);
  }, [serverSide, data, columns, globalFilter, columnFilters]);

  const sortedRows = useMemo(() => {
    if (serverSide) return filteredRows;
    return sortRows(filteredRows, sortState, columns);
  }, [serverSide, filteredRows, sortState, columns]);

  const totalRows = serverSide ? pagination!.totalRows! : sortedRows.length;
  const totalPages = paginationEnabled
    ? Math.max(1, Math.ceil(totalRows / pageSize))
    : 1;

  const visibleRows = useMemo(() => {
    if (!paginationEnabled) return sortedRows;
    if (serverSide) return sortedRows;
    return paginateRows(sortedRows, pageIndex, pageSize);
  }, [paginationEnabled, serverSide, sortedRows, pageIndex, pageSize]);

  const setPageIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, next));
      if (pagination !== false && pagination?.pageIndex === undefined) {
        setUncontrolledPageIndex(clamped);
      }
      pagination !== false &&
        pagination?.onPaginationChange?.({ pageIndex: clamped, pageSize });
    },
    [totalPages, pagination, pageSize],
  );

  const setPageSize = useCallback(
    (next: number) => {
      if (pagination !== false) {
        setUncontrolledPageIndex(0);
        pagination?.onPaginationChange?.({ pageIndex: 0, pageSize: next });
      }
    },
    [pagination],
  );

  return {
    visibleRows,
    filteredRows,
    sortState,
    toggleSort,
    pageIndex,
    pageSize,
    totalPages,
    totalRows,
    setPageIndex,
    setPageSize,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

function defaultGetRowId<T>(_row: T, index: number): string {
  return String(index);
}

export const DataTable = forwardRef(function DataTable<T>(
  props: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    data,
    columns,
    getRowId = defaultGetRowId,
    density = 'cozy',
    striped = false,
    hoverable = true,
    stickyHeader = true,
    onRowClick,
    rowClickable = false,
    rowVariant,
    rowDisabled,
    pagination,
    defaultSort,
    sort,
    onSortChange,
    globalFilter,
    columnFilters,
    onColumnFiltersChange,
    expandable,
    state: stateMode = 'idle',
    errorMessage,
    onRetry,
    loadingRowCount = 5,
    renderEmpty,
    mobileBreakpoint = 768,
    mobileColumns,
    dir = 'ltr',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    labels: labelsOverride,
    className,
    ...rest
  } = props;

  const labels: DataTableLabels = useMemo(
    () => ({ ...DEFAULT_DATA_TABLE_LABELS, ...labelsOverride }),
    [labelsOverride],
  );

  const gridId = useId();
  const liveRegionId = useId();

  // Filter out hidden columns dla rendering
  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns],
  );

  // Column filters (controlled vs uncontrolled)
  const isControlledFilters = columnFilters !== undefined;
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>({});
  const effectiveFilters: ColumnFiltersState = isControlledFilters
    ? columnFilters!
    : internalColumnFilters;

  const handleColumnFilterChange = useCallback(
    (columnId: string, value: unknown) => {
      const next: ColumnFiltersState = { ...effectiveFilters };
      if (value == null || value === '') {
        delete next[columnId];
      } else {
        next[columnId] = value;
      }
      if (!isControlledFilters) setInternalColumnFilters(next);
      onColumnFiltersChange?.(next);
    },
    [effectiveFilters, isControlledFilters, onColumnFiltersChange],
  );

  // Detect czy jakaś kolumna ma filter UI (decyduje czy renderować filter row)
  const hasFilterRow = useMemo(
    () =>
      columns.some(
        (c) =>
          !c.hidden && (c.filterable || c.renderFilter) !== undefined &&
          (!!c.filterable || !!c.renderFilter),
      ),
    [columns],
  );

  // State machine
  const tableState = useDataTableState({
    data,
    columns,
    defaultSort,
    sort,
    onSortChange,
    globalFilter,
    columnFilters: effectiveFilters,
    pagination,
  });

  const isMobile = useMatchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

  // ─────────────────────────────────────────────────────────────────────────
  // Selection state (controlled vs uncontrolled, single + multiple modes)
  // ─────────────────────────────────────────────────────────────────────────
  const selectionConfig = useMemo(() => extractSelectionConfig(props), [props]);
  const selectionMode = selectionConfig.mode;
  const isControlledSelection = selectionConfig.controlledValue !== undefined;

  const computeIdsFromRows = useCallback(
    (rows: T[] | T | null | undefined): Set<string> => {
      if (rows == null) return new Set();
      const arr = Array.isArray(rows) ? rows : [rows];
      const ids = arr
        .map((r) => {
          const idx = data.indexOf(r);
          return idx >= 0 ? getRowId(r, idx) : '';
        })
        .filter((s) => s !== '');
      return new Set(ids);
    },
    [data, getRowId],
  );

  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] = useState<
    Set<string>
  >(() => {
    if (selectionMode === 'none') return new Set();
    return computeIdsFromRows(selectionConfig.defaultValue as T | T[] | null);
  });

  const selectedIds = useMemo<Set<string>>(() => {
    if (!isControlledSelection) return uncontrolledSelectedIds;
    return computeIdsFromRows(selectionConfig.controlledValue as T | T[] | null);
  }, [
    isControlledSelection,
    uncontrolledSelectedIds,
    selectionConfig.controlledValue,
    computeIdsFromRows,
  ]);

  const emitSelectionChange = useCallback(
    (nextIds: Set<string>) => {
      if (!isControlledSelection) setUncontrolledSelectedIds(nextIds);
      if (!selectionConfig.onChange) return;
      if (selectionMode === 'single') {
        const id = nextIds.values().next().value;
        const row = id
          ? data.find((r, i) => getRowId(r, i) === id) ?? null
          : null;
        (selectionConfig.onChange as (r: T | null) => void)(row);
      } else if (selectionMode === 'multiple') {
        const rows = data.filter((r, i) => nextIds.has(getRowId(r, i)));
        (selectionConfig.onChange as (rs: T[]) => void)(rows);
      }
    },
    [
      isControlledSelection,
      selectionMode,
      selectionConfig.onChange,
      data,
      getRowId,
    ],
  );

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      if (selectionMode === 'none') return;
      if (selectionMode === 'single') {
        const next = selectedIds.has(rowId) ? new Set<string>() : new Set([rowId]);
        emitSelectionChange(next);
      } else {
        const next = new Set(selectedIds);
        if (next.has(rowId)) next.delete(rowId);
        else next.add(rowId);
        emitSelectionChange(next);
      }
    },
    [selectionMode, selectedIds, emitSelectionChange],
  );

  const toggleAllVisibleSelection = useCallback(() => {
    if (selectionMode !== 'multiple') return;
    const visibleIds = tableState.visibleRows.map((r, i) => getRowId(r, i));
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    const next = new Set(selectedIds);
    if (allSelected) {
      visibleIds.forEach((id) => next.delete(id));
    } else {
      visibleIds.forEach((id) => next.add(id));
    }
    emitSelectionChange(next);
  }, [
    selectionMode,
    tableState.visibleRows,
    selectedIds,
    getRowId,
    emitSelectionChange,
  ]);

  const headerSelectionState = useMemo<'none' | 'some' | 'all'>(() => {
    if (selectionMode !== 'multiple') return 'none';
    const visibleIds = tableState.visibleRows.map((r, i) => getRowId(r, i));
    if (visibleIds.length === 0) return 'none';
    const selectedVisible = visibleIds.filter((id) => selectedIds.has(id));
    if (selectedVisible.length === 0) return 'none';
    if (selectedVisible.length === visibleIds.length) return 'all';
    return 'some';
  }, [selectionMode, tableState.visibleRows, selectedIds, getRowId]);

  const selectionEnabled = selectionMode !== 'none';

  // ─────────────────────────────────────────────────────────────────────────
  // Expansion state (uncontrolled w v1)
  // ─────────────────────────────────────────────────────────────────────────
  const expansionEnabled = !!expandable;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleRowExpansion = useCallback(
    (rowId: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) next.delete(rowId);
        else next.add(rowId);
        return next;
      });
    },
    [],
  );


  // ─────────────────────────────────────────────────────────────────────────
  // Wrapper props
  // ─────────────────────────────────────────────────────────────────────────
  const rootClassName = cn(
    styles.root,
    styles[`density-${density}`],
    striped && styles.striped,
    hoverable && styles.hoverable,
    stickyHeader && styles.stickyHeader,
    isMobile && styles.mobile,
    className,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Renderery state
  // ─────────────────────────────────────────────────────────────────────────
  const renderLoadingRows = () => {
    return Array.from({ length: loadingRowCount }).map((_, rowIdx) => (
      <TableRow key={`skeleton-${rowIdx}`} className={styles.skeletonRow}>
        {selectionEnabled && (
          <TableCell className={styles.selectionCell}>
            <Skeleton width={16} height={16} />
          </TableCell>
        )}
        {expansionEnabled && (
          <TableCell className={styles.expansionCell}>
            <Skeleton width={16} height={16} />
          </TableCell>
        )}
        {visibleColumns.map((col) => (
          <TableCell
            key={col.id}
            align={col.align === 'right' ? 'end' : col.align === 'center' ? 'center' : 'start'}
            className={cn(styles.cell, stickyClass(col), col.cellClassName)}
            style={col.width ? { width: col.width } : undefined}
          >
            <Skeleton width="80%" height={14} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderErrorState = () => (
    <Alert variant="critical" title={labels.errorTitle}>
      <div className={styles.errorContent}>
        {errorMessage && <span>{errorMessage}</span>}
        {onRetry && (
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            {labels.retry}
          </button>
        )}
      </div>
    </Alert>
  );

  const renderEmptyState = () => {
    if (renderEmpty) return renderEmpty();
    return <Empty title={labels.noData} />;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Renderer header cell (z sort indicator + sticky)
  // ─────────────────────────────────────────────────────────────────────────
  const stickyClass = (col: ColumnDef<T>) =>
    col.sticky === 'left'
      ? styles.stickyLeft
      : col.sticky === 'right'
        ? styles.stickyRight
        : undefined;

  const renderHeaderCell = (col: ColumnDef<T>) => {
    const isSorted = tableState.sortState?.columnId === col.id;
    const sortDir = isSorted ? tableState.sortState!.direction : null;
    const sortable = !!col.sortable;
    const ariaSort: 'ascending' | 'descending' | 'none' | undefined = sortable
      ? sortDir === 'asc'
        ? 'ascending'
        : sortDir === 'desc'
          ? 'descending'
          : 'none'
      : undefined;

    return (
      <TableCell
        key={col.id}
        as="th"
        align={col.align === 'right' ? 'end' : col.align === 'center' ? 'center' : 'start'}
        className={cn(
          styles.headerCell,
          sortable && styles.sortableHeader,
          isSorted && styles.sortedHeader,
          stickyClass(col),
          col.headerClassName,
        )}
        style={col.width ? { width: col.width } : undefined}
        aria-sort={ariaSort}
        scope="col"
      >
        {sortable ? (
          <button
            type="button"
            className={styles.sortButton}
            onClick={() => tableState.toggleSort(col.id)}
            aria-label={
              sortDir === 'asc'
                ? labels.sortDescending
                : sortDir === 'desc'
                  ? labels.sortNone
                  : labels.sortAscending
            }
          >
            <span className={styles.headerLabel}>{col.header}</span>
            <SortIndicator direction={sortDir} />
          </button>
        ) : (
          <span className={styles.headerLabel}>{col.header}</span>
        )}
      </TableCell>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Renderer data row (+ optional expansion panel)
  // ─────────────────────────────────────────────────────────────────────────
  const renderDataRow = (row: T, rowIndex: number) => {
    const rowId = getRowId(row, rowIndex);
    const variant = rowVariant?.(row) ?? 'default';
    const disabled = rowDisabled?.(row) ?? false;
    const selected = selectionEnabled && selectedIds.has(rowId);
    const expanded = expansionEnabled && expandedIds.has(rowId);
    const clickable = rowClickable && !!onRowClick && !disabled;

    const totalCols =
      visibleColumns.length +
      (selectionEnabled ? 1 : 0) +
      (expansionEnabled ? 1 : 0);

    return (
      <Fragment key={rowId}>
        <TableRow
          className={cn(
            styles.row,
            styles[`row-${variant}`],
            disabled && styles.rowDisabled,
            clickable && styles.rowClickable,
            selected && styles.rowSelected,
            expanded && styles.rowExpanded,
          )}
          onClick={
            clickable
              ? (e) => {
                  // Don't fire onRowClick gdy clik na interactive child
                  const target = e.target as HTMLElement;
                  if (
                    target.closest(
                      'button, a, input, select, textarea, [role="button"]',
                    )
                  ) {
                    return;
                  }
                  onRowClick!(row);
                }
              : undefined
          }
          aria-disabled={disabled || undefined}
          aria-selected={selectionEnabled ? selected : undefined}
          aria-expanded={expansionEnabled ? expanded : undefined}
        >
          {selectionEnabled && (
            <TableCell className={styles.selectionCell}>
              <input
                type="checkbox"
                className={styles.selectionCheckbox}
                checked={selected}
                disabled={disabled}
                onChange={() => toggleRowSelection(rowId)}
                onClick={(e) => e.stopPropagation()}
                aria-label={labels.selectRow}
              />
            </TableCell>
          )}
          {expansionEnabled && (
            <TableCell className={styles.expansionCell}>
              <button
                type="button"
                className={cn(
                  styles.expansionButton,
                  expanded && styles.expansionButtonExpanded,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) toggleRowExpansion(rowId);
                }}
                disabled={disabled}
                aria-label={expanded ? labels.collapse : labels.expand}
                aria-expanded={expanded}
              >
                <ChevronIcon />
              </button>
            </TableCell>
          )}
          {visibleColumns.map((col) => {
            const ctx: CellContext<T> = {
              row,
              rowIndex,
              rowId,
              columnId: col.id,
              isSelected: selected,
              isExpanded: expanded,
            };
            const content = col.cell
              ? col.cell(row, ctx)
              : col.accessorKey != null
                ? renderAccessorValue(row[col.accessorKey])
                : null;
            return (
              <TableCell
                key={col.id}
                align={col.align === 'right' ? 'end' : col.align === 'center' ? 'center' : 'start'}
                className={cn(styles.cell, stickyClass(col), col.cellClassName)}
                style={col.width ? { width: col.width } : undefined}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
        {expansionEnabled && expanded && expandable && (
          <TableRow className={styles.expansionPanel}>
            <TableCell
              colSpan={totalCols}
              className={styles.expansionPanelCell}
            >
              <div className={styles.expansionPanelContent}>
                {expandable.renderExpanded(row)}
              </div>
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Renderer mobile card row (card layout fallback below mobileBreakpoint)
  // ─────────────────────────────────────────────────────────────────────────
  const mobileVisibleColumns = useMemo(() => {
    if (!mobileColumns) return visibleColumns;
    return visibleColumns.filter((c) => mobileColumns.includes(c.id));
  }, [visibleColumns, mobileColumns]);

  const renderMobileCard = (row: T, rowIndex: number) => {
    const rowId = getRowId(row, rowIndex);
    const variant = rowVariant?.(row) ?? 'default';
    const disabled = rowDisabled?.(row) ?? false;
    const selected = selectionEnabled && selectedIds.has(rowId);
    const expanded = expansionEnabled && expandedIds.has(rowId);
    const clickable = rowClickable && !!onRowClick && !disabled;

    return (
      <div
        key={rowId}
        className={cn(
          styles.mobileCard,
          styles[`row-${variant}`],
          disabled && styles.rowDisabled,
          clickable && styles.rowClickable,
          selected && styles.rowSelected,
        )}
        onClick={
          clickable
            ? (e) => {
                const target = e.target as HTMLElement;
                if (
                  target.closest(
                    'button, a, input, select, textarea, [role="button"]',
                  )
                ) {
                  return;
                }
                onRowClick!(row);
              }
            : undefined
        }
        role="group"
        aria-disabled={disabled || undefined}
        aria-selected={selectionEnabled ? selected : undefined}
        aria-expanded={expansionEnabled ? expanded : undefined}
      >
        {(selectionEnabled || expansionEnabled) && (
          <div className={styles.mobileCardHeader}>
            <div className={styles.mobileCardActions}>
              {selectionEnabled && (
                <input
                  type="checkbox"
                  className={styles.selectionCheckbox}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => toggleRowSelection(rowId)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={labels.selectRow}
                />
              )}
            </div>
            {expansionEnabled && (
              <button
                type="button"
                className={cn(
                  styles.expansionButton,
                  expanded && styles.expansionButtonExpanded,
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) toggleRowExpansion(rowId);
                }}
                disabled={disabled}
                aria-label={expanded ? labels.collapse : labels.expand}
                aria-expanded={expanded}
              >
                <ChevronIcon />
              </button>
            )}
          </div>
        )}
        {mobileVisibleColumns.map((col) => {
          const ctx: CellContext<T> = {
            row,
            rowIndex,
            rowId,
            columnId: col.id,
            isSelected: selected,
            isExpanded: expanded,
          };
          const content = col.cell
            ? col.cell(row, ctx)
            : col.accessorKey != null
              ? renderAccessorValue(row[col.accessorKey])
              : null;
          return (
            <div key={col.id} className={styles.mobileCardField}>
              <span className={styles.mobileCardLabel}>{col.header}</span>
              <span className={styles.mobileCardValue}>{content}</span>
            </div>
          );
        })}
        {expansionEnabled && expanded && expandable && (
          <div className={styles.mobileExpansionPanel}>
            {expandable.renderExpanded(row)}
          </div>
        )}
      </div>
    );
  };

  const renderMobileLoading = () => (
    <>
      {Array.from({ length: loadingRowCount }).map((_, i) => (
        <div key={`mskel-${i}`} className={styles.mobileCard}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%" height={14} />
        </div>
      ))}
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Renderer pagination footer
  // ─────────────────────────────────────────────────────────────────────────
  const renderPaginationFooter = () => {
    if (pagination === false) return null;
    if (tableState.totalPages <= 1 && tableState.totalRows === 0) return null;

    return (
      <div className={styles.paginationFooter}>
        <span className={styles.rowCount}>
          {labels.showingRows(tableState.visibleRows.length, tableState.totalRows)}
        </span>
        <Pagination
          currentPage={tableState.pageIndex + 1}
          totalPages={tableState.totalPages}
          onPageChange={(page) => tableState.setPageIndex(page - 1)}
        />
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  const showLoading = stateMode === 'loading';
  const showError = stateMode === 'error';
  const showEmpty =
    !showLoading && !showError && tableState.visibleRows.length === 0;

  // Mobile render branch — replaces table z card list
  if (isMobile) {
    return (
      <div
        ref={ref}
        className={rootClassName}
        data-density={density}
        data-state={stateMode}
        dir={dir}
        role="grid"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-rowcount={tableState.totalRows}
        aria-multiselectable={
          selectionMode === 'multiple' ? true : undefined
        }
        aria-describedby={liveRegionId}
        {...rest}
      >
        <div className={styles.mobileWrapper}>
          {showLoading
            ? renderMobileLoading()
            : showError
              ? renderErrorState()
              : showEmpty
                ? renderEmptyState()
                : tableState.visibleRows.map(renderMobileCard)}
        </div>
        {renderPaginationFooter()}
        <div
          id={liveRegionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.liveRegion}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={rootClassName}
      data-density={density}
      data-state={stateMode}
      dir={dir}
      {...rest}
    >
      <div className={styles.tableWrapper}>
        <Table
          striped={striped}
          compact={density === 'compact'}
          role="grid"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-rowcount={tableState.totalRows}
          aria-colcount={
            visibleColumns.length +
            (selectionEnabled ? 1 : 0) +
            (expansionEnabled ? 1 : 0)
          }
          aria-multiselectable={
            selectionMode === 'multiple' ? true : undefined
          }
          aria-describedby={liveRegionId}
          id={gridId}
        >
          <TableHeader>
            <TableRow>
              {selectionEnabled && (
                <TableCell
                  as="th"
                  scope="col"
                  className={cn(styles.headerCell, styles.selectionCell)}
                >
                  {selectionMode === 'multiple' && (
                    <input
                      type="checkbox"
                      className={styles.selectionCheckbox}
                      ref={(node) => {
                        if (node) {
                          node.indeterminate = headerSelectionState === 'some';
                        }
                      }}
                      checked={headerSelectionState === 'all'}
                      onChange={toggleAllVisibleSelection}
                      aria-label={labels.selectAll}
                    />
                  )}
                </TableCell>
              )}
              {expansionEnabled && (
                <TableCell
                  as="th"
                  scope="col"
                  className={cn(styles.headerCell, styles.expansionCell)}
                  aria-label="Expand"
                />
              )}
              {visibleColumns.map(renderHeaderCell)}
            </TableRow>
            {hasFilterRow && (
              <TableRow className={styles.filterRow}>
                {selectionEnabled && (
                  <TableCell as="th" className={styles.filterCell} />
                )}
                {expansionEnabled && (
                  <TableCell as="th" className={styles.filterCell} />
                )}
                {visibleColumns.map((col) => {
                  const columnName =
                    typeof col.header === 'string' ? col.header : col.id;
                  const filterValue = effectiveFilters[col.id] ?? '';

                  let content: ReactNode = null;
                  if (col.renderFilter) {
                    content = col.renderFilter(filterValue, (next) =>
                      handleColumnFilterChange(col.id, next),
                    );
                  } else if (col.filterable) {
                    // Default text filter Input
                    content = (
                      <Input
                        value={String(filterValue)}
                        onChange={(e) =>
                          handleColumnFilterChange(col.id, e.target.value)
                        }
                        placeholder={labels.filterPlaceholder(columnName)}
                        aria-label={labels.filterPlaceholder(columnName)}
                      />
                    );
                  }

                  return (
                    <TableCell
                      key={col.id}
                      as="th"
                      className={cn(
                        styles.filterCell,
                        stickyClass(col),
                        col.headerClassName,
                      )}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {showLoading
              ? renderLoadingRows()
              : !showError && tableState.visibleRows.map(renderDataRow)}
          </TableBody>
        </Table>

        {showError && <div className={styles.stateRow}>{renderErrorState()}</div>}
        {showEmpty && <div className={styles.stateRow}>{renderEmptyState()}</div>}
      </div>

      {renderPaginationFooter()}

      {/* aria-live region (announcements wire up w next session) */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
      />
    </div>
  );
}) as <T>(
  props: DataTableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReactElement;

// ============================================================================
// HELPERS
// ============================================================================

/** Render plain accessor value (handles primitives + Date + null). */
function renderAccessorValue(value: unknown): ReactNode {
  if (value == null) return null;
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return null;
  return String(value);
}

/** Chevron icon dla expansion toggle (right when collapsed, rotates via CSS). */
function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="4 2 8 6 4 10" />
    </svg>
  );
}

/** Sort direction indicator icon. */
function SortIndicator({ direction }: { direction: SortDirection }) {
  return (
    <span className={styles.sortIndicator} aria-hidden="true">
      <svg
        width="10"
        height="14"
        viewBox="0 0 10 14"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path
          d="M5 0 L9 5 L1 5 Z"
          className={cn(
            styles.sortArrow,
            direction === 'asc' && styles.sortArrowActive,
          )}
        />
        <path
          d="M5 14 L1 9 L9 9 Z"
          className={cn(
            styles.sortArrow,
            direction === 'desc' && styles.sortArrowActive,
          )}
        />
      </svg>
    </span>
  );
}
