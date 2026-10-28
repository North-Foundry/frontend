import { effects } from './effects';
import type { DitherUnderlayAnimation, FieldOptions } from './types';

/**
 * Prepare a reusable alpha mask and dispatch one complete frame to its effect.
 */
export function renderDither(
  image: ImageData,
  intensity: number,
  animation: DitherUnderlayAnimation = 'none',
  phase = 0,
  options: FieldOptions = {},
): void {
  phase -= Math.floor(phase);
  const coverage = Math.max(0, Math.min(1, intensity));
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = image.data[i + 1] = image.data[i + 2] = 255;
    image.data[i + 3] = 0;
  }
  if (!(coverage > 0)) {
    return;
  }
  effects[animation].render({
    image,
    phase,
    coverage,
    edge: options.edge,
    waveShape: options.waveShape ?? 'sine',
    waveCount: Math.max(0.25, Math.min(16, options.waveCount ?? 3)),
    amplitude: Math.max(0, Math.min(0.45, options.amplitude ?? 0.22)),
  });
}
