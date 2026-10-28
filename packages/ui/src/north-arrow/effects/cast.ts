import { castShading } from './shading';
import type { EffectDefinition } from './types';

/**
 * Casting — the mark is cast: metal fills it from the bottom, then it is read as an extruded,
 * bevelled object under a light that circles it, with a glint crossing the faces.
 */
export const cast: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const shade = castShading(
      mask,
      Math.max(2, Math.round(Math.min(mask.width, mask.height) * 0.035)),
    );
    return {
      frame(t) {
        surface.clear();
        shade(surface, t);
        surface.flush();
      },
    };
  },
};
