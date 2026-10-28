import { type Layer, clamp01, distanceField, hash, noise, smoothstep } from '../engine';

import { baseTone } from './shading';
import type { EffectDefinition } from './types';

/**
 * Signal — the mark breathes under slow noise, single cells catch the light and spark, and a
 * faint haze of dust hangs around its edges.
 */
export const signal: EffectDefinition = {
  rest: 2.2,
  create(surface, mask) {
    const { width, height, cover, layer } = mask;
    const outside = distanceField(mask, false);
    const halo = Math.max(4, Math.round(width * 0.05));
    return {
      frame(t) {
        surface.clear();
        const reveal = smoothstep(0, 1.4, t);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            const seed = hash(x, y, 11);
            if (c > 0.02) {
              let value =
                c *
                (0.5 + 0.38 * noise(x * 0.07, y * 0.07, t * 0.45)) *
                (0.72 + 0.28 * baseTone(mask, y));
              const tick = t * 3 + seed * 97;
              if (hash(x, y, Math.floor(tick)) < 0.014) {
                value = 1 - (tick % 1) * 0.6;
              }
              value *= clamp01(reveal * 1.6 - seed * 0.6);
              surface.plot(x, y, value, (layer[i] ?? 1) as Layer);
            } else {
              const d = outside[i] ?? halo;
              if (d > halo) {
                continue;
              }
              const chance = 0.035 * (1 - d / halo) * reveal;
              if (hash(x, y, Math.floor(t * 2.5 + seed * 13)) < chance) {
                surface.plotLevel(x, y, d < 2 ? 2 : 1, 1);
              }
            }
          }
        }
        surface.flush();
      },
    };
  },
};
