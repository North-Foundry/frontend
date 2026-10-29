import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

export const chladni: DitherEffect = {
  /** Blends two resonance modes into fading nodal lines. */
  render(context) {
    const mix = (1 - Math.cos(context.phase * tau)) * 0.5;

    renderField(context, (x, y) => {
      const f1 = Math.cos(3 * Math.PI * x + 0.35) * Math.cos(5 * Math.PI * y)
        - 0.8 * Math.cos(5 * Math.PI * x + 1.1) * Math.cos(3 * Math.PI * y + 0.25);
      const f2 = Math.cos(2 * Math.PI * x - 0.4) * Math.cos(4 * Math.PI * y + 0.3)
        - 0.75 * Math.cos(4 * Math.PI * x + 0.9) * Math.cos(2 * Math.PI * y);
      const f = f1 * (1 - mix) + f2 * mix;
      const nodalLines = Math.exp(-10 * Math.abs(f));
      const envelope = Math.max(0, 1 - y / 0.95) ** 0.9;
      return (0.02 + nodalLines * 0.98) * envelope;
    });
  },
};
