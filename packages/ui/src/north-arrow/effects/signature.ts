import { type Layer, clamp01 } from '../engine';

import type { EffectDefinition } from './types';

/**
 * Signature — the lockup for the site header: the wordmark is written left to right by a dither
 * front, then a slow glint travels along it now and then.
 */
export const signature: EffectDefinition = {
  rest: 2.4,
  create(surface, mask) {
    const { width, height, cover, layer } = mask;
    return {
      frame(t) {
        surface.clear();
        const front = t * 0.9;
        const glint = ((t - 2) % 6) / 1.6;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            if (c <= 0.02) {
              continue;
            }
            const u = x / width;
            const written = clamp01((front - u) * 5);
            const shine =
              t > 2 ? Math.exp(-(((u - glint + y / height / 8) / 0.035) ** 2)) * 0.45 : 0;
            const edge = written > 0 && written < 1 ? 0.5 * (1 - written) : 0;
            const value = (0.82 + shine) * written + edge;
            surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
          }
        }
        surface.flush();
      },
    };
  },
};
