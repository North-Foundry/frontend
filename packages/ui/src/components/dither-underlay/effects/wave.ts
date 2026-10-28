import { renderField } from '../engine/field';
import { waveform } from './shared/waveforms';
import type { DitherEffect } from './types';

export const wave: DitherEffect = {
  /**
   * Draws a travelling density wave using the selected waveform and wave controls.
   */
  render(context) {
    const { phase, amplitude, waveCount, waveShape } = context;
    renderField(context, (along, distance) => {
      const height = 0.62 + amplitude * waveform(along * waveCount - phase, waveShape);
      return Math.max(0, 1 - distance / height) ** 1.25;
    });
  },
};
