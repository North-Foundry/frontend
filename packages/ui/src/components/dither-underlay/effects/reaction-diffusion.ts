import { clamp01, hash } from '../../../lib/math';
import { bayer } from '../engine/constants';
import { cornerDistance } from '../engine/corner';
import type { DitherEffect } from './types';

interface Simulation {
  width: number;
  height: number;
  a: Float32Array;
  b: Float32Array;
  nextA: Float32Array;
  nextB: Float32Array;
}

const simulations = new WeakMap<ImageData, Simulation>();
const diffusionA = 1;
const diffusionB = 0.5;
const feed = 0.055;
const kill = 0.062;
const warmupSteps = 200;

function step(state: Simulation): void {
  const { width, height, a, b, nextA, nextB } = state;
  for (let y = 0; y < height; y++) {
    const above = (y === 0 ? height - 1 : y - 1) * width;
    const below = (y === height - 1 ? 0 : y + 1) * width;
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const left = x === 0 ? width - 1 : x - 1;
      const right = x === width - 1 ? 0 : x + 1;
      const i = row + x;
      const lapA = -a[i]!
        + 0.2 * (a[row + left]! + a[row + right]! + a[above + x]! + a[below + x]!)
        + 0.05 * (a[above + left]! + a[above + right]! + a[below + left]! + a[below + right]!);
      const lapB = -b[i]!
        + 0.2 * (b[row + left]! + b[row + right]! + b[above + x]! + b[below + x]!)
        + 0.05 * (b[above + left]! + b[above + right]! + b[below + left]! + b[below + right]!);
      const reaction = a[i]! * b[i]! * b[i]!;
      nextA[i] = clamp01(a[i]! + diffusionA * lapA - reaction + feed * (1 - a[i]!));
      nextB[i] = clamp01(b[i]! + diffusionB * lapB + reaction - (feed + kill) * b[i]!);
    }
  }
  state.a = nextA;
  state.b = nextB;
  state.nextA = a;
  state.nextB = b;
}

/** Seed and prewarm deterministic chemical islands. */
function createSimulation(image: ImageData): Simulation {
  const scale = Math.max(1, Math.ceil(image.width / 160), Math.ceil(image.height / 100));
  const width = Math.max(12, Math.ceil(image.width / scale));
  const height = Math.max(12, Math.ceil(image.height / scale));
  const length = width * height;
  const state: Simulation = {
    width, height,
    a: new Float32Array(length).fill(1),
    b: new Float32Array(length),
    nextA: new Float32Array(length),
    nextB: new Float32Array(length),
  };
  const seeds = Math.max(8, Math.round(length / 580));
  for (let i = 0; i < seeds; i++) {
    const cx = Math.floor((0.06 + hash(i, 1, 83) * 0.88) * width);
    const cy = Math.floor((0.06 + hash(i, 2, 83) * 0.88) * height);
    const radius = 2 + Math.floor(hash(i, 3, 83) * 3);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) {
          continue;
        }
        const x = (cx + dx + width) % width;
        const y = (cy + dy + height) % height;
        state.a[y * width + x] = 0.1;
        state.b[y * width + x] = 0.9;
      }
    }
  }
  for (let i = 0; i < warmupSteps; i++) {
    step(state);
  }
  return state;
}

/** Bilinearly sample the coarse concentration grid. */
function sampleB(state: Simulation, x: number, y: number): number {
  const gx = x * (state.width - 1);
  const gy = y * (state.height - 1);
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const x1 = Math.min(x0 + 1, state.width - 1), y1 = Math.min(y0 + 1, state.height - 1);
  const tx = gx - x0, ty = gy - y0;
  const { b, width } = state;
  const top = b[y0 * width + x0]! * (1 - tx) + b[y0 * width + x1]! * tx;
  const bottom = b[y1 * width + x0]! * (1 - tx) + b[y1 * width + x1]! * tx;
  return top * (1 - ty) + bottom * ty;
}

export const reactionDiffusion: DitherEffect = {
  /** Advance a stateful Gray–Scott simulation instead of looping by phase. */
  render({ image, coverage, edge, reactionThickness, duration }) {
    let state = simulations.get(image);
    if (!state) {
      state = createSimulation(image);
      simulations.set(image, state);
    }
    const stepsPerFrame = Math.max(1, Math.min(60, Math.round(120 / duration)));
    for (let i = 0; i < stepsPerFrame; i++) {
      step(state);
    }
    const { width, height, data } = image;
    const cutoff = 0.035 + Math.sqrt(1 - reactionThickness) * 0.3;
    const inverseWidth = 1 / Math.max(1, width - 1);
    const inverseHeight = 1 / Math.max(1, height - 1);
    for (let y = 0; y < height; y++) {
      const ny = y * inverseHeight;
      for (let x = 0; x < width; x++) {
        const nx = x * inverseWidth;
        const pattern = clamp01((sampleB(state, nx, ny) - cutoff) / 0.16);
        const distance = edge === 'top' ? ny
          : edge === 'bottom' ? 1 - ny
          : edge === 'left' ? nx
          : edge === 'right' ? 1 - nx
          : cornerDistance(1 - nx, 1 - ny, 1);
        const envelope = Math.pow(clamp01(1 - distance), edge ? 0.75 : 0.55);
        const threshold = bayer[(y % 8) * 8 + x % 8] ?? 0.5;
        data[(y * width + x) * 4 + 3] = coverage * pattern * envelope > threshold ? 255 : 0;
      }
    }
  },
};
