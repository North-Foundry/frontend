import { type Mask, type Surface, LEVELS, hash } from '../engine';

/**
 * First and last rows of the glyph, and the top edge of each column (height where empty).
 */
export function extent(mask: Mask): { top: number; bottom: number; edge: Int32Array } {
  const { width, height, cover } = mask;
  let top = height;
  let bottom = 0;
  const edge = new Int32Array(width).fill(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((cover[y * width + x] ?? 0) < 0.5) {
        continue;
      }
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      if ((edge[x] ?? height) === height) {
        edge[x] = y;
      }
    }
  }
  return { top, bottom, edge };
}

/**
 * Grains that leave the top edge of the glyph and rise, drifting and dimming. They are born
 * at regular slots, `interval` seconds apart, around the tip, or across `spread` (a fraction
 * of the width) of the upper edge, rising at `speed` spans per second or so; only live ones
 * are drawn. `t` counts from the first grain.
 */
export function risingGrains(mask: Mask, spread: number, interval: number, speed = 1) {
  const { width, height } = mask;
  const { top, bottom, edge } = extent(mask);
  const span = Math.max(1, bottom - top);
  let tipX = 0;
  let tipCount = 0;
  for (let x = 0; x < width; x++) {
    if (edge[x] === top) {
      tipX += x;
      tipCount++;
    }
  }
  tipX = tipCount ? tipX / tipCount : width / 2;
  const life = 1.6;

  return (surface: Surface, t: number) => {
    if (t < 0) {
      return;
    }
    const newest = Math.floor(t / interval);
    for (let slot = Math.max(0, newest - Math.ceil(life / interval)); slot <= newest; slot++) {
      const age = t - slot * interval;
      if (age < 0 || age > life || hash(slot, 3, 41) < 0.35) {
        continue;
      }
      const bornX = Math.round(tipX + (hash(slot, 4, 41) - 0.5) * spread * width);
      const bornY = Math.min(edge[bornX] ?? height, height) - 1;
      if (bornY >= height - 1) {
        continue;
      }
      const drift = (hash(slot, 1, 41) - 0.5) * span * 0.5;
      const x = bornX + drift * (age / life) + Math.sin(age * 4 + slot) * 0.8;
      const y = bornY - age * span * speed * (0.6 + 0.5 * hash(slot, 2, 41));
      const level = Math.round(LEVELS * (1 - age / life));
      surface.plotLevel(Math.round(x), Math.round(y), level, 1);
    }
  };
}
