/**
 * A plate palette: index 0 is always transparent, so the darkest tone of an image disappears
 * into whatever surface it is placed on; the remaining entries run from dim to bright.
 */
export interface PlatePalette {
  name: string;
  /**
   * Opaque colours, darkest first, as `#rrggbb`. Index 0 of the output is transparency.
   */
  tones: readonly string[];
}

/**
 * North Foundry's cool palette: graphite blue rising to the luminous accent. Keep it in step with
 * the `--nf-blue-*` and `--nf-graphite-*` primitives in `@north-foundry/ui`.
 */
export const northFoundryPalette: PlatePalette = {
  name: 'north-foundry',
  tones: ['#18222d', '#25384c', '#3b5d84', '#5b8fd6', '#8cc8ff', '#c9e4ff'],
};

export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) {
    throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
  }
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}
