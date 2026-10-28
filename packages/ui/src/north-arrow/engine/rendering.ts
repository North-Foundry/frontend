import type { Glyph, Ground, Mask } from './types';

/**
 * Where a glyph lands in a grid: its scale and offset in cells, centred with `pad` around it.
 */
export function fit(glyph: Glyph, width: number, height: number, pad: number) {
  const scale = Math.min((width - pad * 2) / glyph.width, (height - pad * 2) / glyph.height);
  return {
    scale,
    offsetX: (width - glyph.width * scale) / 2,
    offsetY: (height - glyph.height * scale) / 2,
  };
}

/**
 * Flat colours for parts of a mark drawn crisp rather than dithered: the main text colour and
 * the accent, as on the site.
 */
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
  if (!context) {
    throw new Error('Canvas 2D is not available');
  }
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

/**
 * Rasterises a glyph centred in the grid with `pad` cells around it, supersampled for coverage.
 */
export function rasterize(glyph: Glyph, width: number, height: number, pad: number, ss = 4): Mask {
  const canvas = document.createElement('canvas');
  canvas.width = width * ss;
  canvas.height = height * ss;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas 2D is not available');
  }
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
