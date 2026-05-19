'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
} from '@/components/display/Table';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Badge } from '@/components/display/Badge';
import { Inline } from '@/components/layout/Inline';
import styles from './page.module.scss';

type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
};

const INVOICES: ReadonlyArray<Invoice> = [
  { id: 'INV-001', customer: 'Acme Corp', amount: 4200, status: 'paid', date: '2026-04-10' },
  {
    id: 'INV-002',
    customer: 'Globex Industries',
    amount: 1850,
    status: 'pending',
    date: '2026-04-12',
  },
  { id: 'INV-003', customer: 'Initech LLC', amount: 9800, status: 'paid', date: '2026-04-14' },
  { id: 'INV-004', customer: 'Umbrella Co', amount: 640, status: 'overdue', date: '2026-04-02' },
  {
    id: 'INV-005',
    customer: 'Stark Industries',
    amount: 15200,
    status: 'paid',
    date: '2026-04-15',
  },
];

const STATUS_COLOR: Record<Invoice['status'], 'success' | 'warning' | 'error'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function TablePlayground() {
  const [selectedId, setSelectedId] = useState<string | null>('INV-003');

  const total = INVOICES.reduce((sum, inv) => sum + inv.amount, 0);
  const paidTotal = INVOICES.filter((i) => i.status === 'paid').reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← back
        </Link>
        <Heading level={1} size="4xl">
          Table
        </Heading>
        <p className={styles.intro}>
          Semantic table primitives — six atoms (Table, Header, Body, Footer, Row, Cell) plus
          striped, bordered, and compact variants. For grid features (sorting, filtering,
          pagination, selection, expansion, frozen columns, APG <code>/grid/</code> keyboard model),
          use the 0.17.0 <a href="/components/data-table">DataTable</a> primitive — it composes this
          Table compound internally. Zero external runtime dependencies.
        </p>
      </header>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          1. Basic
        </Heading>
        <Text variant="small" color="muted">
          Default table — horizontal row separators from the root cascade.
        </Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col">
                Status
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell>
                  <Badge color={STATUS_COLOR[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell align="end">{formatMoney(inv.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          2. Striped
        </Heading>
        <Text variant="small" color="muted">
          <code>striped</code> prop — even TableBody rows get raised background. Header + Footer
          stay static.
        </Text>
        <Table striped>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Date
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell align="end">{formatMoney(inv.amount)}</TableCell>
                <TableCell align="end">{inv.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          3. Bordered + compact
        </Heading>
        <Text variant="small" color="muted">
          <code>bordered</code> adds full-grid borders; <code>compact</code> reduces cell padding
          for dense displays.
        </Text>
        <Table bordered compact>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col">
                Status
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell>
                  <Badge color={STATUS_COLOR[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell align="end">{formatMoney(inv.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          4. Row interaction — hoverable + selected
        </Heading>
        <Text variant="small" color="muted">
          Click a row to select. <code>hoverable</code> enables pointer feedback;{' '}
          <code>selected</code> applies brand tint + aria-selected.
        </Text>
        <Inline gap={2} align="center">
          <Badge color="brand">selected</Badge>
          <Text variant="small">{selectedId ?? '(none)'}</Text>
        </Inline>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col">
                Status
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow
                key={inv.id}
                hoverable
                selected={selectedId === inv.id}
                onClick={() => setSelectedId(inv.id)}
              >
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell>
                  <Badge color={STATUS_COLOR[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell align="end">{formatMoney(inv.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          5. With TableFooter — totals row
        </Heading>
        <Text variant="small" color="muted">
          <code>TableFooter</code> semantic section for summary rows. Separate top border
          automatically. Uses <code>as=&quot;th&quot;</code> <code>scope=&quot;row&quot;</code> on
          label cells.
        </Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell align="end">{formatMoney(inv.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell as="th" scope="row" colSpan={2}>
                Paid total
              </TableCell>
              <TableCell align="end">{formatMoney(paidTotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell as="th" scope="row" colSpan={2}>
                Grand total
              </TableCell>
              <TableCell align="end">{formatMoney(total)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          6. Disabled row
        </Heading>
        <Text variant="small" color="muted">
          <code>disabled</code> prop mutes the row visually + sets aria-disabled. Click handlers
          still fire — consumer checks the flag if they need to block interaction.
        </Text>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell as="th" scope="col">
                Invoice
              </TableCell>
              <TableCell as="th" scope="col">
                Customer
              </TableCell>
              <TableCell as="th" scope="col" align="end">
                Amount
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>INV-010</TableCell>
              <TableCell>Active Customer</TableCell>
              <TableCell align="end">$1,200</TableCell>
            </TableRow>
            <TableRow disabled>
              <TableCell>INV-011</TableCell>
              <TableCell>Archived Customer</TableCell>
              <TableCell align="end">$0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>INV-012</TableCell>
              <TableCell>Active Customer</TableCell>
              <TableCell align="end">$2,400</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* ─────────────────────────────────────────── */}
      <section className={styles.demo}>
        <Heading level={2} size="2xl">
          7. Need grid features? Use <code>&lt;DataTable&gt;</code>
        </Heading>
        <Text variant="small" color="muted">
          Sorting, filtering, pagination, selection, expansion, frozen columns, mobile card
          fallback, RTL, APG <code>/grid/</code> keyboard model, and aria-live announcements ship in
          the 0.17.0{' '}
          <a href="/components/data-table">
            <code>&lt;DataTable&gt;</code>
          </a>{' '}
          primitive. It composes these Table atoms internally, so you keep the same semantic markup
          and styling without pulling in an external headless engine.
        </Text>
        <code className={styles.codeBlock}>
          {`// In your app — zero external runtime deps
import { DataTable, type ColumnDef } from '@bleizlabs/ui';

const columns: ColumnDef<Project>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', sortable: true, filterable: 'text' },
  { id: 'status', header: 'Status', accessorKey: 'status', sortable: true, filterable: 'enum' },
  { id: 'owner', header: 'Owner', accessorKey: 'owner' },
];

<DataTable
  data={projects}
  columns={columns}
  selection="multiple"
  selectedRows={selected}
  onSelectionChange={setSelected}
  getRowId={(row) => row.id}
  pagination={{ pageSize: 25 }}
  density="cozy"
  stickyHeader
  aria-label="Project list"
/>`}
        </code>
      </section>
    </main>
  );
}
