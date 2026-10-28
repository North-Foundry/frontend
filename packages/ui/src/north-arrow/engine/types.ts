/**
 * Background tone used to choose contrasting mark colours.
 */
export type Ground = 'dark' | 'light';

/**
 * 0 is the ink of the N (graphite on dark, near-black on light); 1 is the foundry blue.
 */
export type Layer = 0 | 1;

/**
 * A mark drawn in its own design units; `draw` fills only the parts that belong to `layer`.
 */
export interface Glyph {
  width: number;
  height: number;
  draw(context: CanvasRenderingContext2D, layer: Layer): void;
}

/**
 * Per-cell coverage of a glyph on the grid, and which layer each cell belongs to.
 */
export interface Mask {
  width: number;
  height: number;
  cover: Float32Array;
  layer: Uint8Array;
}
