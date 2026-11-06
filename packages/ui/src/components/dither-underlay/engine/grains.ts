import { bayer } from './constants';
import type { DitherEdge } from '../types';

/**
 * Place one thresholded grain in the image alpha channel. A moving grain can pass its own
 * threshold so that it does not blink as it crosses the screen's Bayer cells.
 */
export function plotGrain(image: ImageData, along: number, distance: number, ink: number,
  edge?: DitherEdge, threshold?: number): void {
  const { width, height, data } = image;
  if (!edge) {
    along = 0.96 - distance * 0.42 + (along - 0.5) * 0.65;
    distance *= 0.72;
  }
  const vertical = edge === 'left' || edge === 'right';
  const x = Math.round((vertical ? edge === 'left' ? distance : 1 - distance : along) * (width - 1));
  const y = Math.round((vertical ? along : edge === 'top' ? distance : 1 - distance) * (height - 1));
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }
  if (ink > (threshold ?? bayer[(y % 8) * 8 + x % 8] ?? 0.5)) {
    data[(y * width + x) * 4 + 3] = 255;
  }
}
