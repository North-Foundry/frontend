import { hash, smoothstep } from '../../../lib/math';
import { bayer, tau } from '../engine/constants';
import type { DitherEffect } from './types';

export const snowing: DitherEffect = {
  /**
   * Move seeded flakes away from the anchor, keeping their local dither masks fixed
   * while fading each whole flake smoothly.
   */
  render(context) {
    const { image, phase, coverage, edge } = context;
    const vertical = edge === 'left' || edge === 'right';
    const length = vertical ? image.height : image.width;
    const { width, height, data } = image;
    const count = Math.max(24, Math.min(360, Math.ceil(length * 0.65)));
    for (let slot = 0; slot < count; slot++) {
      const seed = hash(slot, 0, 73);
      const speed = hash(slot, 1, 73) > 0.7 ? 2 : 1;
      const sway = 0.01 + hash(slot, 4, 73) * 0.02;
      const age = (phase * speed + seed) % 1;
      let along = hash(slot, 2, 73) + Math.sin(age * tau + seed * tau) * sway;
      let distance = age;
      if (!edge) {
        along = 0.96 - distance * 0.42 + (along - 0.5) * 0.65;
        distance *= 0.72;
      }
      const px = Math.round((vertical ? edge === 'left' ? distance : 1 - distance : along) * (width - 1));
      const py = Math.round((vertical ? along : edge === 'top' ? distance : 1 - distance) * (height - 1));
      const fade = smoothstep(0, 0.06, age) * (1 - age) ** 1.5 * coverage;
      const alpha = Math.round(fade * 255);
      const radius = hash(slot, 3, 73) > 0.8 ? 2 : 1;
      for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        for (let offsetX = -radius; offsetX <= radius; offsetX++) {
          const tone = Math.max(0, 1 - Math.hypot(offsetX, offsetY) / (radius + 0.5));
          const threshold = bayer[((offsetY + 8 + slot) % 8) * 8 + (offsetX + 8 + slot * 3) % 8] ?? 0.5;
          const x = px + offsetX, y = py + offsetY;
          if (tone <= threshold || x < 0 || x >= width || y < 0 || y >= height) {
            continue;
          }
          const index = (y * width + x) * 4 + 3;
          data[index] = Math.max(data[index]!, alpha);
        }
      }
    }
  },
};
