import { cosine, sine } from './constants';

/**
 * Adjusts the original corner footprint without moving the Bayer lattice.
 */
export interface CornerOptions {
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  modulate?: (distance: number) => number;
}

/**
 * Measure a rotated point against the underlay's elliptical corner footprint.
 */
export function cornerDistance(u: number, v: number, scale: number): number {
  const du = u * cosine - v * sine;
  const dv = u * sine + v * cosine;
  return Math.hypot(du / (0.85 * scale), dv / (0.38 * scale));
}
