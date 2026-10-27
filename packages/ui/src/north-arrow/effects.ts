// Effects shade a rasterised mark frame by frame. Each one draws into the surface at time `t`
// (seconds since it started) and must render a complete, legible mark at its `rest` time, which
// is what reduced-motion visitors and still captures get.

import {
  type Layer,
  type Mask,
  type Surface,
  LEVELS,
  clamp01,
  distanceField,
  ditherLevel,
  hash,
  noise,
  smoothstep,
} from './engine';

export interface Effect {
  frame(t: number, dt: number): void;
  /** Pointer position in grid cells, or null when it leaves the canvas. */
  pointer?(position: { x: number; y: number } | null): void;
  /** A click at a grid position. */
  poke?(x: number, y: number): void;
}

export interface EffectDefinition {
  /** A time at which the mark is fully formed and still. */
  rest: number;
  create(surface: Surface, mask: Mask): Effect;
}

/** Plates are lit from above: the top of a mark sits a little brighter than its foot. */
function baseTone(mask: Mask, y: number): number {
  return 0.6 + 0.22 * (1 - y / mask.height);
}

interface Particle {
  homeX: number;
  homeY: number;
  level: number;
  layer: Layer;
  seed: number;
}

/** Freezes the mark's dithered rest state into one particle per lit cell. */
function particlesOf(mask: Mask): Particle[] {
  const particles: Particle[] = [];
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      const i = y * mask.width + x;
      const level = ditherLevel((mask.cover[i] ?? 0) * baseTone(mask, y), x, y);
      if (level > 0) {
        particles.push({
          homeX: x,
          homeY: y,
          level,
          layer: (mask.layer[i] ?? 1) as Layer,
          seed: hash(x, y, 7),
        });
      }
    }
  }
  return particles;
}

/**
 * Fusione — the mark is cast: metal fills it from the bottom, then it is read as an extruded,
 * bevelled object under a light that circles it, with a glint crossing the faces.
 */
export const cast: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const shade = castShading(
      mask,
      Math.max(2, Math.round(Math.min(mask.width, mask.height) * 0.035)),
    );
    return {
      frame(t) {
        surface.clear();
        shade(surface, t);
        surface.flush();
      },
    };
  },
};

/**
 * The lit relief behind `cast`: a height field raised from the glyph's inside distance,
 * `bevel` cells deep, lit by a light circling it, after a pour that fills it from the bottom.
 * A bevel as deep as the glyph is wide makes a pyramid, whose ridges run into the centre.
 */
function castShading(mask: Mask, bevel: number | 'full'): (surface: Surface, t: number) => void {
  const { width, height, cover, layer } = mask;
  const inside = distanceField(mask, true);
  const relief =
    bevel === 'full'
      ? (() => {
          const deepest = Math.max(1, ...inside.filter((d) => d < width + height));
          return Float32Array.from(inside, (d) => clamp01(d / deepest));
        })()
      : Float32Array.from(inside, (d) => Math.sqrt(clamp01(d / bevel)));
  // Steeper faces for the pyramid, whose slope is spread over the whole glyph.
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
    // Half vector with a viewer straight above the mark.
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
        if (c <= 0.02 || y < pour) continue;
        const n = i * 3;
        const nx = normals[n] ?? 0;
        const ny = normals[n + 1] ?? 0;
        const nz = normals[n + 2] ?? 1;
        const diffuse = Math.max(0, (nx * lx + ny * ly + nz * lz) / ll);
        const specular = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl) ** 40;
        const u = (x + y * 0.6) / (width + height * 0.6);
        const glint = t > 1.2 ? Math.exp(-(((u - band) / 0.045) ** 2)) : 0;
        // The molten edge of the pour glows at full brightness.
        const molten = Math.max(0, 1 - (y - pour) / 2.5);
        const value =
          0.3 + 0.36 * diffuse + 0.5 * specular + 0.55 * glint * (relief[i] ?? 0) + molten;
        surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
      }
    }
  };
}

