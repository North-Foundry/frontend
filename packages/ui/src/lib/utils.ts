import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names, letting later Tailwind utilities win over conflicting earlier ones.
 *
 * shadcn-vue components import this helper as `cn`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
