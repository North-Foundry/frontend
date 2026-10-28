import { DITHER_UNDERLAY_DEFAULTS, underlayLayout } from './layout';
import { renderDither } from './render';
import type { DitherUnderlayOptions } from './types';

export { DITHER_UNDERLAY_DEFAULTS } from './layout';
export type { DitherUnderlayOptions } from './types';

/**
 * The mount owns observers, canvas buffers and animation; callers own their DOM.
 */
export interface DitherUnderlayHandle {
  /**
   * Merge new options and redraw the mounted underlay.
   */
  update(options?: DitherUnderlayOptions): void;
  /**
   * Stop animation and release observers and event listeners.
   */
  destroy(): void;
}

/**
 * Mounts a decorative underlay inside a positioned, clipped host. Updating options
 * preserves elapsed time; destroying the mount removes all listeners and observers.
 */
export function mountDitherUnderlay(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  initial: DitherUnderlayOptions = {},
): DitherUnderlayHandle {
  const options = { ...DITHER_UNDERLAY_DEFAULTS };
  /**
   * Copy only supplied options recognized by the underlay defaults.
   */
  const mergeOptions = (next: DitherUnderlayOptions): void => {
    for (const key of Object.keys(DITHER_UNDERLAY_DEFAULTS) as (keyof DitherUnderlayOptions)[]) {
      if (next[key] !== undefined) {
        Object.assign(options, { [key]: next[key] });
      }
    }
  };
  mergeOptions(initial);

  const context = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let bounds = { width: host.clientWidth, height: host.clientHeight };
  let image: ImageData | undefined;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let visible = false;
  let destroyed = false;

  Object.assign(canvas.style, { position: 'absolute', display: 'block', imageRendering: 'pixelated' });

  /**
   * Reuses the alpha buffer and resolves theme variables against the current host.
   */
  function paint(): void {
    const { edge, cell, dimensions, style } = underlayLayout(options, bounds);
    Object.assign(canvas.style, style);
    if (!context) {
      return;
    }
    const w = Math.max(1, Math.ceil(dimensions.width / cell));
    const h = Math.max(1, Math.ceil(dimensions.height / cell));
    if (!image || image.width !== w || image.height !== h) {
      canvas.width = w;
      canvas.height = h;
      image = context.createImageData(w, h);
    }
    const phase = (elapsed / (Math.max(0.5, options.duration || 12) * 1000)) % 1;
    renderDither(image, options.intensity, reducedMotion.matches ? 'none' : options.animation, phase, {
      edge,
      waveShape: options.waveShape,
      waveCount: options.waveCount,
      amplitude: options.amplitude,
    });
    context.putImageData(image, 0, 0);
    const color = options.color.replace(/var\((--[\w-]+)\)/g, (_, token: string) =>
      getComputedStyle(canvas).getPropertyValue(token).trim(),
    );
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = color || DITHER_UNDERLAY_DEFAULTS.color;
    context.fillRect(0, 0, w, h);
    context.globalCompositeOperation = 'source-over';
  }

  /**
   * Limits painting to 24 frames per second without advancing while suspended.
   */
  function tick(now: number): void {
    if (!previous) {
      previous = now;
    }
    if (now - previous >= 1000 / 24) {
      elapsed += now - previous;
      previous = now;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }

  /**
   * Redraw the current state and restart animation when the page permits it.
   */
  function sync(): void {
    if (destroyed) {
      return;
    }
    cancelAnimationFrame(frame);
    previous = 0;
    paint();
    if (context && visible && !document.hidden && !reducedMotion.matches && !options.paused && options.animation !== 'none') {
      frame = requestAnimationFrame(tick);
    }
  }

  /**
   * Track whether the host is visible so offscreen animation can pause.
   */
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    sync();
  });
  /**
   * Refresh host dimensions and redraw after the host resizes.
   */
  const resizeObserver = new ResizeObserver(([entry]) => {
    if (entry) {
      bounds = { width: entry.contentRect.width, height: entry.contentRect.height };
      sync();
    }
  });
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  observer.observe(host);
  resizeObserver.observe(host);
  sync();

  return {
    /**
     * Apply supplied options and synchronize the mounted underlay.
     */
    update(next = {}) {
      if (destroyed) {
        return;
      }
      mergeOptions(next);
      sync();
    },
    /**
     * Stop scheduled work and release resources owned by this mount.
     */
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      reducedMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      image = undefined;
    },
  };
}
