/**
 * A small real-time version of the plate treatment: shapes are rasterised onto a coarse grid,
 * shaded per frame by an effect, and ordered-dithered onto a handful of tones whose darkest step
 * is transparent, so the mark falls away into the page exactly like a plate does.
 */

export type { Ground, Layer, Glyph, Mask } from './types';
export { LEVELS, GROUNDS, ditherLevel, Surface } from './surface';
export { fit, drawSolid, rasterize } from './rendering';
export { distanceField } from './distance-field';
export { hash, noise, clamp01, smoothstep } from './math';
