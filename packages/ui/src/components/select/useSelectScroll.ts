import { useIntervalFn } from '@vueuse/core';

export const DEFAULT_SELECT_SCROLL_SPEED_FACTOR = 0.25;

/**
 * Controls pointer scrolling while Reka keeps the arrows' visibility and keyboard navigation.
 */
export function useSelectScroll(direction: -1 | 1, speedFactor: () => number | undefined) {
  let viewport: HTMLElement | null = null;
  let itemHeight = 0;

  const { pause, resume, isActive } = useIntervalFn(() => {
    const factor = speedFactor() ?? DEFAULT_SELECT_SCROLL_SPEED_FACTOR;
    const speed = Number.isFinite(factor) && factor >= 0 ? factor : DEFAULT_SELECT_SCROLL_SPEED_FACTOR;
    if (!viewport?.isConnected || speed === 0) {
      pause();
      return;
    }

    const previousTop = viewport.scrollTop;
    viewport.scrollTop += direction * itemHeight * speed;
    if (viewport.scrollTop === previousTop) {
      pause();
    }
  }, 50, { immediate: false });

  /**
   * Replaces Reka's fixed pointer timer with a scaled step for this list only.
   */
  function start(event: PointerEvent): void {
    if (isActive.value) {
      return;
    }

    const content = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-slot="select-content"]');
    viewport = content?.querySelector<HTMLElement>('[data-slot="select-viewport"]') ?? null;
    const item = viewport?.querySelector<HTMLElement>('[data-slot="select-item"][data-state="checked"]')
      ?? viewport?.querySelector<HTMLElement>('[data-slot="select-item"]');
    if (!viewport || !item) {
      return;
    }

    itemHeight = item.offsetHeight;
    content?.focus({ preventScroll: true });
    resume();
  }

  return { start, stop: pause };
}
