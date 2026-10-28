import { tau } from '../engine/constants';
import { plotGrain } from '../engine/grains';
import type { DitherEffect } from './types';

export const branching: DitherEffect = {
  /**
   * Moves grains along a trunk that divides into branches and smaller twigs.
   */
  render(context) {
    const { image, phase, coverage, edge } = context;
    for (let i = 0; i < 1050; i++) {
      const distance = (i * 0.61803398875 + phase * 2) % 1;
      const branch = i % 8;
      const trunk = (branch % 2 ? 1 : -1) * 0.17 * distance ** 0.8;
      const split = (Math.floor(branch / 2) % 2 ? 1 : -1) * 0.14 * Math.max(0, distance - 0.2);
      const twig = (branch < 4 ? 1 : -1) * 0.2 * Math.max(0, distance - 0.5);
      const along = 0.5 + trunk + split + twig + 0.008 * Math.sin(i * 19.31)
        + 0.027 * Math.sin(distance * 13 - phase * tau + branch * 0.7);
      const fade = Math.sin(distance * Math.PI) ** 0.4 * (1 - distance) * coverage;
      plotGrain(image, along, distance, fade, edge);
    }
  },
};
