import { hash } from '../../../lib/math';
import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const voronoi: DitherEffect = {
  /** Draw a dense network of moving cell boundaries. */
  render(context) {
    const { phase, amplitude, waveCount } = context;
    const count = Math.max(10, Math.min(32, Math.round(16 + waveCount * 3)));
    const t = phase * tau;
    const seeds = Array.from({ length: count }, (_, i) => {
      const radius = (0.015 + hash(i, 23, 71) * 0.045) * (0.65 + amplitude * 1.2);
      const speed = 1 + Math.floor(hash(i, 31, 71) * 2);
      const angle = hash(i, 43, 71) * tau;
      return {
        x: 0.08 + hash(i, 11, 71) * 0.84 + Math.cos(t * speed + angle) * radius,
        y: 0.06 + hash(i, 17, 71) * 0.88 + Math.sin(t * speed + angle * 1.2) * radius,
      };
    });

    renderField(context, (along, distance) => {
      let d1 = Number.POSITIVE_INFINITY;
      let d2 = Number.POSITIVE_INFINITY;
      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i]!;
        const d = Math.hypot(along - seed.x, distance - seed.y);
        if (d < d1) {
          d2 = d1;
          d1 = d;
        } else if (d < d2) {
          d2 = d;
        }
      }
      const edge = Math.max(0, 1 - (d2 - d1) / 0.035);
      return edge * Math.max(0, 1 - distance) ** 0.82;
    });
  },
};
