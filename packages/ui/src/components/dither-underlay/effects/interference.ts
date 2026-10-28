import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const interference: DitherEffect = {
  /**
   * Combines two moving wave fields into crossing bands that fade from the anchor.
   */
  render(context) {
    const { phase, waveCount } = context;
    renderField(context, (along, distance) => {
      const a = Math.sin(tau * (along * waveCount + distance * 2 - phase * 2));
      const b = Math.sin(tau * (-along * waveCount * 0.8 + distance * 3 - phase * 2));
      return Math.max(0, 0.27 + (a + b) * 0.32) * (1 - distance) ** 0.85;
    });
  },
};
