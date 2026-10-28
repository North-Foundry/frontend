import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const expand: DitherEffect = {
  /**
   * Expands the texture from its smallest footprint and returns over one loop.
   */
  render(context) {
    const swell = (1 - Math.cos(context.phase * Math.PI * 2)) / 2;
    renderField(context, undefined, { scale: 0.65 + swell * 0.7 });
  },
};
