import { bayer } from './constants';
import { cornerDistance, type CornerOptions } from './corner';
import type { EffectContext } from '../effects/types';

export type DensityField = (along: number, distance: number) => number;

/**
 * Sample density coarsely, then interpolate it at the grain resolution.
 */
function buildField(sample: DensityField): Float32Array {
  const field = new Float32Array(65 * 33);
  for (let y = 0; y <= 32; y++) {
    const distance = y / 32;
    for (let x = 0; x <= 64; x++) {
      field[y * 65 + x] = sample(x / 64, distance);
    }
  }
  return field;
}

/**
 * Bilinearly interpolate a density value from the coarse field grid.
 */
function sampleField(field: Float32Array, along: number, distance: number): number {
  const x = Math.min(63.999, Math.max(0, along * 64));
  const y = Math.min(31.999, Math.max(0, distance * 32));
  const xi = Math.floor(x), yi = Math.floor(y);
  const a = field[yi * 65 + xi] ?? 0;
  const b = field[yi * 65 + xi + 1] ?? 0;
  const c = field[(yi + 1) * 65 + xi] ?? 0;
  const d = field[(yi + 1) * 65 + xi + 1] ?? 0;
  return (a + (b - a) * (x - xi)) * (1 - y + yi) + (c + (d - c) * (x - xi)) * (y - yi);
}

/**
 * Rasterize density on a full side or through the original corner footprint.
 * Effects supply their formulas; this module has no animation-name dispatch.
 */
export function renderField(context: EffectContext, sample?: DensityField, corner: CornerOptions = {}): void {
  const { image: { width, height, data }, coverage } = context;
  const { scale = 1, offsetX = 0, offsetY = 0, modulate } = corner;
  const field = sample || context.edge
    ? buildField(sample ?? ((_, distance) => Math.max(0, 1 - distance / (0.85 * scale)) ** 1.6))
    : undefined;
  const edge = context.edge ?? 'bottom';
  for (let y = 0; y < height; y++) {
    const v = (height - y) / height - offsetY;
    for (let x = 0; x < width; x++) {
      const u = (width - x) / width - offsetX;
      let tone = 1;
      if (!context.edge) {
        const distance = cornerDistance(u, v, scale);
        tone = Math.max(0, 1 - distance) ** 1.6;
        if (modulate) {
          tone *= modulate(distance);
        }
      }
      if (field) {
        const along = edge === 'left' || edge === 'right' ? y / height : x / width;
        const distance = edge === 'top' ? y / height : edge === 'left' ? x / width
          : edge === 'right' ? (width - 1 - x) / width : (height - 1 - y) / height;
        tone *= sampleField(field, along, distance);
      }
      data[(y * width + x) * 4 + 3] = tone * coverage > (bayer[(y % 8) * 8 + x % 8] ?? 0.5) ? 255 : 0;
    }
  }
}
