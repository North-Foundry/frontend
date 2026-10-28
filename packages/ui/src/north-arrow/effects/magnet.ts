import { LEVELS, hash, noise } from '../engine';

import { particlesOf } from './particles';
import type { EffectDefinition } from './types';

/**
 * Magnet — every grain is a particle on a spring. The pointer pushes grains aside, a click
 * blows them apart, and they settle back into the mark, glittering while they move.
 */
export const magnet: EffectDefinition = {
  rest: 4,
  create(surface, mask) {
    const { width, height } = mask;
    const homes = particlesOf(mask);
    const state = homes.map((p) => ({
      x: hash(p.homeX, p.homeY, 21) * width,
      y: hash(p.homeX, p.homeY, 22) * height,
      vx: 0,
      vy: 0,
    }));
    let pointer: { x: number; y: number } | null = null;
    const radius = Math.max(8, width * 0.09);

    return {
      pointer(position) {
        pointer = position;
      },
      poke(x, y) {
        for (const s of state) {
          const dx = s.x - x;
          const dy = s.y - y;
          const d = Math.hypot(dx, dy) + 0.5;
          const push = Math.max(0, 1 - d / (radius * 3)) * width * 1.6;
          s.vx += (dx / d) * push * (0.5 + Math.random());
          s.vy += (dy / d) * push * (0.5 + Math.random());
        }
      },
      frame(t, dt) {
        surface.clear();
        const step = Math.min(dt, 1 / 30);
        /**
         * Settled particles snap home for the reduced-motion still.
         */
        const settled = dt === 0;
        homes.forEach((p, index) => {
          const s = state[index];
          if (!s) {
            return;
          }
          if (settled) {
            s.x = p.homeX;
            s.y = p.homeY;
          } else {
            let ax = (p.homeX - s.x) * 38 - s.vx * 7.5;
            let ay = (p.homeY - s.y) * 38 - s.vy * 7.5;
            if (pointer) {
              const dx = s.x - pointer.x;
              const dy = s.y - pointer.y;
              const d = Math.hypot(dx, dy) + 0.3;
              const force = Math.max(0, 1 - d / radius) ** 2 * width * 40;
              ax += (dx / d) * force;
              ay += (dy / d) * force;
            }
            s.vx += ax * step;
            s.vy += ay * step;
            s.x += s.vx * step;
            s.y += s.vy * step;
          }
          const speed = Math.hypot(s.vx, s.vy);
          let level = p.level;
          if (speed > width * 0.25) {
            level = LEVELS;
          } else if (noise(p.homeX * 0.4, p.homeY * 0.4, t * 1.6) > 0.78) {
            level = Math.min(LEVELS, level + 1);
          }
          surface.plotLevel(Math.round(s.x), Math.round(s.y), level, p.layer);
        });
        surface.flush();
      },
    };
  },
};
