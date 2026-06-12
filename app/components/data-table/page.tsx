'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/complex/DataTable';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Stack } from '@/components/layout/Stack';
import { Inline } from '@/components/layout/Inline';
import { Button } from '@/components/interactive/Button';
import { Badge } from '@/components/display/Badge';
import { Input } from '@/components/interactive/Input';
import { Switch } from '@/components/interactive/Switch';
import { Toggle } from '@/components/interactive/Toggle';
import { ToggleGroup } from '@/components/interactive/ToggleGroup';
import {
  MOCK_PROJECTS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  formatCurrency,
  formatDate,
  type Project,
  type ProjectStatus,
  type ProjectPriority,
} from './_data/mock-projects';
import styles from './page.module.scss';

const STATUS_COLOR: Record<ProjectStatus, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  paused: 'warning',
  completed: 'info',
  archived: 'default',
};

const PRIORITY_COLOR: Record<ProjectPriority, 'info' | 'warning' | 'error' | 'default'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

export default function DataTablePlaygroundPage() {
  // ─────────────────────────────────────────────────────────────────────────
  // Use case 4 — full-featured controls
  // ─────────────────────────────────────────────────────────────────────────
  const [density, setDensity] = useState<'compact' | 'cozy' | 'comfortable'>('cozy');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [striped, setStriped] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selected4, setSelected4] = useState<Project[]>([]);

  // ─────────────────────────────────────────────────────────────────────────
  // Use case 3 — selection
  // ─────────────────────────────────────────────────────────────────────────
  const [selected3, setSelected3] = useState<Project[]>([]);
  // Refetch simulation (DT-SE08): clones break reference identity on purpose —
  // controlled selection must survive via ID-based comparison (getRowId).
  const [data3, setData3] = useState<Project[]>(() => MOCK_PROJECTS.slice(0, 25));

  // ─────────────────────────────────────────────────────────────────────────
  // Use case 5 — real-world panel projects (data slice)
  // ─────────────────────────────────────────────────────────────────────────
  const realWorldData = useMemo(() => MOCK_PROJECTS.slice(0, 30), []);

  // ─────────────────────────────────────────────────────────────────────────
  // Column definitions
  // ─────────────────────────────────────────────────────────────────────────
  const basicColumns: ColumnDef<Project>[] = useMemo(
    () => [
      { id: 'name', header: 'Project', accessorKey: 'name' },
      { id: 'owner', header: 'Owner', accessorKey: 'owner' },
      { id: 'status', header: 'Status', accessorKey: 'status' },
      { id: 'priority', header: 'Priority', accessorKey: 'priority' },
      { id: 'budget', header: 'Budget', accessorKey: 'budget', align: 'right' },
    ],
    [],
  );

  const sortableFilterableColumns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Project',
        accessorKey: 'name',
        sortable: true,
        filterable: true,
      },
      {
        id: 'owner',
        header: 'Owner',
        accessorKey: 'owner',
        sortable: true,
        filterable: true,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: (a, b) => a.status.localeCompare(b.status),
        cell: (row) => <Badge color={STATUS_COLOR[row.status]} label={STATUS_LABELS[row.status]} />,
      },
      {
        id: 'budget',
        header: 'Budget',
        accessorKey: 'budget',
        sortable: true,
        align: 'right',
        cell: (row) => formatCurrency(row.budget),
      },
    ],
    [],
  );

  const selectionColumns: ColumnDef<Project>[] = useMemo(
    () => [
      { id: 'name', header: 'Project', accessorKey: 'name', sortable: true },
      { id: 'owner', header: 'Owner', accessorKey: 'owner' },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <Badge color={STATUS_COLOR[row.status]} label={STATUS_LABELS[row.status]} />,
      },
      {
        id: 'budget',
        header: 'Budget',
        accessorKey: 'budget',
        align: 'right',
        cell: (row) => formatCurrency(row.budget),
      },
    ],
    [],
  );

  const fullFeaturedColumns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Project',
        accessorKey: 'name',
        sortable: true,
        filterable: true,
        sticky: 'left',
      },
      {
        id: 'owner',
        header: 'Owner',
        accessorKey: 'owner',
        sortable: true,
        filterable: true,
      },
      {
        id: 'status',
        header: 'Status',
        sortable: (a, b) => a.status.localeCompare(b.status),
        cell: (row) => <Badge color={STATUS_COLOR[row.status]} label={STATUS_LABELS[row.status]} />,
      },
      {
        id: 'priority',
        header: 'Priority',
        sortable: (a, b) => a.priority.localeCompare(b.priority),
        cell: (row) => (
          <Badge color={PRIORITY_COLOR[row.priority]} label={PRIORITY_LABELS[row.priority]} />
        ),
      },
      {
        id: 'budget',
        header: 'Budget',
        accessorKey: 'budget',
        sortable: true,
        align: 'right',
        cell: (row) => formatCurrency(row.budget),
      },
      {
        id: 'deadline',
        header: 'Deadline',
        accessorKey: 'deadline',
        sortable: true,
        cell: (row) => formatDate(row.deadline),
      },
      {
        id: 'actions',
        header: '',
        sticky: 'right',
        align: 'right',
        width: '120px',
        cell: () => (
          <Inline gap={1} justify="end">
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Inline>
        ),
      },
    ],
    [],
  );

  const realWorldColumns: ColumnDef<Project>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Project',
        accessorKey: 'name',
        sortable: true,
        sticky: 'left',
      },
      {
        id: 'owner',
        header: 'Owner',
        accessorKey: 'owner',
        sortable: true,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <Badge color={STATUS_COLOR[row.status]} label={STATUS_LABELS[row.status]} />,
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: (row) => (
          <Badge color={PRIORITY_COLOR[row.priority]} label={PRIORITY_LABELS[row.priority]} />
        ),
      },
      {
        id: 'budget',
        header: 'Budget',
        accessorKey: 'budget',
        sortable: true,
        align: 'right',
        cell: (row) => formatCurrency(row.budget),
      },
      {
        id: 'deadline',
        header: 'Deadline',
        accessorKey: 'deadline',
        sortable: true,
        cell: (row) => formatDate(row.deadline),
      },
    ],
    [],
  );

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          DataTable
        </Heading>
        <Text className={styles.intro}>
          Generic-data grid primitive z deklaratywnymi column defs, sortowaniem, filtrowaniem,
          paginacją, selection, expansion, frozen columns, mobile fallback i pełnym APG{' '}
          <code>/grid/</code> (lub <code>/treegrid/</code>z <code>expandable</code>) keyboard model.
          Composes lib primitives (Table compound, Pagination, Button, Input, Skeleton, Empty,
          Alert; selection checkboxes are documented raw <code>&lt;input&gt;</code> — see JSDoc) —
          zero external runtime deps.
        </Text>
      </header>

      {/* ============================================================ */}
      {/* USE CASE 1 — Basic                                            */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          1. Basic — paste-and-go
        </Heading>
        <Text className={styles.sectionIntro}>
          Minimum API: pass <code>data</code> + <code>columns</code>. Zero features. Każda kolumna
          ma <code>id</code>, <code>header</code> i <code>accessorKey</code>. Format wartości
          fallback (string/number/Date).
        </Text>
        <DataTable
          data={MOCK_PROJECTS.slice(0, 5)}
          columns={basicColumns}
          pagination={false}
          aria-label="Basic project list"
        />
      </section>

      {/* ============================================================ */}
      {/* USE CASE 2 — Sortable + filterable                            */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          2. Sortable + filterable
        </Heading>
        <Text className={styles.sectionIntro}>
          Klik na header sortuje kolumnę (cycle: asc → desc → none) <code>aria-sort</code> updated.
          Header filter row renderuje domyślne text inputy. Custom cell renderers via{' '}
          <code>cell: (row) =&gt; ReactNode</code>.
        </Text>
        <DataTable
          data={MOCK_PROJECTS.slice(0, 20)}
          columns={sortableFilterableColumns}
          defaultSort={{ columnId: 'name', direction: 'asc' }}
          pagination={{ pageSize: 10 }}
          aria-label="Sortable filterable projects"
        />
      </section>

      {/* ============================================================ */}
      {/* USE CASE 3 — Selection + pagination                           */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          3. Selection + pagination
        </Heading>
        <Text className={styles.sectionIntro}>
          Discriminated union enforced via TypeScript: <code>selection=&quot;multiple&quot;</code>{' '}
          wymaga callback z <code>(rows: Project[])</code>. Header checkbox z indeterminate state.
          Selected count + clear button via controlled <code>selectedRows</code> state (Space
          toggles selection wiersza po klawiaturze). &quot;Simulate refetch&quot; podmienia data na
          klony obiektów — selekcja przeżywa dzięki ID-based comparison.
        </Text>
        <Stack gap={3}>
          <Inline gap={3} justify="between" align="center">
            <Text variant="small">
              {selected3.length === 0
                ? 'No rows selected'
                : `${selected3.length} ${selected3.length === 1 ? 'row' : 'rows'} selected`}
            </Text>
            <Inline gap={2} align="center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setData3((d) => d.map((r) => ({ ...r })))}
              >
                Simulate refetch
              </Button>
              {selected3.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelected3([])}>
                  Clear
                </Button>
              )}
            </Inline>
          </Inline>
          <DataTable
            data={data3}
            columns={selectionColumns}
            selection="multiple"
            selectedRows={selected3}
            onSelectionChange={setSelected3}
            pagination={{ pageSize: 8 }}
            getRowId={(row) => row.id}
            aria-label="Selectable projects"
          />
        </Stack>
      </section>

      {/* ============================================================ */}
      {/* USE CASE 4 — Full-featured                                    */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          4. Full-featured (frozen columns + density + RTL + striped)
        </Heading>
        <Text className={styles.sectionIntro}>
          Wszystko: frozen <code>name</code> column left + frozen <code>actions</code> right
          (logical properties — automatyczne RTL swap), 6 sortable columns, filter row, selection,
          expansion, density toggle, RTL toggle, striped toggle, custom Badge cells. Try keyboard
          nav (Arrow keys, Home/End, Space, Enter).
        </Text>
        <Stack gap={3}>
          <Inline gap={4} wrap align="center">
            <Inline gap={2} align="center">
              <Text variant="small" color="muted">
                Density:
              </Text>
              <ToggleGroup
                value={density}
                onValueChange={(v) => v && setDensity(v as typeof density)}
                type="single"
                aria-label="Density"
              >
                <Toggle value="compact" size="sm">
                  Compact
                </Toggle>
                <Toggle value="cozy" size="sm">
                  Cozy
                </Toggle>
                <Toggle value="comfortable" size="sm">
                  Comfy
                </Toggle>
              </ToggleGroup>
            </Inline>
            <Inline gap={2} align="center">
              <Text variant="small" color="muted">
                RTL:
              </Text>
              <Switch
                name="rtl-toggle"
                label="RTL direction"
                hideLabel
                aria-label="RTL direction"
                checked={dir === 'rtl'}
                onCheckedChange={(checked) => setDir(checked ? 'rtl' : 'ltr')}
              />
            </Inline>
            <Inline gap={2} align="center">
              <Text variant="small" color="muted">
                Striped:
              </Text>
              <Switch
                name="striped-toggle"
                label="Striped rows"
                hideLabel
                aria-label="Striped rows"
                checked={striped}
                onCheckedChange={setStriped}
              />
            </Inline>
            <Inline gap={2} align="center" className={styles.searchInline}>
              <Text variant="small" color="muted">
                Search:
              </Text>
              <Input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Global search…"
                aria-label="Global search"
                className={styles.searchInput}
              />
            </Inline>
            <Text variant="small">
              {selected4.length === 0 ? 'No selection' : `${selected4.length} selected`}
            </Text>
          </Inline>
          <DataTable
            data={MOCK_PROJECTS}
            columns={fullFeaturedColumns}
            density={density}
            dir={dir}
            striped={striped}
            globalFilter={globalSearch}
            selection="multiple"
            selectedRows={selected4}
            onSelectionChange={setSelected4}
            expandable={{
              renderExpanded: (row) => (
                <Stack gap={2}>
                  <Text variant="small" color="muted">
                    Description
                  </Text>
                  <Text>{row.description}</Text>
                  <Inline gap={1} wrap>
                    {row.tags.map((tag) => (
                      <Badge key={tag} color="default" label={tag} />
                    ))}
                  </Inline>
                </Stack>
              ),
            }}
            pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
            rowVariant={(row) => (row.overdue ? 'warning' : row.archived ? 'default' : 'default')}
            rowDisabled={(row) => row.archived}
            getRowId={(row) => row.id}
            stickyHeader
            aria-label="Full-featured project grid"
          />
        </Stack>
      </section>

      {/* ============================================================ */}
      {/* USE CASE 5 — Real-world panel projects                        */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          5. Real-world — panel projects z onRowClick
        </Heading>
        <Text className={styles.sectionIntro}>
          Realistyczny use case z panel/CRM: klikalne wiersze otwierające detail page, sortowanie,
          paginacja, badges per status/priority, formatted currency + date. Mobile: poniżej 768px
          renderuje się card list zamiast tabeli.
        </Text>
        <DataTable
          data={realWorldData}
          columns={realWorldColumns}
          onRowClick={(row) => alert(`Open project ${row.id}: ${row.name}`)}
          rowClickable
          defaultSort={{ columnId: 'deadline', direction: 'asc' }}
          pagination={{ pageSize: 10 }}
          rowVariant={(row) => (row.overdue ? 'warning' : 'default')}
          getRowId={(row) => row.id}
          aria-label="Panel-style project list"
        />
      </section>

      {/* ============================================================ */}
      {/* USE CASE 6 — Empty / loading / error states                   */}
      {/* ============================================================ */}
      <section className={styles.section}>
        <Heading level={2} size="2xl">
          6. States — empty, loading, error
        </Heading>
        <Text className={styles.sectionIntro}>
          Three state machine: <code>state=&quot;loading&quot;</code> renders skeleton rows
          respecting column widths. <code>state=&quot;error&quot;</code> renders Alert z optional
          retry. Empty data renders <code>&lt;Empty&gt;</code> primitive (or{' '}
          <code>renderEmpty</code> slot).
        </Text>
        <Stack gap={4}>
          <div>
            <Heading level={3} size="lg">
              Loading
            </Heading>
            <DataTable
              data={[]}
              columns={basicColumns}
              state="loading"
              loadingRowCount={4}
              pagination={false}
              aria-label="Loading example"
            />
          </div>
          <div>
            <Heading level={3} size="lg">
              Error
            </Heading>
            <DataTable
              data={[]}
              columns={basicColumns}
              state="error"
              errorMessage="Failed to fetch projects — connection timeout."
              onRetry={() => alert('Retry triggered')}
              pagination={false}
              aria-label="Error example"
            />
          </div>
          <div>
            <Heading level={3} size="lg">
              Empty
            </Heading>
            <DataTable
              data={[]}
              columns={basicColumns}
              pagination={false}
              aria-label="Empty example"
            />
          </div>
        </Stack>
      </section>
    </main>
  );
}
