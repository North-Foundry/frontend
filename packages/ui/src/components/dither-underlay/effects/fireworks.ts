import { hash, smoothstep } from '../../../lib/math';
import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const fireworks: DitherEffect = {
  /**
   * Expand circular bursts on the fixed dither grid. Random origins stay inside
   * separate zones so the explosions remain well spaced while growing and fading.
   */
  render(context) {
    const { image, phase, edge } = context;
    const vertical = edge === 'left' || edge === 'right';
    const length = vertical ? image.height : image.width;
    const depth = Math.max(1, vertical ? image.width : image.height);
    const span = edge ? 1 : 0.26;
    const count = Math.max(2, Math.min(5, Math.floor(length / 150)));
    /**
     * Stagger two emissions per zone and vary each origin within the loop.
     */
    const bursts = Array.from({ length: count }, (_, burst) => {
      const time = phase * 2 + hash(burst, 0, 97);
      const cycle = Math.floor(time) % 2;
      const age = (time % 1) / 0.7;
      const reach = Math.min(length * span / count * 0.22 / depth, 0.26);
      return {
        age,
        along: (edge ? 0 : 0.68) + (burst + 0.5 + (hash(burst, cycle, 101) - 0.5) * 0.3) / count * span,
        distance: (edge ? 0.28 : 0.05) + hash(burst, cycle, 103) * 0.3 + age * age * 0.08,
        radius: 0.025 + reach * (1 - (1 - age) ** 3),
        thickness: Math.min(0.025 + age * 0.035, reach * 0.3),
        fade: smoothstep(0, 0.04, age) * (1 - Math.min(1, age)) ** 1.3,
        core: 0.65 * (1 - age) ** 2,
        spokes: 8 + Math.floor(hash(burst, cycle, 107) * 5),
        rotation: hash(burst, cycle, 109) * tau,
      };
    }).filter(burst => burst.age < 1);
    /**
     * Combine a soft core and an expanding circular front before dithering the density.
     */
    renderField(context, (along, distance) => {
      let tone = 0;
      for (const burst of bursts) {
        const dx = (along - burst.along) * length / depth;
        const dy = distance - burst.distance;
        const radius = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const rays = 0.45 + 0.55 * (0.5 + 0.5 * Math.cos(angle * burst.spokes + burst.rotation)) ** 4;
        const front = Math.exp(-(((radius - burst.radius) / burst.thickness) ** 2));
        const core = Math.exp(-((radius / (burst.radius * 0.65)) ** 2)) * burst.core;
        tone = Math.max(tone, (front * rays + core) * burst.fade);
      }
      return tone;
    });
  },
};
