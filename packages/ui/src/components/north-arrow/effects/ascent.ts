import { risingGrains } from './rising-grains';
import { castShading } from './shading';
import type { EffectDefinition } from './types';

/**
 * Relief — the needle alone, cast as a faceted pyramid: its ridges run from every corner
 * into the centre and catch the circling light, while grains peel off its upper edges and
 * rise north.
 */
export const ascent: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const shade = castShading(mask, 'full');
    const grains = risingGrains(mask, 0.8, 0.015, 0.45);
    return {
      frame(t) {
        surface.clear();
        shade(surface, t);
        grains(surface, t - 1.5);
        surface.flush();
      },
    };
  },
};
