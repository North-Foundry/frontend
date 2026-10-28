import { type Layer, type Mask, ditherLevel, hash } from '../engine';

import { baseTone } from './shading';

export interface Particle {
  homeX: number;
  homeY: number;
  level: number;
  layer: Layer;
  seed: number;
}

/**
 * Freezes the mark's dithered rest state into one particle per lit cell.
 */
export function particlesOf(mask: Mask): Particle[] {
  const particles: Particle[] = [];
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      const i = y * mask.width + x;
      const level = ditherLevel((mask.cover[i] ?? 0) * baseTone(mask, y), x, y);
      if (level > 0) {
        particles.push({
          homeX: x,
          homeY: y,
          level,
          layer: (mask.layer[i] ?? 1) as Layer,
          seed: hash(x, y, 7),
        });
      }
    }
  }
  return particles;
}
