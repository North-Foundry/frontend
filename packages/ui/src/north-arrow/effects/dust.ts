import { LEVELS, hash } from '../engine';

import { type Particle, particlesOf } from './particles';
import type { EffectDefinition } from './types';

/**
 * Dust — dust gathers from the left into the mark, the mark holds and twinkles, then it
 * erodes into dust carried off to the right, and gathers again.
 */
export const dust: EffectDefinition = {
  rest: 3,
  create(surface, mask) {
    const particles = particlesOf(mask);
    const { width, height } = mask;
    const cycle = 8;

    function drift(p: Particle, s: number, direction: number): [number, number] {
      const r1 = hash(p.homeX, p.homeY, 1);
      const r2 = hash(p.homeX, p.homeY, 2);
      const r3 = hash(p.homeX, p.homeY, 3);
      const dx = direction * (s * (width * 0.05 + width * 0.12 * r1) + s * s * width * 0.08 * r2);
      const dy =
        -s * height * (0.04 + 0.12 * r3) + Math.sin(s * 3.2 + p.seed * 6.28) * s * height * 0.05;
      return [dx, dy];
    }

    return {
      frame(time) {
        surface.clear();
        const t = time % cycle;
        for (const p of particles) {
          const along = p.homeX / width;
          const arrival = 0.2 + 1.3 * along + 0.35 * p.seed;
          const departure = 4.6 + 1.7 * along + 0.4 * hash(p.homeX, p.homeY, 4);
          let x = p.homeX;
          let y = p.homeY;
          let level = p.level;
          if (t < arrival || t > departure) {
            const gathering = t < arrival;
            const s = gathering ? arrival - t : t - departure;
            const [dx, dy] = drift(p, s, gathering ? -1 : 1);
            x += dx;
            y += gathering ? -dy : dy;
            /**
             * Grains flash as they break away or land, then dim as they travel.
             */
            level = s < 0.12 ? LEVELS : p.level - Math.floor(s * 2.2 + hash(p.homeX, p.homeY, 5));
          } else if (hash(p.homeX, p.homeY, Math.floor(t * 7)) < 0.012) {
            level = LEVELS;
          }
          surface.plotLevel(Math.round(x), Math.round(y), level, p.layer);
        }
        surface.flush();
      },
    };
  },
};
