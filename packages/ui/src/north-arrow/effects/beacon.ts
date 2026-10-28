import { type Layer, hash, noise, smoothstep } from '../engine';

import { extent, risingGrains } from './rising-grains';
import type { EffectDefinition } from './types';

/**
 * Beacon — for marks where only the needle is dithered. The needle charges from its base up to
 * the tip, then keeps breathing: a pulse climbs it every few seconds, single cells spark, and a
 * thin stream of grains rises from the tip and fades, like a signal sent north.
 */
export const beacon: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const { width, cover, layer } = mask;
    const { top, bottom } = extent(mask);
    const span = Math.max(1, bottom - top);
    const grains = risingGrains(mask, 0, 0.09);

    return {
      frame(t) {
        surface.clear();
        const charge = top + span * (1 - smoothstep(0, 1.1, t)) * 1.2 - 1;
        const pulse = ((t - 1.1) % 2.6) / 1.1;
        for (let y = top; y <= bottom; y++) {
          /**
           * 0 at the tip, 1 at the base.
           */
          const along = (y - top) / span;
          const climbing =
            t > 1.1 && pulse < 1.2 ? Math.exp(-(((1 - along - pulse) / 0.12) ** 2)) : 0;
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            if (c <= 0.02 || y < charge) {
              continue;
            }
            const seed = hash(x, y, 31);
            let value =
              (0.42 + 0.5 * (1 - along)) * (0.8 + 0.25 * noise(x * 0.2, y * 0.2, t * 0.7));
            value += climbing * 0.55;
            /**
             * The charging front glows.
             */
            value += Math.max(0, 1 - (y - charge) / 2);
            const tick = t * 3 + seed * 97;
            if (hash(x, y, Math.floor(tick)) < 0.02) {
              value = 1;
            }
            surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
          }
        }
        grains(surface, t - 1.1);
        surface.flush();
      },
    };
  },
};
