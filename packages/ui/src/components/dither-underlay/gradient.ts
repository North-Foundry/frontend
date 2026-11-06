import { bayer } from './engine/constants';

/**
 * Fixed gradient grounds; their colours are defined in DitherUnderlay.vue.
 */
export type DitherGradient =
  | 'graphite'
  | 'slate'
  | 'signal'
  | 'horizon'
  | 'aurora'
  | 'eclipse'
  | 'steel'
  | 'polar'
  | 'paper';

export const DITHER_GRADIENT_LEVELS = 16;

const size = Math.sqrt(bayer.length);

/**
 * The 8×8 threshold map as an SVG image, each cell a grey equal to its Bayer threshold.
 */
const thresholdImage = (() => {
  const cells: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const grey = Math.round((bayer[y * size + x] ?? 0.5) * 255);
      cells.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${grey},${grey},${grey})"/>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${cells.join('')}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
})();

/**
 * SVG filter parameters for an ordered dither of the gradient. The source is scaled by
 * (n - 1) / n and the threshold by 1 / n, so a discrete table of n entries takes
 * floor(c · (n - 1) + t) for every colour channel.
 */
export function gradientFilter(levels: number, pixelSize: number) {
  const count = Math.round(Math.min(64, Math.max(2, levels || DITHER_GRADIENT_LEVELS)));
  const cell = Math.max(1, Math.min(8, pixelSize || 1));
  const table = Array.from({ length: count }, (_, index) => (index / (count - 1)).toFixed(4)).join(' ');
  return {
    image: thresholdImage,
    tile: size * cell,
    source: (count - 1) / count,
    threshold: 1 / count,
    table,
  };
}
