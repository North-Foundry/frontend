import type { Mask } from './types';

/**
 * Chamfer distance, in cells, to the nearest cell on the other side of the glyph's edge:
 * inside the glyph when `inside`, outside it otherwise.
 */
export function distanceField(mask: Mask, inside: boolean): Float32Array {
  const { width, height, cover } = mask;
  const far = width + height;
  const d = new Float32Array(width * height);
  for (let i = 0; i < d.length; i++) d[i] = (cover[i] ?? 0) >= 0.5 === inside ? far : 0;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= width || y >= height ? (inside ? 0 : far) : (d[y * width + x] ?? far);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      d[i] = Math.min(
        d[i] ?? far,
        at(x - 1, y) + 1,
        at(x, y - 1) + 1,
        at(x - 1, y - 1) + 1.414,
        at(x + 1, y - 1) + 1.414,
      );
    }
  }
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      d[i] = Math.min(
        d[i] ?? far,
        at(x + 1, y) + 1,
        at(x, y + 1) + 1,
        at(x + 1, y + 1) + 1.414,
        at(x - 1, y + 1) + 1.414,
      );
    }
  }
  return d;
}
