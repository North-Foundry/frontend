import type { DitherEdge, DitherWaveShape } from '../types';

/**
 * One frame with normalized time, coverage and wave controls.
 * Browser lifecycle and canvas colour remain outside individual effects.
 */
export interface EffectContext {
  image: ImageData;
  phase: number;
  coverage: number;
  edge?: DitherEdge;
  waveShape: DitherWaveShape;
  waveCount: number;
  amplitude: number;
}

export interface DitherEffect {
  /**
   * Draws one effect frame into the prepared image using normalized controls.
   */
  render(context: EffectContext): void;
}
