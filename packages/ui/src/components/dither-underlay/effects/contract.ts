import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const contract: DitherEffect = {
  /**
   * Contracts the texture from its largest footprint and returns over one loop.
   */
  render(context) {
    const swell = (1 - Math.cos(context.phase * Math.PI * 2)) / 2;
    renderField(context, undefined, { scale: 1.35 - swell * 0.7 });
  },
};
