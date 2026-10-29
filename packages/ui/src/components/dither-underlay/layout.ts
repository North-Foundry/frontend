import type { DitherEdge, DitherUnderlayOptions } from './types';

/**
 * Defaults shared by the Vue wrapper and the framework-free mount.
 */
export const DITHER_UNDERLAY_DEFAULTS: Required<DitherUnderlayOptions> = Object.freeze({
  position: 'bottom-right',
  animation: 'none',
  size: 900,
  depth: 200,
  waveShape: 'sine',
  waveCount: 3,
  amplitude: 0.22,
  reactionThickness: 1,
  pixelSize: 1,
  color: '#5b8fd6',
  intensity: 0.9,
  duration: 12,
  paused: false,
});

/**
 * Corner textures retain their proportions; full sides follow the host's length.
 * Empty anchors clear styles left by a preceding placement.
 */
export function underlayLayout(
  options: Required<DitherUnderlayOptions>,
  bounds = { width: 1, height: 1 },
) {
  const position = options.position;
  const edge = position.includes('-') ? undefined : position as DitherEdge;
  const vertical = edge === 'left' || edge === 'right';
  const width = Math.max(1, Math.min(2400, options.size || 900));
  const depth = Math.max(1, Math.min(2400, options.depth || 200));
  const cell = Math.max(1, Math.min(8, options.pixelSize || 1));
  const dimensions = edge
    ? { width: vertical ? depth : bounds.width, height: vertical ? bounds.height : depth }
    : { width, height: width * 560 / 900 };
  const style = edge ? {
    width: vertical ? `${depth}px` : '100%',
    height: vertical ? '100%' : `${depth}px`,
    top: edge === 'bottom' ? '' : '0',
    bottom: edge === 'bottom' ? '0' : '',
    left: edge === 'right' ? '' : '0',
    right: edge === 'right' ? '0' : '',
    transform: '',
  } : {
    width: `${width}px`,
    height: `${width * 560 / 900}px`,
    top: position.startsWith('top') ? '0' : '',
    bottom: position.startsWith('bottom') ? '0' : '',
    left: position.endsWith('left') ? '0' : '',
    right: position.endsWith('right') ? '0' : '',
    transform: `scale(${position.endsWith('left') ? -1 : 1}, ${position.startsWith('top') ? -1 : 1})`,
  };
  return { edge, cell, dimensions, style };
}
