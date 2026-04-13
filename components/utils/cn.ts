/**
 * Tiny class name joiner. Filters out falsy values, joins survivors with a
 * single space. Equivalent surface area to clsx for our needs without the
 * dependency. Accepts string, number, undefined, null, false, or arrays of
 * the same.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value && value !== 0) return;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
    }
  };

  for (const input of inputs) walk(input);
  return out.join(' ');
}
