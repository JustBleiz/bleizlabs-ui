/**
 * DatePicker (Phase 10 CI17) — barrel re-export.
 *
 * Compound flat exports per D24. `<DatePickerContent />` auto-embeds a
 * fully-wired `<Calendar>` internally — consumer does NOT import or
 * wire Calendar separately. Use as:
 *
 *   import {
 *     DatePicker,
 *     DatePickerInput,
 *     DatePickerContent,
 *   } from './';
 *
 *   <DatePicker value={date} onValueChange={setDate}>
 *     <DatePickerInput />
 *     <DatePickerContent />
 *   </DatePicker>
 */

export {
  DatePicker,
  DatePickerInput,
  DatePickerContent,
} from './DatePicker';

export type {
  DatePickerProps,
  DatePickerInputProps,
  DatePickerContentProps,
} from './DatePicker';
