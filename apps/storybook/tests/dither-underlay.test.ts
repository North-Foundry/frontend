import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { renderDither as renderDitherFunction } from '../../../packages/ui/src/components/dither-underlay/render.ts';

type RenderDither = typeof renderDitherFunction;
type Frame = Parameters<RenderDither>[0];
type Animation = Parameters<RenderDither>[2];
type RenderOptions = NonNullable<Parameters<RenderDither>[4]>;
type Snowflake = { y: number; pixels: [number, number, number][]; alpha: number };

/**
 * Run with: yarn workspace @north-foundry/storybook test
 */
const root = fileURLToPath(new URL('../../../', import.meta.url));
const server = await createServer({ root, configFile: false, server: { middlewareMode: true, hmr: false, ws: false } });

try {
  const { renderDither } = await server.ssrLoadModule('/packages/ui/src/components/dither-underlay/render.ts') as { renderDither: RenderDither };
  /** Creates the mutable frame buffer used by the renderer. */
  const image = (): Frame => ({ width: 120, height: 80, data: new Uint8ClampedArray(120 * 80 * 4) }) as Frame;
  /** Counts pixels with nonzero alpha. */
  const count = (frame: Frame): number => frame.data.filter((_, i) => i % 4 === 3 && frame.data[i] > 0).length;
  /** Renders one frame with the requested effect settings. */
  const draw = (animation: Animation, phase: number, intensity = 0.9, options: RenderOptions = {}): Frame => {
    const frame = image();
    renderDither(frame, intensity, animation, phase, options);
    return frame;
  };

  /**
   * Captured before effect extraction: every animation on a corner and all four sides,
   * at phase 0.17 with a 120x80 buffer and 0.9 coverage. These lock the original output.
   */
  const references = JSON.parse(readFileSync(new URL('./fixtures/dither-underlay-frames.json', import.meta.url), 'utf8')) as Record<string, Record<string, string>>;
  const { effects } = await server.ssrLoadModule('/packages/ui/src/components/dither-underlay/effects/index.ts') as { effects: Record<string, unknown> };
  assert.deepEqual(Object.keys(effects).sort(), [...Object.keys(references), 'snowing', 'fireworks', 'chladni', 'voronoi', 'reaction-diffusion', 'kuramoto'].sort(),
    'Every effect needs original reference frames or dedicated behavior checks');
  for (const [animation, placements] of Object.entries(references)) {
    for (const [placement, expected] of Object.entries(placements)) {
      const frame = draw(animation as Animation, 0.17, 0.9, { edge: placement === 'corner' ? undefined : placement as RenderOptions['edge'] });
      assert.equal(createHash('sha256').update(frame.data).digest('hex'), expected,
        `${animation}/${placement} must preserve the original pixels`);
    }
  }

  /**
   * Independently reproduce the supplied landing's formula and threshold table.
   */
  const bayer = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
  const still = draw('none', 0);
  for (let y = 0; y < still.height; y++) {
    for (let x = 0; x < still.width; x++) {
      const u = (still.width - x) / still.width;
      const v = (still.height - y) / still.height;
      const du = u * Math.cos(0.62) - v * Math.sin(0.62);
      const dv = u * Math.sin(0.62) + v * Math.cos(0.62);
      const tone = Math.max(0, 1 - Math.hypot(du / 0.85, dv / 0.38)) ** 1.6;
      const expected = tone * 0.9 > (bayer[(y % 8) * 8 + x % 8] + 0.5) / 64;
      assert.equal(still.data[(y * still.width + x) * 4 + 3] > 0, expected);
    }
  }
  assert.ok(count(still) > 0, 'The reference must contain ink');
  assert.equal(count(draw('none', 0, 0)), 0, 'Zero intensity must be transparent');
  assert.deepEqual(draw('none', 0).data, draw('none', 0.5).data);
  for (const animation of ['drift', 'breathe', 'expand', 'contract', 'ripple'] as const) {
    assert.notDeepEqual(draw(animation, 0).data, draw(animation, 0.25).data, `${animation} must move`);
    assert.deepEqual(draw(animation, 0).data, draw(animation, 1).data, `${animation} must loop seamlessly`);
  }
  assert.ok(count(draw('expand', 0)) < count(draw('expand', 0.5)));
  assert.ok(count(draw('contract', 0)) > count(draw('contract', 0.5)));

  for (const edge of ['bottom', 'right', 'top', 'left'] as const) {
    const frame = draw('none', 0, 0.9, { edge });
    let near = 0, far = 0;
    const bands = [0, 0, 0, 0];
    for (let y = 0; y < frame.height; y++) {
      for (let x = 0; x < frame.width; x++) {
        if (!frame.data[(y * frame.width + x) * 4 + 3]) {
          continue;
        }
        const along = edge === 'left' || edge === 'right' ? y / frame.height : x / frame.width;
        const distance = edge === 'left' ? x / frame.width : edge === 'right' ? 1 - x / frame.width
          : edge === 'top' ? y / frame.height : 1 - y / frame.height;
        if (distance < 0.25) {
          near++;
        }
        if (distance > 0.75) {
          far++;
        }
        bands[Math.min(3, Math.floor(along * 4))]++;
      }
    }
    assert.ok(near > far * 4, `${edge} must fade away from its anchor`);
    assert.ok(bands.every(value => value > 0), `${edge} must span the complete edge`);
    for (const animation of ['drift', 'breathe', 'expand', 'contract', 'ripple', 'wave', 'fire', 'fire-down', 'evaporate', 'rays'] as const) {
      assert.notDeepEqual(draw(animation, 0, 0.9, { edge }).data, draw(animation, 0.25, 0.9, { edge }).data, `${edge}/${animation} must move`);
      assert.deepEqual(draw(animation, 0, 0.9, { edge }).data, draw(animation, 1, 0.9, { edge }).data, `${edge}/${animation} must loop`);
      assert.equal(count(draw(animation, 0.25, 0, { edge })), 0);
    }
  }
  assert.notDeepEqual(draw('rays', 0.25, 0.9, { edge: 'bottom' }).data,
    draw('evaporate', 0.25, 0.9, { edge: 'bottom' }).data, 'Rays must differ from evaporation');
  assert.ok(count(draw('rays', 0.25)) > 0, 'Corner rays must render');
  assert.notDeepEqual(draw('rays', 0, 0.9).data, draw('rays', 0.25, 0.9).data, 'Corner rays must move');
  const waveFrames = (['sine', 'triangle', 'sawtooth', 'square'] as const).map(waveShape => {
    const options: RenderOptions = { edge: 'bottom', waveShape };
    const frame = draw('wave', 0.17, 0.9, options);
    assert.notDeepEqual(frame.data, draw('wave', 0.42, 0.9, options).data, `${waveShape} must travel`);
    assert.deepEqual(draw('wave', 0, 0.9, options).data, draw('wave', 1, 0.9, options).data);
    return frame;
  });
  for (let a = 0; a < waveFrames.length; a++) {
    for (let b = a + 1; b < waveFrames.length; b++) {
      assert.notDeepEqual(waveFrames[a].data, waveFrames[b].data, 'Wave shapes must be visually distinct');
    }
  }
  assert.deepEqual(draw('fire-down', 0.25, 0.9, { edge: 'bottom' }).data,
    draw('fire', 0.75, 0.9, { edge: 'bottom' }).data, 'Falling fire must reverse the rising flow');
  const flatWave: RenderOptions = { edge: 'bottom', amplitude: 0 };
  assert.deepEqual(draw('wave', 0, 0.9, flatWave).data, draw('wave', 0.25, 0.9, flatWave).data);

  // A simulation belongs to its image buffer and advances between renders.
  for (const edge of ['bottom', 'right', 'top', 'left', undefined] as const) {
    const first = draw('reaction-diffusion', 0, 0.9, { edge });
    assert.ok(count(first) > 0, `${edge ?? 'corner'}/reaction-diffusion must contain ink`);
    assert.deepEqual(first.data, draw('reaction-diffusion', 0.5, 0.9, { edge }).data,
      'Equal-sized fresh simulations must have deterministic starting states');
    const previous = first.data.slice();
    renderDither(first, 0.9, 'reaction-diffusion', 0, { edge });
    assert.notDeepEqual(first.data, previous, 'A reused simulation must evolve');
    assert.equal(count(draw('reaction-diffusion', 0, 0, { edge })), 0);
  }

  for (const edge of ['bottom', 'right', 'top', 'left', undefined] as const) {
    const first = draw('kuramoto', 0, 0.9, { edge });
    assert.ok(count(first) > 0, `${edge ?? 'corner'}/kuramoto must contain ink`);
    assert.deepEqual(first.data, draw('kuramoto', 0.5, 0.9, { edge }).data,
      'Fresh Kuramoto simulations must start deterministically');
    const before = first.data.slice();
    for (let i = 0; i < 10; i++) {
      renderDither(first, 0.9, 'kuramoto', 0, { edge });
    }
    assert.notDeepEqual(first.data, before, 'Kuramoto oscillators must evolve');
    assert.equal(count(draw('kuramoto', 0, 0, { edge })), 0);
  }

  const slowReaction = image();
  const fastReaction = image();
  for (let i = 0; i < 5; i++) {
    renderDither(slowReaction, 0.9, 'reaction-diffusion', 0, { edge: 'bottom', duration: 30 });
    renderDither(fastReaction, 0.9, 'reaction-diffusion', 0, { edge: 'bottom', duration: 2 });
  }
  assert.notDeepEqual(slowReaction.data, fastReaction.data, 'Shorter duration must speed up the simulation');

  const reactionFull = draw('reaction-diffusion', 0, 0.9, { edge: 'bottom', reactionThickness: 1 });
  const reactionThin = draw('reaction-diffusion', 0, 0.9, { edge: 'bottom', reactionThickness: 0.75 });
  assert.ok(count(reactionThin) > 0 && count(reactionThin) < count(reactionFull) * 0.8,
    'Reaction thickness must narrow visible shapes without removing them');

  const mathematicalMotions = ['voronoi', 'chladni', 'interference', 'vortex', 'soliton', 'moire', 'phyllotaxis', 'branching'] as const;
  const patterns: Frame[] = [];
  for (const animation of [...mathematicalMotions, 'snowing', 'fireworks'] as const) {
    for (const edge of ['bottom', 'right', 'top', 'left', undefined] as const) {
      const options: RenderOptions = { edge };
      const frame = draw(animation, 0.17, 0.9, options);
      assert.ok(count(frame) > 0, `${edge ?? 'corner'}/${animation} must contain ink`);
      assert.notDeepEqual(frame.data, draw(animation, 0.31, 0.9, options).data,
        `${edge ?? 'corner'}/${animation} must move`);
      assert.deepEqual(draw(animation, 0, 0.9, options).data, draw(animation, 1, 0.9, options).data,
        `${edge ?? 'corner'}/${animation} must loop`);
      const before = draw(animation, 0.99999, 0.9, options);
      const after = draw(animation, 0.00001, 0.9, options);
      let changed = 0;
      for (let i = 3; i < before.data.length; i += 4) changed += Number(before.data[i] !== after.data[i]);
      assert.ok(changed < image().width * image().height * 0.01,
        `${edge ?? 'corner'}/${animation} must not jump across its loop boundary`);
      assert.equal(count(draw(animation, 0.17, 0, options)), 0,
        `${edge ?? 'corner'}/${animation} must respect zero intensity`);
    }
    patterns.push(draw(animation, 0.17, 0.9, { edge: 'bottom' }));
  }
  for (let a = 0; a < patterns.length; a++) {
    for (let b = a + 1; b < patterns.length; b++) {
      assert.notDeepEqual(patterns[a].data, patterns[b].data, 'Mathematical patterns must remain distinct');
    }
  }
  /**
   * A solitary pulse must travel away from the bottom, rather than simply change its opacity.
   */
  const pulsePeak = (phase: number): number => {
    const frame = draw('soliton', phase, 0.9, { edge: 'bottom', amplitude: 0 });
    const rows = Array.from({ length: frame.height }, (_, y) => {
      let ink = 0;
      for (let x = 0; x < frame.width; x++) ink += Number(frame.data[(y * frame.width + x) * 4 + 3] > 0);
      return ink;
    });
    return rows.indexOf(Math.max(...rows));
  };
  assert.ok(pulsePeak(0.12) < pulsePeak(0.04), 'Solitary pulses must rise from the bottom');
  /**
   * Follow visible flakes between nearby frames. Most matches must travel away from
   * the selected edge, and accumulated ink must decrease with distance from it.
   */
  for (const edge of ['top', 'bottom', 'left', 'right'] as const) {
    const dx = edge === 'left' ? 1 : edge === 'right' ? -1 : 0;
    const dy = edge === 'top' ? 1 : edge === 'bottom' ? -1 : 0;
    let forward = 0, backward = 0, near = 0, far = 0;
    for (let sample = 0; sample < 16; sample++) {
      const before = draw('snowing', sample / 16, 0.9, { edge });
      const after = draw('snowing', sample / 16 + 0.02, 0.9, { edge });
      for (let y = 0; y < before.height; y++) {
        for (let x = 0; x < before.width; x++) {
          if (!before.data[(y * before.width + x) * 4 + 3]) {
            continue;
          }
          const distance = edge === 'top' ? y / before.height : edge === 'bottom' ? 1 - y / before.height
            : edge === 'left' ? x / before.width : 1 - x / before.width;
          if (distance < 0.25) {
            near += before.data[(y * before.width + x) * 4 + 3] / 255;
          }
          if (distance > 0.75) {
            far += before.data[(y * before.width + x) * 4 + 3] / 255;
          }
          for (const direction of [-1, 1]) {
            let matched = false;
            for (let step = 1; step <= 5; step++) {
              for (let sway = -1; sway <= 1; sway++) {
                const xx = x + dx * step * direction + dy * sway;
                const yy = y + dy * step * direction + dx * sway;
                if (xx >= 0 && xx < after.width && yy >= 0 && yy < after.height
                  && after.data[(yy * after.width + xx) * 4 + 3]) {
                  matched = true;
                }
              }
            }
            if (matched && direction === 1) {
              forward++;
            } else if (matched) {
              backward++;
            }
          }
        }
      }
    }
    assert.ok(forward > backward * 2, `${edge}/snowing must move away from its anchor`);
    assert.ok(near > far * 4, `${edge}/snowing must dissolve as flakes travel`);
  }
  /**
   * A tall, narrow frame separates flakes so their local masks can be followed
   * through several pixel rows without confusing movement with screen-grid dither.
   */
  const isolatedSnowflakes = (phase: number): Snowflake[] => {
    const frame = { width: 32, height: 4096, data: new Uint8ClampedArray(32 * 4096 * 4) } as Frame;
    renderDither(frame, 0.9, 'snowing', phase, { edge: 'top' });
    const flakes: Snowflake[] = [];
    let flake: Snowflake | undefined;
    for (let y = 0; y < frame.height; y++) {
      const row: [number, number][] = [];
      for (let x = 0; x < frame.width; x++) {
        const alpha = frame.data[(y * frame.width + x) * 4 + 3];
        if (alpha > 0) {
          row.push([x, alpha]);
        }
      }
      if (row.length === 0) {
        flake = undefined;
        continue;
      }
      if (!flake) {
        flake = { y, pixels: [], alpha: row[0][1] };
        flakes.push(flake);
      }
      for (const [x, alpha] of row) {
        flake.pixels.push([x, y - flake.y, alpha]);
      }
    }
    return flakes.filter(({ y, pixels }) => y > 400 && y < 3000 && pixels.length > 1
      && pixels.every(([x, , alpha]) => x > 1 && x < 30 && alpha === pixels[0][2]));
  };
  const snowBefore = isolatedSnowflakes(0.2);
  const snowAfter = isolatedSnowflakes(0.201);
  assert.ok(snowBefore.length >= 3, 'The snow stability check must follow several complete flakes');
  for (const flake of snowBefore) {
    const moved = snowAfter.find(next => next.y > flake.y && next.y <= flake.y + 9)!;
    assert.ok(moved, 'A moving flake must remain visible in the next frame');
    assert.deepEqual(moved.pixels.map(([x, y]) => [x, y]), flake.pixels.map(([x, y]) => [x, y]),
      'A flake must retain every square of its local dither mask as it crosses screen pixels');
    assert.ok(moved.alpha <= flake.alpha && moved.alpha >= flake.alpha - 2,
      'A flake must fade gradually as a whole instead of toggling individual squares');
    assert.ok(flake.alpha > 0 && flake.alpha < 255, 'Snow must use continuous opacity for fading');
  }
  /**
   * Fireworks must emit separate, staggered bursts across several parts of a long
   * edge, rasterizing their density as opaque grains on the fixed dither grid.
   */
  const burstBands = Array<number>(6).fill(0);
  const burstInk: number[] = [];
  let translucentSparks = 0;
  let crowdedSeparators = 0;
  for (let sample = 0; sample < 32; sample++) {
    const frame = { width: 480, height: 140, data: new Uint8ClampedArray(480 * 140 * 4) } as Frame;
    renderDither(frame, 0.9, 'fireworks', sample / 32, { edge: 'bottom' });
    let ink = 0;
    for (let y = 0; y < frame.height; y++) {
      for (let x = 0; x < frame.width; x++) {
        const alpha = frame.data[(y * frame.width + x) * 4 + 3];
        ink += alpha / 255;
        burstBands[Math.floor(x / frame.width * 6)] += alpha / 255;
        if (alpha > 0 && alpha < 255) {
          translucentSparks++;
        }
        if (alpha > 0 && (x === 160 || x === 320)) {
          crowdedSeparators++;
        }
      }
    }
    burstInk.push(ink);
  }
  assert.ok(burstBands.filter(ink => ink > 0).length >= 4, 'Bursts must appear in several separate locations');
  assert.ok(Math.max(...burstInk) > Math.min(...burstInk) * 2, 'Bursts must be staggered rather than a constant particle field');
  assert.equal(translucentSparks, 0, 'Fireworks must fade through dither density rather than flake opacity');
  assert.equal(crowdedSeparators, 0, 'Random bursts must leave clear space between their emission zones');
  assert.deepEqual(draw('fireworks', 0.17).data, draw('fireworks', 0.17).data,
    'Repainting a paused fireworks frame must preserve its seeded positions and shapes');
  /**
   * Reusing an ImageData must clear particles left by a preceding frame.
   */
  const reused = draw('branching', 0.17, 0.9, { edge: 'bottom' });
  renderDither(reused, 0, 'phyllotaxis', 0.31, { edge: 'bottom' });
  assert.equal(count(reused), 0, 'Particle masks must clear between renders');
  console.log('Dither: original parity, edges, motions, snow direction and fading, patterns and loops passed.');
} finally {
  await server.close();
}
