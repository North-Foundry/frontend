import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';
import { effectScope } from 'vue';

interface SelectFixture {
  button: { closest(selector: string): SelectFixture['content'] | null };
  content: { focus(options: { preventScroll: boolean }): void; querySelector(selector: string): SelectFixture['viewport'] | null };
  viewport: {
    isConnected: boolean;
    scrollTop: number;
    querySelector(selector: string): { offsetHeight: number } | null;
  };
  focused: Array<{ preventScroll: boolean }>;
}

/**
 * Creates the selector-aware DOM objects consumed by the scroll hook.
 */
function createFixture(options: { height?: number; initialTop?: number; maxTop?: number; checked?: boolean } = {}): SelectFixture {
  const { height = 40, initialTop = 100, maxTop = 500, checked = true } = options;
  let top = initialTop;
  const focused: Array<{ preventScroll: boolean }> = [];
  const item = { offsetHeight: height };
  const viewport = {
    isConnected: true,
    /**
     * Reads the current mocked scroll offset.
     */
    get scrollTop(): number { return top; },
    /**
     * Clamps scrolling to the mocked viewport bounds.
     */
    set scrollTop(value: number) { top = Math.max(0, Math.min(maxTop, value)); },
    /**
     * Returns the selected item or first item for the requested selector.
     */
    querySelector(selector: string): { offsetHeight: number } | null {
      if (selector === '[data-slot="select-item"][data-state="checked"]') {
        return checked ? item : null;
      } else if (selector === '[data-slot="select-item"]') {
        return item;
      }
      return null;
    },
  };
  const content = {
    /**
     * Records focus options used to prevent focus from changing scroll.
     */
    focus(options: { preventScroll: boolean }): void { focused.push(options); },
    /**
     * Returns the viewport for its selector.
     */
    querySelector(selector: string): typeof viewport | null {
      return selector === '[data-slot="select-viewport"]' ? viewport : null;
    },
  };
  const button = {
    /**
     * Finds the list content containing this mocked button.
     */
    closest(selector: string): typeof content | null {
      return selector === '[data-slot="select-content"]' ? content : null;
    },
  };
  return { button, content, viewport, focused };
}

/**
 * Wraps a mocked current target in the pointer event shape used by the hook.
 */
function pointerEvent(button: SelectFixture['button']): PointerEvent {
  return { currentTarget: button } as unknown as PointerEvent;
}

const root = fileURLToPath(new URL('../../../', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  server: { middlewareMode: true, hmr: false, ws: false },
});

try {
  const { DEFAULT_SELECT_SCROLL_SPEED_FACTOR, useSelectScroll } = await server.ssrLoadModule(
    '/packages/ui/src/components/select/useSelectScroll.ts',
  );

  await test('select pointer scrolling uses live item-scaled steps and cleans up', (t) => {
    t.mock.timers.enable({ apis: ['setInterval'] });
    assert.equal(DEFAULT_SELECT_SCROLL_SPEED_FACTOR, 0.25);

    for (const direction of [-1, 1] as const) {
      const fixture = createFixture();
      const scroll = useSelectScroll(direction, () => undefined);
      scroll.start(pointerEvent(fixture.button));
      t.mock.timers.tick(50);
      assert.equal(fixture.viewport.scrollTop, 100 + direction * 10, 'Default speed must move one quarter item in either direction');
      assert.deepEqual(fixture.focused, [{ preventScroll: true }]);
      scroll.stop();
    }

    const fullStep = createFixture({ checked: false });
    const fullSpeed = useSelectScroll(1, () => 1);
    fullSpeed.start(pointerEvent(fullStep.button));
    t.mock.timers.tick(50);
    assert.equal(fullStep.viewport.scrollTop, 140, 'Factor one must move one full first item');
    fullSpeed.stop();

    const live = createFixture();
    let factor = 0.5;
    const liveSpeed = useSelectScroll(1, () => factor);
    liveSpeed.start(pointerEvent(live.button));
    liveSpeed.start(pointerEvent(live.button));
    t.mock.timers.tick(50);
    assert.equal(live.viewport.scrollTop, 120, 'Repeated starts must keep one interval');
    factor = 0.25;
    t.mock.timers.tick(50);
    assert.equal(live.viewport.scrollTop, 130, 'The factor must be read again on each interval');
    liveSpeed.stop();
    t.mock.timers.tick(50);
    assert.equal(live.viewport.scrollTop, 130, 'Stop must cancel further scrolling');

    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      const fixture = createFixture();
      const scroll = useSelectScroll(1, () => invalid);
      scroll.start(pointerEvent(fixture.button));
      t.mock.timers.tick(50);
      assert.equal(fixture.viewport.scrollTop, 110, 'Invalid factors must use the default speed');
      scroll.stop();
    }

    const zero = createFixture();
    const zeroSpeed = useSelectScroll(1, () => 0);
    zeroSpeed.start(pointerEvent(zero.button));
    t.mock.timers.tick(100);
    assert.equal(zero.viewport.scrollTop, 100, 'Zero speed must pause without moving');
    zeroSpeed.stop();

    const detached = createFixture();
    detached.viewport.isConnected = false;
    const detachedScroll = useSelectScroll(1, () => 1);
    detachedScroll.start(pointerEvent(detached.button));
    t.mock.timers.tick(50);
    detached.viewport.isConnected = true;
    t.mock.timers.tick(50);
    assert.equal(detached.viewport.scrollTop, 100, 'A detached viewport must pause the interval');

    const edge = createFixture({ initialTop: 500, maxTop: 500 });
    const edgeScroll = useSelectScroll(1, () => 1);
    edgeScroll.start(pointerEvent(edge.button));
    t.mock.timers.tick(100);
    assert.equal(edge.viewport.scrollTop, 500, 'Reaching the scroll edge must pause the interval');
    edge.viewport.scrollTop = 450;
    t.mock.timers.tick(50);
    assert.equal(edge.viewport.scrollTop, 450, 'Scrolling must remain paused after moving away from the edge');

    const scoped = createFixture();
    const scope = effectScope();
    scope.run(() => useSelectScroll(1, () => 1).start(pointerEvent(scoped.button)));
    scope.stop();
    t.mock.timers.tick(50);
    assert.equal(scoped.viewport.scrollTop, 100, 'Disposing the Vue scope must cancel scrolling');
  });
} finally {
  await server.close();
}
