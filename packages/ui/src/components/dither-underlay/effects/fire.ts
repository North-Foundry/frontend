import { renderFire } from './shared/fire';
import type { DitherEffect } from './types';

export const fire: DitherEffect = {
  /**
   * Draws turbulent ink and rising grains with the shared forward fire calculation.
   */
  render(context) {
    renderFire(context);
  },
};
