// A small real-time version of the plate treatment: shapes are rasterised onto a coarse grid,
// shaded per frame by an effect, and ordered-dithered onto a handful of tones whose darkest step
// is transparent, so the mark falls away into the page exactly like a plate does.

import { bayerMatrix } from './vendor/dither';
import { hexToRgb, northFoundryPalette } from './vendor/palette';

export type Ground = 'dark' | 'light';

/** 0 is the ink of the N (graphite on dark, near-black on light); 1 is the foundry blue. */
export type Layer = 0 | 1;

export const LEVELS = 5;

export const GROUNDS: Record<Ground, string> = { dark: '#0e1116', light: '#eef1f4' };

// Dark tones reuse the plate palette (minus its transparent floor). Light tones run the other way,
// pale to deep, so that "more signal" always means "more contrast against the ground".
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
  // ImageData is RGBA in memory, which reads as ABGR through a little-endian Uint32Array.
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

/** Ordered dither of a value in [0, 1] onto 0..LEVELS at a grid position; 0 is transparent. */
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
    if (!context) throw new Error('Canvas 2D is not available');
    this.context = context;
    this.image = context.createImageData(width, height);
    this.pixels = new Uint32Array(this.image.data.buffer);
  }

  /** `mono` paints the N in blue as well, for the single-colour variant. */
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
    if (level <= 0 || x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.pixels[y * this.width + x] = this.colours[layer][Math.min(LEVELS, level)] ?? 0;
  }

  plot(x: number, y: number, value: number, layer: Layer): void {
    this.plotLevel(x, y, ditherLevel(value, x, y), layer);
  }

  flush(): void {
    this.context.putImageData(this.image, 0, 0);
  }
}

/** A mark drawn in its own design units; `draw` fills only the parts that belong to `layer`. */
export interface Glyph {
  width: number;
  height: number;
  draw(context: CanvasRenderingContext2D, layer: Layer): void;
}

/** Per-cell coverage of a glyph on the grid, and which layer each cell belongs to. */
export interface Mask {
  width: number;
  height: number;
  cover: Float32Array;
  layer: Uint8Array;
}

/** Where a glyph lands in a grid: its scale and offset in cells, centred with `pad` around it. */
export function fit(glyph: Glyph, width: number, height: number, pad: number) {
  const scale = Math.min((width - pad * 2) / glyph.width, (height - pad * 2) / glyph.height);
  return {
    scale,
    offsetX: (width - glyph.width * scale) / 2,
    offsetY: (height - glyph.height * scale) / 2,
  };
}

// Flat colours for parts of a mark drawn crisp rather than dithered: the main text colour and
// the accent, as on the site.
const SOLID: Record<Ground, readonly [string, string]> = {
  dark: ['#d9dee5', '#6fa8ff'],
  light: ['#0e1116', '#2f6bc4'],
};

/**
 * Draws a glyph with flat fills at full device resolution, aligned to the dither grid:
 * `pixelsPerCell` converts grid cells to canvas pixels.
 */
export function drawSolid(
  canvas: HTMLCanvasElement,
  glyph: Glyph,
  placement: ReturnType<typeof fit>,
  pixelsPerCell: number,
  ground: Ground,
  mono: boolean,
): void {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is not available');
  const [ink, blue] = SOLID[ground];
  const k = placement.scale * pixelsPerCell;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(
    k,
    0,
    0,
    k,
    placement.offsetX * pixelsPerCell,
    placement.offsetY * pixelsPerCell,
  );
  for (const layer of [0, 1] as const) {
    context.fillStyle = layer === 0 && !mono ? ink : blue;
    glyph.draw(context, layer);
  }
}

/** Rasterises a glyph centred in the grid with `pad` cells around it, supersampled for coverage. */
export function rasterize(glyph: Glyph, width: number, height: number, pad: number, ss = 4): Mask {
  const canvas = document.createElement('canvas');
  canvas.width = width * ss;
  canvas.height = height * ss;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas 2D is not available');
  const { scale, offsetX, offsetY } = fit(glyph, width, height, pad);

  const coverage = ([0, 1] as const).map((layer) => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(scale * ss, 0, 0, scale * ss, offsetX * ss, offsetY * ss);
    context.fillStyle = '#fff';
    glyph.draw(context, layer);
    const alpha = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const out = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let sy = 0; sy < ss; sy++) {
          const row = (y * ss + sy) * canvas.width;
          for (let sx = 0; sx < ss; sx++) sum += alpha[(row + x * ss + sx) * 4 + 3] ?? 0;
        }
        out[y * width + x] = sum / (255 * ss * ss);
      }
    }
    return out;
  });

  const cover = new Float32Array(width * height);
  const layer = new Uint8Array(width * height);
  const [ink, blue] = coverage as [Float32Array, Float32Array];
  for (let i = 0; i < cover.length; i++) {
    const a = ink[i] ?? 0;
    const b = blue[i] ?? 0;
    cover[i] = Math.max(a, b);
    layer[i] = b >= a ? 1 : 0;
  }
  return { width, height, cover, layer };
}

/**
 * Chamfer distance, in cells, to the nearest cell on the other side of the glyph's edge:
 * inside the glyph when `inside`, outside it otherwise.
 */
export function distanceField(mask: Mask, inside: boolean): Float32Array {
  const { width, height, cover } = mask;
  const far = width + height;
  const d = new Float32Array(width * height);
  for (let i = 0; i < d.length; i++) d[i] = (cover[i] ?? 0) >= 0.5 === inside ? far : 0;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= width || y >= height ? (inside ? 0 : far) : (d[y * width + x] ?? far);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      d[i] = Math.min(
        d[i] ?? far,
        at(x - 1, y) + 1,
        at(x, y - 1) + 1,
        at(x - 1, y - 1) + 1.414,
        at(x + 1, y - 1) + 1.414,
      );
    }
  }
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      d[i] = Math.min(
        d[i] ?? far,
        at(x + 1, y) + 1,
        at(x, y + 1) + 1,
        at(x + 1, y + 1) + 1.414,
        at(x - 1, y + 1) + 1.414,
      );
    }
  }
  return d;
}

/** Stable pseudo-random value in [0, 1) for integer-ish coordinates. */
export function hash(x: number, y: number, z = 0): number {
  let h =
    Math.imul(Math.floor(x) | 0, 374761393) ^
    Math.imul(Math.floor(y) | 0, 668265263) ^
    Math.imul(Math.floor(z) | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth value noise in [0, 1]. */
export function noise(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fade = (t: number) => t * t * (3 - 2 * t);
  const u = fade(x - xi);
  const v = fade(y - yi);
  const w = fade(z - zi);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const plane = (zz: number) =>
    lerp(
      lerp(hash(xi, yi, zz), hash(xi + 1, yi, zz), u),
      lerp(hash(xi, yi + 1, zz), hash(xi + 1, yi + 1, zz), u),
      v,
    );
  return lerp(plane(zi), plane(zi + 1), w);
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
