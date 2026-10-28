import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const soliton: DitherEffect = {
  /**
   * Sends isolated, smoothly looping density pulses away from the anchor.
   */
  render(context) {
    const { phase, amplitude } = context;
    renderField(context, (along, distance) => {
      /**
       * Periodic sech² profiles give isolated pulses with a smooth loop boundary.
       */
      const q = (distance - phase) * 2 - 0.25 - amplitude * 0.5 * Math.sin(along * tau);
      const tone = 1 / Math.cosh(Math.sin(Math.PI * q) * 8) ** 2
        + 0.4 / Math.cosh(Math.sin(Math.PI * (q + 0.5)) * 10) ** 2;
      return tone * (1 - distance) ** 0.85;
    });
  },
};
