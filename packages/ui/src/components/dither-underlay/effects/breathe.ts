import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const breathe: DitherEffect = {
  /**
   * Gently grows and shrinks the texture around its original scale.
   */
  render(context) {
    const scale = 1 + Math.sin(context.phase * Math.PI * 2) * 0.2;
    renderField(context, undefined, { scale });
  },
};
