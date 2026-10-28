import { renderFire } from './shared/fire';
import type { DitherEffect } from './types';

export const evaporate: DitherEffect = {
  /**
   * Draws a quiet ink base with detached grains that drift away and fade.
   */
  render(context) {
    renderFire(context, 1, true);
  },
};