/**
 * Polvere — dust gathers from the left into the mark, the mark holds and twinkles, then it
 * erodes into dust carried off to the right, and gathers again.
 */
export const dust: EffectDefinition = {
  rest: 3,
  create(surface, mask) {
    const particles = particlesOf(mask);
    const { width, height } = mask;
    const cycle = 8;

    function drift(p: Particle, s: number, direction: number): [number, number] {
      const r1 = hash(p.homeX, p.homeY, 1);
      const r2 = hash(p.homeX, p.homeY, 2);
      const r3 = hash(p.homeX, p.homeY, 3);
      const dx = direction * (s * (width * 0.05 + width * 0.12 * r1) + s * s * width * 0.08 * r2);
      const dy =
        -s * height * (0.04 + 0.12 * r3) + Math.sin(s * 3.2 + p.seed * 6.28) * s * height * 0.05;
      return [dx, dy];
    }

    return {
      frame(time) {
        surface.clear();
        const t = time % cycle;
        for (const p of particles) {
          const along = p.homeX / width;
          const arrival = 0.2 + 1.3 * along + 0.35 * p.seed;
          const departure = 4.6 + 1.7 * along + 0.4 * hash(p.homeX, p.homeY, 4);
          let x = p.homeX;
          let y = p.homeY;
          let level = p.level;
          if (t < arrival || t > departure) {
            const gathering = t < arrival;
            const s = gathering ? arrival - t : t - departure;
            const [dx, dy] = drift(p, s, gathering ? -1 : 1);
            x += dx;
            y += gathering ? -dy : dy;
            // Grains flash as they break away or land, then dim as they travel.
            level = s < 0.12 ? LEVELS : p.level - Math.floor(s * 2.2 + hash(p.homeX, p.homeY, 5));
          } else if (hash(p.homeX, p.homeY, Math.floor(t * 7)) < 0.012) {
            level = LEVELS;
          }
          surface.plotLevel(Math.round(x), Math.round(y), level, p.layer);
        }
        surface.flush();
      },
    };
  },
};

/**
 * Segnale — the mark breathes under slow noise, single cells catch the light and spark, and a
 * faint haze of dust hangs around its edges.
 */
export const signal: EffectDefinition = {
  rest: 2.2,
  create(surface, mask) {
    const { width, height, cover, layer } = mask;
    const outside = distanceField(mask, false);
    const halo = Math.max(4, Math.round(width * 0.05));
    return {
      frame(t) {
        surface.clear();
        const reveal = smoothstep(0, 1.4, t);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            const seed = hash(x, y, 11);
            if (c > 0.02) {
              let value =
                c *
                (0.5 + 0.38 * noise(x * 0.07, y * 0.07, t * 0.45)) *
                (0.72 + 0.28 * baseTone(mask, y));
              const tick = t * 3 + seed * 97;
              if (hash(x, y, Math.floor(tick)) < 0.014) value = 1 - (tick % 1) * 0.6;
              value *= clamp01(reveal * 1.6 - seed * 0.6);
              surface.plot(x, y, value, (layer[i] ?? 1) as Layer);
            } else {
              const d = outside[i] ?? halo;
              if (d > halo) continue;
              const chance = 0.035 * (1 - d / halo) * reveal;
              if (hash(x, y, Math.floor(t * 2.5 + seed * 13)) < chance) {
                surface.plotLevel(x, y, d < 2 ? 2 : 1, 1);
              }
            }
          }
        }
        surface.flush();
      },
    };
  },
};

/**
 * Scansione — a scanning beam reveals the mark line by line, a glint crosses it once, then the
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

/**
 * Magnete — every grain is a particle on a spring. The pointer pushes grains aside, a click
 * blows them apart, and they settle back into the mark, glittering while they move.
 */
