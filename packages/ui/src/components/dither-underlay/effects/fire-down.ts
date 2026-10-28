import { renderFire } from './shared/fire';
import type { DitherEffect } from './types';

export const fireDown: DitherEffect = {
  /**
   * Reverses the shared fire flow so the ink and grains travel toward the anchor.
   */
  render(context) {
    renderFire(context, -1);
  },
};
