import { type ComputedRef, type MaybeRefOrGetter, computed, toValue } from 'vue';

/**
 * A colour scheme class of the theme; see `styles/themes/north-foundry.css`.
 */
export type Scheme = 'dark' | 'paper';

/**
 * Returns the scheme class of the nearest `.dark` or `.paper` ancestor of `element`, or
 * `undefined` on the default dark ground. Content teleported to `body`, such as a select's list,
 * leaves its trigger's scheme behind and needs this class to get it back.
 */
export function useScheme(
  element: MaybeRefOrGetter<HTMLElement | null | undefined>,
): ComputedRef<Scheme | undefined> {
  return computed(() => {
    const host = toValue(element)?.closest('.dark, .paper');
    if (!host) {
      return undefined;
    }
    return host.classList.contains('paper') ? 'paper' : 'dark';
  });
}