export const magnet: EffectDefinition = {
  rest: 4,
  create(surface, mask) {
    const { width, height } = mask;
    const homes = particlesOf(mask);
    const state = homes.map((p) => ({
      x: hash(p.homeX, p.homeY, 21) * width,
      y: hash(p.homeX, p.homeY, 22) * height,
      vx: 0,
      vy: 0,
    }));
    let pointer: { x: number; y: number } | null = null;
    const radius = Math.max(8, width * 0.09);

    return {
      pointer(position) {
        pointer = position;
      },
      poke(x, y) {
        for (const s of state) {
          const dx = s.x - x;
          const dy = s.y - y;
          const d = Math.hypot(dx, dy) + 0.5;
          const push = Math.max(0, 1 - d / (radius * 3)) * width * 1.6;
          s.vx += (dx / d) * push * (0.5 + Math.random());
          s.vy += (dy / d) * push * (0.5 + Math.random());
        }
      },
      frame(t, dt) {
        surface.clear();
        const step = Math.min(dt, 1 / 30);
        // Settled particles snap home for the reduced-motion still.
        const settled = dt === 0;
        homes.forEach((p, index) => {
          const s = state[index];
          if (!s) return;
          if (settled) {
            s.x = p.homeX;
            s.y = p.homeY;
          } else {
            let ax = (p.homeX - s.x) * 38 - s.vx * 7.5;
            let ay = (p.homeY - s.y) * 38 - s.vy * 7.5;
            if (pointer) {
              const dx = s.x - pointer.x;
              const dy = s.y - pointer.y;
              const d = Math.hypot(dx, dy) + 0.3;
              const force = Math.max(0, 1 - d / radius) ** 2 * width * 40;
              ax += (dx / d) * force;
              ay += (dy / d) * force;
            }
            s.vx += ax * step;
            s.vy += ay * step;
            s.x += s.vx * step;
            s.y += s.vy * step;
          }
          const speed = Math.hypot(s.vx, s.vy);
          let level = p.level;
          if (speed > width * 0.25) level = LEVELS;
          else if (noise(p.homeX * 0.4, p.homeY * 0.4, t * 1.6) > 0.78)
            level = Math.min(LEVELS, level + 1);
          surface.plotLevel(Math.round(s.x), Math.round(s.y), level, p.layer);
        });
        surface.flush();
      },
    };
  },
};

/**
 * Firma — the lockup for the site header: the wordmark is written left to right by a dither
 * front, then a slow glint travels along it now and then.
 */
export const signature: EffectDefinition = {
  rest: 2.4,
  create(surface, mask) {
    const { width, height, cover, layer } = mask;
    return {
      frame(t) {
        surface.clear();
        const front = t * 0.9;
        const glint = ((t - 2) % 6) / 1.6;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            if (c <= 0.02) continue;
            const u = x / width;
            const written = clamp01((front - u) * 5);
            const shine =
              t > 2 ? Math.exp(-(((u - glint + y / height / 8) / 0.035) ** 2)) * 0.45 : 0;
            const edge = written > 0 && written < 1 ? 0.5 * (1 - written) : 0;
            const value = (0.82 + shine) * written + edge;
            surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
          }
        }
        surface.flush();
      },
    };
  },
};

/**
 * Faro — for marks where only the needle is dithered. The needle charges from its base up to
 * the tip, then keeps breathing: a pulse climbs it every few seconds, single cells spark, and a
 * thin stream of grains rises from the tip and fades, like a signal sent north.
 */
