import { bayer } from '../engine/constants';
import { renderField } from '../engine/field';
import { hash } from '../../../lib/math';
import type { DitherEffect } from './types';

export const rays: DitherEffect = {
  /**
   * Draws a faint base and staggered rays with bright heads and granular tails.
   */
  render(context) {
    renderField(context, (_along, distance) => Math.max(0, 1 - distance / 0.28) ** 1.6 * 0.18);
    const { image, phase, coverage, edge } = context;
    const { width, height, data } = image;
    const vertical = edge === 'left' || edge === 'right';
    const length = vertical ? height : width;
    const depth = vertical ? width : height;
    const count = edge ? Math.max(8, Math.min(28, Math.round(length / 18))) : 12;
    for (let ray = 0; ray < count; ray++) {
      const age = (phase * 3 + hash(ray, 1, 73)) % 1;
      const fade = Math.sin(age * Math.PI) ** 0.6;
      const origin = edge ? (0.05 + hash(ray, 2, 73) * 0.9) * (length - 1)
        : (0.95 + hash(ray, 2, 73) * 0.045) * (length - 1);
      const drift = (edge ? hash(ray, 3, 73) - 0.5 : -0.15 - hash(ray, 3, 73) * 0.65) * depth;
      const head = (0.02 + age * 0.94) * (depth - 1);
      const tail = Math.max(0, head - depth * (0.12 + hash(ray, 4, 73) * 0.22));
      const steps = Math.max(1, Math.ceil(Math.hypot(head - tail, drift * (head - tail) / depth) * 1.5));
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const distance = tail + (head - tail) * t;
        const along = origin + drift * distance / depth;
        const brightness = fade * (0.15 + 0.85 * t ** 1.7) * coverage;
        /**
         * A crisp core and sparse side grains; the Bayer lattice remains fixed while shots pass.
         */
        for (let side = -1; side <= 1; side++) {
          const a = along + side;
          const x = Math.round(vertical ? (edge === 'left' ? distance : width - 1 - distance) : a);
          const y = Math.round(vertical ? a : edge === 'top' ? distance : height - 1 - distance);
          if (x < 0 || x >= width || y < 0 || y >= height) {
            continue;
          }
          const threshold = bayer[(y % 8) * 8 + x % 8] ?? 0.5;
          if (brightness * (side === 0 ? 1 : 0.3) > threshold) {
            data[(y * width + x) * 4 + 3] = 255;
          }
        }
      }
    }
  },
};
