import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';

interface MockEntry {
  isIntersecting?: boolean;
  contentRect?: { width: number; height: number };
}

interface MockObserver {
  callback(entries: MockEntry[]): void;
  disconnected: boolean;
  observe(target: unknown): void;
  disconnect(): void;
}

const root = fileURLToPath(new URL('../../../', import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  plugins: [vue()],
  server: { middlewareMode: true, hmr: false, ws: false },
});
const savedGlobals = new Map<string, PropertyDescriptor | undefined>();

/**
 * Replaces a browser global while retaining its original property descriptor.
 */
const mock = (name: string, value: unknown): void => {
  savedGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
};

try {
  const {
    DitherUnderlay,
    DitherCorner,
    DitherOverlay,
    mountDitherUnderlay,
    mountDitherOverlay,
    DITHER_UNDERLAY_DEFAULTS,
    DITHER_OVERLAY_DEFAULTS,
  } = await server.ssrLoadModule('/packages/ui/src/components/dither-underlay/index.ts');
  assert.ok('reactionThickness' in DitherUnderlay.props, 'The Vue component must accept reaction thickness as a prop');
  assert.equal(DitherCorner, DitherUnderlay, 'The legacy name must use the same component');
  assert.equal(DitherOverlay, DitherUnderlay, 'The overlay alias must use the same component');
  assert.equal(mountDitherOverlay, mountDitherUnderlay);
  assert.equal(DITHER_OVERLAY_DEFAULTS, DITHER_UNDERLAY_DEFAULTS);
  const packageExports = (await import('../../../packages/ui/package.json', { with: { type: 'json' } })).default.exports;
  assert.deepEqual(Object.keys(packageExports).filter(key => key.startsWith('./dither-')), ['./dither-underlay']);

  /**
   * Renders the component through Vue SSR with its supplied props.
   */
  const ssr = (component: Component, props: Record<string, unknown> = {}): Promise<string> =>
    renderToString(createSSRApp({
      /**
       * Supplies the selected component and props to Vue's server renderer.
       */
      render: () => h(component, props),
    }));
  const canonical = await ssr(DitherUnderlay, { position: 'top-left', size: 600 });
  const legacy = await ssr(DitherCorner, { corner: 'top-left', size: 600 });
  assert.equal(canonical, legacy, 'The legacy prop must preserve SSR output');
  assert.match(canonical, /aria-hidden="true"/);
  assert.match(canonical, /scale\(-1, -1\)/);
  assert.equal(await ssr(DitherUnderlay, { position: 'right', corner: 'top-left' }),
    await ssr(DitherUnderlay, { position: 'right' }), 'Position must take precedence over corner');

  const visibilityListeners = new Set<() => void>();
  const motionListeners = new Set<() => void>();
  const page = {
    hidden: false,
    /** Records listeners registered by the mounted underlay. */
    addEventListener: (_type: string, callback: () => void): void => { visibilityListeners.add(callback); },
    /** Removes listeners registered by the mounted underlay. */
    removeEventListener: (_type: string, callback: () => void): void => { visibilityListeners.delete(callback); },
  };
  const motion = {
    matches: false,
    /** Records listeners registered for reduced motion changes. */
    addEventListener: (_type: string, callback: () => void): void => { motionListeners.add(callback); },
    /** Removes listeners registered for reduced motion changes. */
    removeEventListener: (_type: string, callback: () => void): void => { motionListeners.delete(callback); },
  };
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  const intersections: MockObserver[] = [];
  const resizes: MockObserver[] = [];

  /**
   * Creates an observer mock that records instances for assertions and callbacks.
   */
  const observer = (instances: MockObserver[]) => class implements MockObserver {
    callback: (entries: MockEntry[]) => void;
    disconnected = false;

    /**
     * Stores the callback and adds this mock instance to the observed list.
     */
    constructor(callback: (entries: MockEntry[]) => void) {
      this.callback = callback;
      instances.push(this);
    }

    /**
     * Keeps the observed target available for structural completeness.
     */
    observe(_target: unknown): void {}

    /**
     * Marks this observer as disconnected for cleanup assertions.
     */
    disconnect(): void {
      this.disconnected = true;
    }
  };

  mock('document', page);
  mock('matchMedia', () => motion);
  mock('IntersectionObserver', observer(intersections));
  mock('ResizeObserver', observer(resizes));
  mock('requestAnimationFrame', (callback: FrameRequestCallback): number => {
    frames.set(++frameId, callback);
    return frameId;
  });
  mock('cancelAnimationFrame', (id: number): void => { frames.delete(id); });
  mock('getComputedStyle', () => ({ color: '#123456' }));

  let latest: Uint8ClampedArray | undefined;
  const context = {
    fillStyle: '',
    globalCompositeOperation: 'source-over',
    /** Allocates an image buffer for the mount's requested canvas dimensions. */
    createImageData: (width: number, height: number) => ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    }),
    /** Captures the most recently rendered image for animation assertions. */
    putImageData: (image: { data: Uint8ClampedArray }): void => { latest = image.data.slice(); },
    /** Represents the canvas paint operation used for colourisation. */
    fillRect(): void {},
  };
  const host = { clientWidth: 120, clientHeight: 80 };
  const style: CSSStyleDeclaration & Record<string, string> = {
    /** Stores custom properties alongside standard style values. */
    setProperty(name: string, value: string): void { this[name] = value; },
  } as CSSStyleDeclaration & Record<string, string>;
  const canvas = {
    width: 0,
    height: 0,
    style,
    /** Returns the mocked 2D context used by the mounted underlay. */
    getContext: () => context,
  };
  const underlay = mountDitherUnderlay(host as HTMLElement, canvas as unknown as HTMLCanvasElement, {
    position: 'bottom', depth: 40, pixelSize: 2, animation: 'wave', color: 'var(--signal)',
  });
  assert.deepEqual([canvas.width, canvas.height], [60, 20]);
  assert.equal(canvas.style.width, '100%');
  assert.equal(context.fillStyle, '#123456');
  assert.equal(canvas.style['--dither-underlay-color'], 'var(--signal)');
  assert.equal(canvas.style.color, 'var(--dither-underlay-color, #5b8fd6)');
  assert.equal(frames.size, 0, 'Offscreen overlays must not animate');

  /**
   * Delivers an intersection update to the mocked observer.
   */
  const enter = (value: boolean): void => intersections[0].callback([{ isIntersecting: value }]);

  /**
   * Calls each registered listener to simulate a browser event.
   */
  const notify = (listeners: Set<() => void>): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  /**
   * Runs and removes the next queued animation frame.
   */
  const advance = (now: number): void => {
    const entry = frames.entries().next().value;
    assert.ok(entry, 'An animation frame must be queued');
    const [id, callback] = entry;
    frames.delete(id);
    callback(now);
  };

  enter(true);
  assert.equal(frames.size, 1);
  const initial = latest;
  advance(100);
  advance(1000);
  assert.notDeepEqual(latest, initial, 'The mounted animation must advance');
  underlay.update({ paused: true });
  assert.equal(frames.size, 0);
  const paused = latest;
  underlay.update({});
  assert.deepEqual(latest, paused, 'Updates must preserve elapsed time while paused');
  underlay.update({ paused: false });
  assert.equal(frames.size, 1);
  underlay.update({ timescale: 0 });
  assert.equal(frames.size, 0, 'A zero timescale must not schedule frames');
  underlay.update({ timescale: 1 });
  assert.equal(frames.size, 1);
  page.hidden = true;
  notify(visibilityListeners);
  assert.equal(frames.size, 0);
  page.hidden = false;
  notify(visibilityListeners);
  assert.equal(frames.size, 1);
  motion.matches = true;
  notify(motionListeners);
  assert.equal(frames.size, 0);
  const still = latest;
  underlay.update({ animation: 'fire' });
  assert.deepEqual(latest, still, 'Reduced motion must render the static reference');
  motion.matches = false;
  notify(motionListeners);
  enter(false);
  assert.equal(frames.size, 0);

  resizes[0].callback([{ contentRect: { width: 160, height: 100 } }]);
  assert.deepEqual([canvas.width, canvas.height], [80, 20]);
  underlay.update({ position: 'left', depth: undefined });
  assert.deepEqual([canvas.width, canvas.height], [20, 50]);
  assert.equal(canvas.style.bottom, '');
  underlay.update({ position: 'top-left', size: 90 });
  assert.deepEqual([canvas.width, canvas.height], [45, 28]);
  assert.equal(canvas.style.transform, 'scale(-1, -1)');
  underlay.update({ position: 'right' });
  assert.equal(canvas.style.transform, '');
  assert.equal(canvas.style.left, '');
  enter(true);
  assert.equal(frames.size, 1);
  underlay.destroy();
  assert.equal(frames.size, 0);
  assert.ok([...intersections, ...resizes].every(item => item.disconnected));
  assert.equal(visibilityListeners.size, 0);
  assert.equal(motionListeners.size, 0);
  underlay.update({ paused: false });
  assert.equal(frames.size, 0, 'Destroyed mounts must stay stopped');
  enter(true);
  assert.equal(frames.size, 0, 'Queued observer callbacks must not restart destroyed mounts');
  assert.equal(DITHER_UNDERLAY_DEFAULTS.position, 'bottom-right');
  console.log('Dither underlay: SSR, compatibility, sizing, motion preferences and cleanup passed.');
} finally {
  for (const [name, descriptor] of savedGlobals) {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, name);
    }
  }
  await server.close();
}
