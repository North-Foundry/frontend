import { type Layer, hash, smoothstep } from '../engine';

import { baseTone } from './shading';
import type { EffectDefinition } from './types';

/**
 * Scanning — a scanning beam reveals the mark line by line, a glint crosses it once, then the
 * ordered dither erodes it pattern by pattern until the beam comes round again.
 */
export const scan: EffectDefinition = {
  rest: 3,
  create(surface, mask) {
    const { width, height, cover, layer } = mask;
    const cycle = 7;
    return {
      frame(time) {
        surface.clear();
        const t = time % cycle;
        const beam = (t / 1.7) * (height + 12) - 6;
        const fade = 1 - smoothstep(5, 6.3, t);
        const glint = (t - 3) / 0.9;
        for (let y = 0; y < height; y++) {
          const distance = y - beam;
          const lit = distance < 0;
          const glow = Math.exp(-((distance / 2.2) ** 2));
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            const u = (x - y * 0.8) / width;
            const shine =
              glint > -0.5 && glint < 1.5 ? Math.exp(-(((u - glint) / 0.06) ** 2)) * 0.5 : 0;
            if (c > 0.02) {
              const value = (lit ? baseTone(mask, y) * fade + shine : 0) + glow;
              surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
            } else if (glow > 0.3 && hash(x, y, Math.floor(time * 20)) < 0.08 * glow) {
              surface.plotLevel(x, y, 1, 1);
            }
          }
        }
        surface.flush();
      },
    };
  },
};
