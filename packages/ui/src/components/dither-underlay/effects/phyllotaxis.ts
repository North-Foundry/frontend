import { plotGrain } from '../engine/grains';
import type { DitherEffect } from './types';

export const phyllotaxis: DitherEffect = {
  /**
   * Arranges fading grains in expanding spirals using the botanical golden angle.
   */
  render(context) {
    const { image, phase, coverage, edge } = context;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const length = edge === 'left' || edge === 'right' ? image.height : image.width;
    const count = Math.max(160, Math.min(360, Math.round(length)));
    for (let wave = 0; wave < 3; wave++) {
      const age = (phase * 2 + wave / 3) % 1;
      const fade = Math.sin(age * Math.PI) ** 0.6 * (1 - age * 0.6) * coverage;
      for (let i = 0; i < count; i++) {
        const radius = Math.sqrt(i / count) * (0.085 + 0.3 * age);
        const angle = i * goldenAngle + age * 1.3;
        plotGrain(image, 0.5 + Math.cos(angle) * radius,
          age + Math.sin(angle) * radius * 0.62 - 0.08, fade, edge);
      }
    }
  },
};
