import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const moire: DitherEffect = {
  /**
   * Overlays offset repeating patterns to produce moving interference fringes.
   */
  render(context) {
    const { phase, waveCount } = context;
    renderField(context, (along, distance) => {
      const a = Math.sin(tau * (along * waveCount * 1.7 + distance * 5 - phase * 2));
      const b = Math.sin(tau * (along * waveCount * 1.52 + distance * 6 - phase * 2));
      const tone = 0.1 + 0.9 * ((a * b + 1) / 2) ** 3;
      return tone * (1 - distance) ** 0.85;
    });
  },
};
