/** A single-channel image with values in [0, 1], row-major. */
export interface LuminanceImage {
  width: number;
  height: number;
  data: Float32Array;
}

export interface ToneOptions {
  /** Luminance mapped to 0; everything darker becomes transparent. */
  black?: number;
  /** Luminance mapped to 1. */
  white?: number;
  /** Exponent applied after levels; above 1 darkens the mid-tones. */
  gamma?: number;
}

/** Levels and gamma, applied before dithering to place the image's tones on the palette. */
export function tone(image: LuminanceImage, options: ToneOptions = {}): LuminanceImage {
  const { black = 0, white = 1, gamma = 1 } = options;
  const span = Math.max(1e-6, white - black);
  const data = new Float32Array(image.data.length);
  for (let i = 0; i < data.length; i++) {
    const level = Math.min(1, Math.max(0, ((image.data[i] ?? 0) - black) / span));
    data[i] = level ** gamma;
  }
  return { width: image.width, height: image.height, data };
}

/** Recursively built Bayer matrix of size 2^order, normalised to thresholds in (0, 1). */
export function bayerMatrix(order: number): Float32Array {
  let size = 1;
  let matrix = [0];
  for (let step = 0; step < order; step++) {
    const next = new Array<number>(size * 2 * size * 2);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const value = (matrix[y * size + x] ?? 0) * 4;
        next[y * size * 2 + x] = value;
        next[y * size * 2 + x + size] = value + 2;
        next[(y + size) * size * 2 + x] = value + 3;
        next[(y + size) * size * 2 + x + size] = value + 1;
      }
    }
    matrix = next;
    size *= 2;
  }
  const cells = size * size;
  return Float32Array.from(matrix, (value) => (value + 0.5) / cells);
}

/**
 * Ordered dithering onto `levels` output indices. Index 0 is reserved for transparency; a pixel
 * becomes a tone only when its luminance clears the threshold, so dark areas fall away cleanly.
 * Ordered (Bayer) dithering is used rather than error diffusion because its regular texture reads
 * as print and stays stable when an image is re-rendered.
 */
export function orderedDither(image: LuminanceImage, levels: number, order = 3): Uint8Array {
  if (levels < 2) throw new Error('Dithering needs at least two levels');
  const matrix = bayerMatrix(order);
  const size = 2 ** order;
  const out = new Uint8Array(image.width * image.height);
  const steps = levels - 1;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const index = y * image.width + x;
      const scaled = Math.min(1, Math.max(0, image.data[index] ?? 0)) * steps;
      const base = Math.floor(scaled);
      const threshold = matrix[(y % size) * size + (x % size)] ?? 0.5;
      out[index] = Math.min(steps, base + (scaled - base > threshold ? 1 : 0));
    }
  }
  return out;
}
