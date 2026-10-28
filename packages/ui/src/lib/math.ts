/**
 * Stable pseudo-random value in [0, 1) for integer-ish coordinates.
 */
export function hash(x: number, y: number, z = 0): number {
  let h =
    Math.imul(Math.floor(x) | 0, 374761393) ^
    Math.imul(Math.floor(y) | 0, 668265263) ^
    Math.imul(Math.floor(z) | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Smooth value noise in [0, 1].
 */
export function noise(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  /**
   * Smooth a fractional coordinate for continuous interpolation.
   */
  const fade = (t: number) => t * t * (3 - 2 * t);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const w = fade(z - zi);
  /**
   * Blend two values by a normalized interpolation amount.
   */
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  /**
   * Interpolate hashed corner values across one horizontal plane.
   */
  const plane = (zz: number) =>
    lerp(
      lerp(hash(xi, yi, zz), hash(xi + 1, yi, zz), u),
      lerp(hash(xi, yi + 1, zz), hash(xi + 1, yi + 1, zz), u),
      v,
    );
  return lerp(plane(zi), plane(zi + 1), w);
}

/**
 * Clamp a number to the inclusive unit interval.
 */
export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Maps a value between two edges to a smooth transition clamped from zero to one.
 */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
