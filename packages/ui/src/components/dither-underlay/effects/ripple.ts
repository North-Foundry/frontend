import { tau } from '../engine/constants';
import { renderField, type DensityField } from '../engine/field';
import type { DitherEffect } from './types';

export const ripple: DitherEffect = {
  /**
   * Moves concentric density bands through the corner or away from a full side.
   */
  render(context) {
    /**
     * Samples the moving concentric band at the given distance from the anchor.
     */
    const modulate = (distance: number) => 0.7 + 0.3 * Math.cos(distance * 18 - context.phase * tau);
    /**
     * Applies the ripple bands to the full-side density fade.
     */
    const field: DensityField = (_, distance) => Math.max(0, 1 - distance / 0.85) ** 1.6 * modulate(distance);
    renderField(context, context.edge ? field : undefined, { modulate });
  },
};
