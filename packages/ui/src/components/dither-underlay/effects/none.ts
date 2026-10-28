import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const none: DitherEffect = {
  /**
   * Draws the static reference texture for the selected corner or side.
   */
  render(context) {
    renderField(context);
  },
};
