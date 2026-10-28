import { hash } from '../../../../lib/math';
import type { EffectContext } from '../types';

/**
 * Projects seeded grains along the selected side, fading each grain over its lifetime.
 */
export function drawFlowingGrains(context: EffectContext, direction: 1 | -1 = 1): void {
  const { image, phase, coverage } = context;
  const edge = context.edge ?? 'bottom';
  const { width, height, data } = image;
  const vertical = edge === 'left' || edge === 'right';
  const length = vertical ? height : width;
  const count = Math.min(220, Math.ceil(length * 0.7));
  for (let slot = 0; slot < count; slot++) {
    const seed = hash(slot, 4, 41);
    const age = ((direction === -1 ? -phase : phase) * 3 + seed + 3) % 1;
    const fade = Math.sin(age * Math.PI) * (1 - age) * coverage;
    if (hash(slot, 2, 41) > fade) {
      continue;
    }
    const along = hash(slot, 1, 41) + Math.sin(age * 4 + slot) * age * 0.025;
    const distance = 0.12 + age * 0.86;
    const px = vertical ? (edge === 'left' ? distance : 1 - distance) * (width - 1) : along * (width - 1);
    const py = vertical ? along * (height - 1) : (edge === 'top' ? distance : 1 - distance) * (height - 1);
    const x = Math.round(px), y = Math.round(py);
    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }
    /**
     * Keep new corner motions inside the original corner's footprint.
     */
    if (!context.edge && along < 0.5) {
      continue;
    }
    data[(y * width + x) * 4 + 3] = 255;
  }
}
