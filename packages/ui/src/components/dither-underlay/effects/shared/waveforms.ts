import { tau } from '../../engine/constants';
import type { DitherWaveShape } from '../../types';

/**
 * Samples the selected waveform at a repeating cycle position, with softened sharp transitions.
 */
export function waveform(cycle: number, shape: DitherWaveShape): number {
  const t = cycle - Math.floor(cycle);
  if (shape === 'triangle') {
    return 1 - 4 * Math.abs(t - 0.5);
  }
  /**
   * A short cosine return keeps the saw's steep edge moving without a hard temporal jump.
   */
  if (shape === 'sawtooth') {
    return t < 0.9 ? -1 + 2 * t / 0.9 : Math.cos((t - 0.9) / 0.1 * Math.PI);
  }
  if (shape === 'square') {
    return Math.tanh(Math.sin(t * tau) * 6);
  }
  return Math.sin(t * tau);
}
