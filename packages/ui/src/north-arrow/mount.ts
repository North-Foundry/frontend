/**
 * Canvas mount for the North Foundry mark.
 *
 * The drawing comes from the logo lab (`engine`, `glyphs`, and the focused modules in `effects/`).
 * This module wires that engine to a host canvas, like the website's `stage.ts`, and keeps it in
 * step with a small set of options.
 *
 * @packageDocumentation
 */

import { type Effect, ascent } from './effects';
import { type Ground, Surface, rasterize } from './engine';
import { northArrow } from './glyphs';

/**
 * Air around the mark, as a fraction of the frame side. The lab's `logo-only` proposal uses the
 * same padding, which is what keeps the mark at the proportions of the site avatar.
 */
const PAD = 0.2;

/**
 * Smallest grid the mark is rasterised on; below this the glyph stops reading.
 */
const MIN_GRID = 8;

/**
 * Options accepted by {@link mountNorthArrow} and by the `NorthArrow` Vue component.
 *
 * Every option is optional: omitted values fall back to the defaults, which are the framing used
 * for the site avatar.
 */
export interface NorthArrowOptions {
  /**
   * Side of the square frame, in CSS pixels. Defaults to `96`.
   */
  size?: number;
  /**
   * Size of one dither cell in CSS pixels. Smaller values keep more detail but cost more cells.
   * Defaults to `2`. The grid is rebuilt from `size / cell`, so the lattice always lines up.
   */
  cell?: number;
  /**
   * Palette to dither against. `dark` (the default) is the site ground; `light` is for pale pages.
   */
  ground?: Ground;
  /**
   * Paints the whole mark in the foundry blue instead of ink and blue. Defaults to `false`.
   */
  mono?: boolean;
  /**
   * Lets the grains rise off the tip. Defaults to `false`, which draws the rest frame as a still.
   * Animation never starts when the visitor asks for reduced motion.
   */
  animated?: boolean;
}

/**
 * Handle returned by {@link mountNorthArrow}.
 */
export interface NorthArrowHandle {
  /**
   * Merges new options and repaints from scratch.
   *
   * @param options - Options to override; anything omitted keeps its current value.
   */
  update(options?: NorthArrowOptions): void;
  /**
   * Stops the animation loop and drops the effect. The canvas keeps its last frame.
   */
  destroy(): void;
}

/**
 * Defaults for every option, shared by the mount and the Vue component so the two cannot drift.
 *
 * These are the framing of the site avatar: a 96px square on the dark ground, still, with a 2px
 * grain.
 */
export const NORTH_ARROW_DEFAULTS: Required<NorthArrowOptions> = Object.freeze({
  size: 96,
  cell: 2,
  ground: 'dark',
  mono: false,
  animated: false,
});

/**
 * Grid side in cells for a frame of `size` CSS pixels and a grain of `cell` pixels. Floored so a
 * tiny frame stays readable, and guarded against a zero grain.
 */
export function gridSide(size: number, cell: number): number {
  return Math.max(MIN_GRID, Math.round(size / Math.max(1, cell)));
}

/**
 * Fills omitted options, and keys explicitly set to `undefined`, with the defaults.
 */
function resolveOptions(options: NorthArrowOptions): Required<NorthArrowOptions> {
  return {
    size: options.size ?? NORTH_ARROW_DEFAULTS.size,
    cell: options.cell ?? NORTH_ARROW_DEFAULTS.cell,
    ground: options.ground ?? NORTH_ARROW_DEFAULTS.ground,
    mono: options.mono ?? NORTH_ARROW_DEFAULTS.mono,
    animated: options.animated ?? NORTH_ARROW_DEFAULTS.animated,
  };
}

/**
 * Merges a partial update into resolved options; `undefined` keeps the current value.
 */
function mergeOptions(
  current: Required<NorthArrowOptions>,
  next: NorthArrowOptions,
): Required<NorthArrowOptions> {
  return {
    size: next.size ?? current.size,
    cell: next.cell ?? current.cell,
    ground: next.ground ?? current.ground,
    mono: next.mono ?? current.mono,
    animated: next.animated ?? current.animated,
  };
}

/**
 * Mounts the north arrow on a canvas and returns a handle that drives it.
 *
 * The canvas is sized in dither cells (its `width`/`height` attributes) and scaled up through CSS
 * with `image-rendering: pixelated`, so the grain stays square at any display size.
 *
 * @param canvas - Canvas to draw into. The mount resizes and restyles it.
 * @param initial - Options to start from; see {@link NorthArrowOptions}.
 * @returns A handle to update or destroy the mount.
 *
 * @example
 * ```ts
 * const mark = mountNorthArrow(document.querySelector('canvas')!, { size: 96 });
 * mark.update({ ground: 'light' });
 * mark.destroy();
 * ```
 */
export function mountNorthArrow(
  canvas: HTMLCanvasElement,
  initial: NorthArrowOptions = {},
): NorthArrowHandle {
  let options = resolveOptions(initial);
  let effect: Effect | null = null;
  let animation = 0;

  /**
   * Cancels a pending animation frame, if any.
   */
  const stopAnimation = (): void => {
    if (animation) {
      cancelAnimationFrame(animation);
    }
    animation = 0;
  };

  /**
   * Sizes the canvas for a grid of `grid` cells: the attributes hold the grid, the CSS size holds
   * the display size, and pixelated scaling keeps the grain crisp between the two.
   */
  const sizeCanvas = (grid: number): void => {
    const pixels = grid * options.cell;
    canvas.width = grid;
    canvas.height = grid;
    canvas.style.width = `${pixels}px`;
    canvas.style.height = `${pixels}px`;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.display = 'block';
  };

  /**
   * Draws the rest frame, which is a complete, legible mark.
   */
  const paintStill = (): void => {
    effect?.frame(ascent.rest, 0);
  };

  /**
   * Drives the effect from the wall clock until {@link stopAnimation} runs.
   */
  const startAnimation = (): void => {
    let previous = performance.now();
    const start = previous;
    const tick = (now: number): void => {
      effect?.frame((now - start) / 1000, (now - previous) / 1000);
      previous = now;
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
  };

  /**
   * Rebuilds the surface, mask and effect for the current options, then paints once.
   */
  const mount = (): void => {
    stopAnimation();

    const grid = gridSide(options.size, options.cell);
    sizeCanvas(grid);

    const surface = new Surface(canvas, grid, grid);
    surface.setPalette(options.ground, options.mono);
    effect = ascent.create(surface, rasterize(northArrow, grid, grid, Math.round(grid * PAD)));

    paintStill();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (options.animated && !reducedMotion.matches) {
      startAnimation();
    }
  };

  mount();

  return {
    update(next = {}) {
      options = mergeOptions(options, next);
      mount();
    },
    destroy() {
      stopAnimation();
      effect = null;
    },
  };
}
