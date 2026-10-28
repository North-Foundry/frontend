import { bayerMatrix } from '../../../lib/dither';
import { hexToRgb, northFoundryPalette } from '../vendor/palette';

import type { Ground, Layer } from './types';

export const LEVELS = 5;

/**
 * Reference background colours for the dark and light grounds.
 */
export const GROUNDS: Record<Ground, string> = { dark: '#0e1116', light: '#eef1f4' };

/**
 * Dark tones reuse the plate palette (minus its transparent floor). Light tones run the other way,
 * pale to deep, so that "more signal" always means "more contrast against the ground".
 */
const TONES: Record<Ground, readonly [readonly string[], readonly string[]]> = {
  dark: [
    ['#2a3746', '#4f5f70', '#7d8c9c', '#b4bfcb', '#eef1f5'],
    northFoundryPalette.tones.slice(1),
  ],
  light: [
    ['#c3cad3', '#8d99a7', '#4f5f70', '#232c37', '#0e1116'],
    ['#c9e0fb', '#8cbcf5', '#5b8fd6', '#2f6bc4', '#1b4a92'],
  ],
};

const BAYER = bayerMatrix(3);

function packColour(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  /**
   * ImageData is RGBA in memory, which reads as ABGR through a little-endian Uint32Array.
   */
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/**
 * Ordered dither of a value in [0, 1] onto 0..LEVELS at a grid position; 0 is transparent.
 */
export function ditherLevel(value: number, x: number, y: number): number {
  const scaled = Math.min(1, Math.max(0, value)) * LEVELS;
  const base = Math.floor(scaled);
  const threshold = BAYER[(y & 7) * 8 + (x & 7)] ?? 0.5;
  return Math.min(LEVELS, base + (scaled - base > threshold ? 1 : 0));
}

export class Surface {
  readonly pixels: Uint32Array;
  private readonly context: CanvasRenderingContext2D;
  private readonly image: ImageData;
  private colours: [Uint32Array, Uint32Array] = [
    new Uint32Array(LEVELS + 1),
    new Uint32Array(LEVELS + 1),
  ];

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly width: number,
    readonly height: number,
  ) {
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D is not available');
    }
    this.context = context;
    this.image = context.createImageData(width, height);
    this.pixels = new Uint32Array(this.image.data.buffer);
  }

  /**
   * `mono` paints the N in blue as well, for the single-colour variant.
   */
  setPalette(ground: Ground, mono: boolean): void {
    const [ink, blue] = TONES[ground];
    const build = (tones: readonly string[]) =>
      Uint32Array.from([0, ...tones.map((tone) => packColour(tone))]);
    this.colours = [build(mono ? blue : ink), build(blue)];
  }

  clear(): void {
    this.pixels.fill(0);
  }

  plotLevel(x: number, y: number, level: number, layer: Layer): void {
    if (level <= 0 || x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    this.pixels[y * this.width + x] = this.colours[layer][Math.min(LEVELS, level)] ?? 0;
  }

  plot(x: number, y: number, value: number, layer: Layer): void {
    this.plotLevel(x, y, ditherLevel(value, x, y), layer);
  }

  flush(): void {
    this.context.putImageData(this.image, 0, 0);
  }
}
