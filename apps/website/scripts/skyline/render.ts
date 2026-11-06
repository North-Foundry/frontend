/*
 * Renders the Turin skyline plate into src/assets/skyline/turin.png.
 *   node apps/website/scripts/skyline/render.ts [--scale 0.5] [--out file.png]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import { orderedDither, tone } from '../../../../packages/ui/src/lib/dither.ts';
import { renderScene } from './engine.ts';
import { encodeIndexedPng } from './png.ts';
import { camera, plate, scene } from './turin.ts';

/**
 * The plate palette, darkest first, from `--nf-navy-800` through `--nf-navy-700`, `--nf-navy-500`,
 * `--nf-blue-600` and `--nf-blue-400` to `--nf-blue-200`. Index 0 of the output is transparent.
 */
const TONES = ['#18222d', '#25384c', '#3b5d84', '#5b8fd6', '#8cc8ff', '#c9e4ff'] as const;

const { values } = parseArgs({
  options: {
    scale: { type: 'string', default: '1' },
    out: { type: 'string', default: join(import.meta.dirname, '../../src/assets/skyline/turin.png') },
  },
});

const scale = Number(values.scale);
const width = Math.round(plate.width * scale);
const height = Math.round(plate.height * scale);
const started = performance.now();
const image = renderScene(scene, camera, width, height);
const indices = orderedDither(tone(image, plate.tone), TONES.length + 1);
await mkdir(dirname(values.out), { recursive: true });
await writeFile(values.out, encodeIndexedPng(indices, width, height, TONES));
console.log(`${plate.name}: ${width}×${height} in ${((performance.now() - started) / 1000).toFixed(1)}s → ${values.out}`);
