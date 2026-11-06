import { plotGrain } from '../engine/grains';
import type { DitherEffect } from './types';

export const phyllotaxis: DitherEffect = {
  /**
   * Arranges fading grains in expanding spirals using the botanical golden angle. Spirals
   * open wide and stay low, so most of each bloom sits near the anchoring edge. Each bloom lasts
   * a whole loop, turns slowly and eases in and out. Every grain keeps its own threshold, so it
   * glides between cells instead of blinking and only appears or vanishes as the bloom fades.
   */
  render(context) {
    const { image, phase, coverage, edge } = context;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const length = edge === 'left' || edge === 'right' ? image.height : image.width;
    const count = Math.max(240, Math.min(720, Math.round(length * 1.5)));
    for (let wave = 0; wave < 3; wave++) {
      const age = (phase + wave / 3) % 1;
      const fade = Math.sin(age * Math.PI) ** 1.6 * (1 - age * 0.4) * coverage * 0.8;
      for (let i = 0; i < count; i++) {
        const radius = Math.sqrt(i / count) * (0.12 + 0.48 * age);
        const angle = i * goldenAngle + age * 0.5;
        plotGrain(image, 0.5 + Math.cos(angle) * radius,
          0.02 + age * 0.35 + Math.sin(angle) * radius * 0.62, fade, edge, ((i + 0.5) * 0.618034) % 1);
      }
    }
  },
};
