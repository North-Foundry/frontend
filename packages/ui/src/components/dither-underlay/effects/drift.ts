import { tau } from '../engine/constants';
import { renderField, type DensityField } from '../engine/field';
import type { DitherEffect } from './types';

export const drift: DitherEffect = {
  /**
   * Shifts the corner footprint or sends a slow lateral current along a full side.
   */
  render(context) {
    const { phase } = context;
    const wave = Math.sin(phase * Math.PI * 2);
    const swell = (1 - Math.cos(phase * Math.PI * 2)) / 2;
    /**
     * Samples the full-side fade with a travelling lateral displacement.
     */
    const field: DensityField = (along, distance) => {
      const drift = Math.sin(along * tau - phase * tau) * 0.08;
      return Math.max(0, 1 - (distance + drift) / 0.85) ** 1.6;
    };
    renderField(context, context.edge ? field : undefined, { offsetX: swell * 0.16, offsetY: wave * 0.07 });
  },
};
