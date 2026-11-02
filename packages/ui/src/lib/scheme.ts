import { useMutationObserver } from '@vueuse/core';
import { type ComputedRef, type MaybeRefOrGetter, computed, ref, toValue } from 'vue';

/**
 * A colour scheme class of the theme; see `styles/themes/north-foundry.css`.
 */
export type Scheme = 'dark' | 'paper';

/**
 * Returns the scheme class of the nearest `.dark` or `.paper` ancestor of `element`, or
 * `undefined` on the default dark ground. Content teleported to `body`, such as a select's list,
 * leaves its trigger's scheme behind and needs this class to get it back.
 *
 * Vue does not track classes in the DOM, so while `open` is true a mutation observer watches class
 * changes in the document and reads the scheme again: a band that switches scheme while the content
 * is open recolours it on the spot. The scheme is also read again each time the content opens.
 */
export function useScheme(
  element: MaybeRefOrGetter<HTMLElement | null | undefined>,
  open: MaybeRefOrGetter<boolean>,
): ComputedRef<Scheme | undefined> {
  const classChanges = ref(0);

  useMutationObserver(
    () => (toValue(open) ? document.documentElement : undefined),
    () => {
      classChanges.value++;
    },
    { attributes: true, attributeFilter: ['class'], subtree: true },
  );

  return computed(() => {
    /**
     * Read only to re-run on open and on class changes; the class stays the same while the
     * content closes, so its exit animation keeps the scheme.
     */
    void toValue(open);
    void classChanges.value;
    const host = toValue(element)?.closest('.dark, .paper');
    if (!host) {
      return undefined;
    }
    return host.classList.contains('paper') ? 'paper' : 'dark';
  });
}
