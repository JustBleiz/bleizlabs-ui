/**
 * Calendar (Phase 10 CI16) — barrel re-export.
 *
 * Compound flat exports per D24. Use as:
 *   import {
 *     Calendar,
 *     CalendarHeader,
 *     CalendarGrid,
 *     CalendarGridHead,
 *     CalendarGridBody,
 *     CalendarCell,
 *   } from '@/components/complex/Calendar';
 */

export {
  Calendar,
  CalendarHeader,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridBody,
  CalendarCell,
} from './Calendar';

export type {
  CalendarProps,
  CalendarHeaderProps,
  CalendarGridProps,
  CalendarGridHeadProps,
  CalendarGridBodyProps,
  CalendarCellProps,
  CalendarDir,
  CalendarWeekStart,
  CalendarDisabled,
} from './Calendar';
