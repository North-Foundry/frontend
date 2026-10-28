import type { Mask, Surface } from '../engine';

export interface Effect {
  frame(t: number, dt: number): void;
  /**
   * Pointer position in grid cells, or null when it leaves the canvas.
   */
  pointer?(position: { x: number; y: number } | null): void;
  /**
   * A click at a grid position.
   */
  poke?(x: number, y: number): void;
}

export interface EffectDefinition {
  /**
   * A time at which the mark is fully formed and still.
   */
  rest: number;
  create(surface: Surface, mask: Mask): Effect;
}
