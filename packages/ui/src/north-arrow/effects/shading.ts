import { type Layer, type Mask, type Surface, clamp01, distanceField, smoothstep } from '../engine';

/**
 * Plates are lit from above: the top of a mark sits a little brighter than its foot.
 */
export function baseTone(mask: Mask, y: number): number {
  return 0.6 + 0.22 * (1 - y / mask.height);
}

/**
 * The lit relief behind `cast`: a height field raised from the glyph's inside distance,
 * `bevel` cells deep, lit by a light circling it, after a pour that fills it from the bottom.
 * A bevel as deep as the glyph is wide makes a pyramid, whose ridges run into the centre.
 */
export function castShading(mask: Mask, bevel: number | 'full'): (surface: Surface, t: number) => void {
  const { width, height, cover, layer } = mask;
  const inside = distanceField(mask, true);
  const relief =
    bevel === 'full'
      ? (() => {
          const deepest = Math.max(1, ...inside.filter((d) => d < width + height));
          return Float32Array.from(inside, (d) => clamp01(d / deepest));
        })()
      : Float32Array.from(inside, (d) => Math.sqrt(clamp01(d / bevel)));
  /**
   * Steeper faces for the pyramid, whose slope is spread over the whole glyph.
   */
  const slope =
    bevel === 'full'
      ? Math.max(1.6, Math.max(...inside.filter((d) => d < width + height)) * 0.35)
      : 1.6;
  const at = (x: number, y: number) =>
    relief[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))] ?? 0;
  const normals = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = (at(x + 1, y) - at(x - 1, y)) * slope;
      const gy = (at(x, y + 1) - at(x, y - 1)) * slope;
      const length = Math.hypot(gx, gy, 1);
      const i = (y * width + x) * 3;
      normals[i] = -gx / length;
      normals[i + 1] = -gy / length;
      normals[i + 2] = 1 / length;
    }
  }

  return (surface, t) => {
    const angle = t * 0.8 - 2.2;
    const lx = Math.cos(angle) * 0.62;
    const ly = Math.sin(angle) * 0.62 - 0.3;
    const lz = 0.72;
    const ll = Math.hypot(lx, ly, lz);
    /**
     * Half vector with a viewer straight above the mark.
     */
    const hx = lx / ll;
    const hy = ly / ll;
    const hz = lz / ll + 1;
    const hl = Math.hypot(hx, hy, hz);
    const pour = height * (1 - smoothstep(0, 1.5, t)) - 2;
    const sweep = ((t - 1.2) % 4.5) / 4.5;
    const band = sweep * 1.8 - 0.4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const c = cover[i] ?? 0;
        if (c <= 0.02 || y < pour) {
          continue;
        }
        const n = i * 3;
        const nx = normals[n] ?? 0;
        const ny = normals[n + 1] ?? 0;
        const nz = normals[n + 2] ?? 1;
        const diffuse = Math.max(0, (nx * lx + ny * ly + nz * lz) / ll);
        const specular = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl) ** 40;
        const u = (x + y * 0.6) / (width + height * 0.6);
        const glint = t > 1.2 ? Math.exp(-(((u - band) / 0.045) ** 2)) : 0;
        /**
         * The molten edge of the pour glows at full brightness.
         */
        const molten = Math.max(0, 1 - (y - pour) / 2.5);
        const value =
          0.3 + 0.36 * diffuse + 0.5 * specular + 0.55 * glint * (relief[i] ?? 0) + molten;
        surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
      }
    }
  };
}
