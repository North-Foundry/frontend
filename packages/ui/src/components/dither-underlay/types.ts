export type DitherEdge = 'top' | 'right' | 'bottom' | 'left';
export type DitherUnderlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | DitherEdge;
export type DitherUnderlayAnimation = 'none' | 'drift' | 'breathe' | 'expand' | 'contract' | 'ripple'
  | 'wave' | 'fire' | 'fire-down' | 'evaporate' | 'rays' | 'snowing' | 'fireworks'
  | 'chladni' | 'voronoi' | 'reaction-diffusion' | 'kuramoto' | 'interference' | 'vortex' | 'soliton' | 'moire' | 'phyllotaxis' | 'branching';
export type DitherWaveShape = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface FieldOptions {
  edge?: DitherEdge;
  waveShape?: DitherWaveShape;
  waveCount?: number;
  amplitude?: number;
  reactionThickness?: number;
  duration?: number;
}

export interface DitherUnderlayOptions {
  position?: DitherUnderlayPosition;
  animation?: DitherUnderlayAnimation;
  /**
   * Corner texture width in CSS pixels; the original 900:560 proportions are preserved.
   */
  size?: number;
  /**
   * Depth in CSS pixels for full-edge placements. Their length follows the host.
   */
  depth?: number;
  waveShape?: DitherWaveShape;
  /**
   * Number of wave periods along the edge.
   */
  waveCount?: number;
  /**
   * Wave height as a fraction of the texture depth, from 0 to 0.45.
   */
  amplitude?: number;
  /**
   * Relative thickness of reaction-diffusion shapes, from 0 (thin) to 1 (full).
   */
  reactionThickness?: number;
  /**
   * Size of each square grain in CSS pixels.
   */
  pixelSize?: number;
  /**
   * Any CSS canvas fill colour, including CSS custom properties.
   */
  color?: string;
  /**
   * Ink coverage, from 0 to 1.
   */
  intensity?: number;
  /**
   * Duration of one complete loop in seconds, or relative simulation speed for reaction diffusion and Kuramoto.
   */
  duration?: number;
  paused?: boolean;
}

export type DitherUnderlayProps = DitherUnderlayOptions & {
  /**
   * @deprecated Use position.
   */
  corner?: DitherUnderlayPosition;
};
