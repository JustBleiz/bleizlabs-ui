/**
 * DateRangePicker (0.18.0 — Date/Time pack) — barrel re-export.
 *
 * Compound flat exports per D24. `<DateRangePickerContent />` auto-embeds
 * N `<Calendar>` instances (per `numberOfMonths` prop) — consumer does NOT
 * import or wire Calendar separately. Use as:
 *
 *   import {
 *     DateRangePicker,
 *     DateRangePickerInput,
 *     DateRangePickerContent,
 *   } from './';
 *
 *   <DateRangePicker value={range} onValueChange={setRange} numberOfMonths={2}>
 *     <DateRangePickerInput />
 *     <DateRangePickerContent />
 *   </DateRangePicker>
 */

export {
  DateRangePicker,
  DateRangePickerInput,
  DateRangePickerContent,
} from './DateRangePicker';

export type {
  DateRange,
  DateRangePickerProps,
  DateRangePickerInputProps,
  DateRangePickerContentProps,
} from './DateRangePicker';