export const beacon: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const { width, cover, layer } = mask;
    const { top, bottom } = extent(mask);
    const span = Math.max(1, bottom - top);
    const grains = risingGrains(mask, 0, 0.09);

    return {
      frame(t) {
        surface.clear();
        const charge = top + span * (1 - smoothstep(0, 1.1, t)) * 1.2 - 1;
        const pulse = ((t - 1.1) % 2.6) / 1.1;
        for (let y = top; y <= bottom; y++) {
          // 0 at the tip, 1 at the base.
          const along = (y - top) / span;
          const climbing =
            t > 1.1 && pulse < 1.2 ? Math.exp(-(((1 - along - pulse) / 0.12) ** 2)) : 0;
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const c = cover[i] ?? 0;
            if (c <= 0.02 || y < charge) continue;
            const seed = hash(x, y, 31);
            let value =
              (0.42 + 0.5 * (1 - along)) * (0.8 + 0.25 * noise(x * 0.2, y * 0.2, t * 0.7));
            value += climbing * 0.55;
            // The charging front glows.
            value += Math.max(0, 1 - (y - charge) / 2);
            const tick = t * 3 + seed * 97;
            if (hash(x, y, Math.floor(tick)) < 0.02) value = 1;
            surface.plot(x, y, value * c, (layer[i] ?? 1) as Layer);
          }
        }
        grains(surface, t - 1.1);
        surface.flush();
      },
    };
  },
};

/** First and last rows of the glyph, and the top edge of each column (height where empty). */
function extent(mask: Mask): { top: number; bottom: number; edge: Int32Array } {
  const { width, height, cover } = mask;
  let top = height;
  let bottom = 0;
  const edge = new Int32Array(width).fill(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((cover[y * width + x] ?? 0) < 0.5) continue;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      if ((edge[x] ?? height) === height) edge[x] = y;
    }
  }
  return { top, bottom, edge };
}

/**
 * Grains that leave the top edge of the glyph and rise, drifting and dimming. They are born
 * at regular slots, `interval` seconds apart, around the tip, or across `spread` (a fraction
 * of the width) of the upper edge, rising at `speed` spans per second or so; only live ones
 * are drawn. `t` counts from the first grain.
 */
function risingGrains(mask: Mask, spread: number, interval: number, speed = 1) {
  const { width, height } = mask;
  const { top, bottom, edge } = extent(mask);
  const span = Math.max(1, bottom - top);
  let tipX = 0;
  let tipCount = 0;
  for (let x = 0; x < width; x++) {
    if (edge[x] === top) {
      tipX += x;
      tipCount++;
    }
  }
  tipX = tipCount ? tipX / tipCount : width / 2;
  const life = 1.6;

  return (surface: Surface, t: number) => {
    if (t < 0) return;
    const newest = Math.floor(t / interval);
    for (let slot = Math.max(0, newest - Math.ceil(life / interval)); slot <= newest; slot++) {
      const age = t - slot * interval;
      if (age < 0 || age > life || hash(slot, 3, 41) < 0.35) continue;
      const bornX = Math.round(tipX + (hash(slot, 4, 41) - 0.5) * spread * width);
      const bornY = Math.min(edge[bornX] ?? height, height) - 1;
      if (bornY >= height - 1) continue;
      const drift = (hash(slot, 1, 41) - 0.5) * span * 0.5;
      const x = bornX + drift * (age / life) + Math.sin(age * 4 + slot) * 0.8;
      const y = bornY - age * span * speed * (0.6 + 0.5 * hash(slot, 2, 41));
      const level = Math.round(LEVELS * (1 - age / life));
      surface.plotLevel(Math.round(x), Math.round(y), level, 1);
    }
  };
}

/**
 * Rilievo — the needle alone, cast as a faceted pyramid: its ridges run from every corner
 * into the centre and catch the circling light, while grains peel off its upper edges and
 * rise north.
 */
export const ascent: EffectDefinition = {
  rest: 2.6,
  create(surface, mask) {
    const shade = castShading(mask, 'full');
    const grains = risingGrains(mask, 0.8, 0.015, 0.45);
    return {
      frame(t) {
        surface.clear();
        shade(surface, t);
        grains(surface, t - 1.5);
        surface.flush();
      },
    };
  },
};
