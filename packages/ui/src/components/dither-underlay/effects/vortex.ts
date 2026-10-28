import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const vortex: DitherEffect = {
  /**
   * Warps repeating density bands into curved ribbons moving through the field.
   */
  render(context) {
    const { phase, amplitude, waveCount } = context;
    renderField(context, (along, distance) => {
      /**
       * Periodic domain warping bends the bands into curling ribbons.
       */
      const q = (distance - phase) * tau;
      const warp = along + amplitude * (0.68 * Math.sin(q + 2 * Math.sin(5 * along))
        + 0.34 * Math.sin(2 * q - 6 * along));
      const ribbon = Math.sin(waveCount * 5.6 * warp + 2.4 * Math.sin(q));
      const tone = 0.04 + 0.9 * Math.exp(-((ribbon / 0.4) ** 2));
      return tone * (1 - distance) ** 0.85;
    });
  },
};
