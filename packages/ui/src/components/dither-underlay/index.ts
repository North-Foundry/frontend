/**
 * Decorative corner and side textures, with Vue and framework-free entry points.
 */
export { default as DitherUnderlay } from './DitherUnderlay.vue';
export { DITHER_UNDERLAY_DEFAULTS, mountDitherUnderlay, type DitherUnderlayHandle } from './mount';
export type {
  DitherUnderlayOptions,
  DitherUnderlayProps,
  DitherUnderlayPosition,
  DitherUnderlayAnimation,
  DitherEdge,
  DitherWaveShape,
} from './types';

/**
 * Compatibility names for consumers migrating from DitherOverlay.
 * @deprecated Use DitherUnderlay and its types and mount helpers.
 */
export { default as DitherOverlay } from './DitherUnderlay.vue';
export {
  DITHER_UNDERLAY_DEFAULTS as DITHER_OVERLAY_DEFAULTS,
  mountDitherUnderlay as mountDitherOverlay,
  type DitherUnderlayHandle as DitherOverlayHandle,
} from './mount';
export type {
  DitherUnderlayOptions as DitherOverlayOptions,
  DitherUnderlayProps as DitherOverlayProps,
  DitherUnderlayPosition as DitherOverlayPosition,
  DitherUnderlayAnimation as DitherOverlayAnimation,
} from './types';

/**
 * Compatibility names for consumers migrating from DitherCorner.
 * @deprecated Use DitherUnderlay and the DitherUnderlay types.
 */
export { default as DitherCorner } from './DitherUnderlay.vue';
export type {
  DitherUnderlayProps as DitherCornerProps,
  DitherUnderlayPosition as DitherCornerPosition,
  DitherUnderlayAnimation as DitherCornerAnimation,
} from './types';
