import { hash } from '../../../lib/math';
import { tau } from '../engine/constants';
import { renderField } from '../engine/field';
import type { DitherEffect } from './types';

interface Oscillators {
  phases: Float64Array;
  frequencies: Float64Array;
}

const count = 36;
const coupling = 2;
const simulations = new WeakMap<ImageData, Oscillators>();

/** Create independently seeded oscillators for each underlay. */
function createOscillators(): Oscillators {
  return {
    phases: Float64Array.from({ length: count }, (_, i) => hash(i, 1, 127) * tau),
    frequencies: Float64Array.from({ length: count }, (_, i) => 1 + (hash(i, 2, 127) - 0.5) * 0.5),
  };
}

export const kuramoto: DitherEffect = {
  /** Coupled oscillators gradually synchronize and trace a moving band of grains. */
  render(context) {
    const { image, duration } = context;
    let state = simulations.get(image);
    if (!state) {
      state = createOscillators();
      simulations.set(image, state);
    }
    const { phases, frequencies } = state;
    let real = 0, imaginary = 0;
    for (const phase of phases) {
      real += Math.cos(phase) / count;
      imaginary += Math.sin(phase) / count;
    }
    const dt = tau / (Math.max(2, duration) * 24);
    for (let i = 0; i < count; i++) {
      const phase = phases[i]!;
      phases[i] = phase + dt * (frequencies[i]! + coupling * (imaginary * Math.cos(phase) - real * Math.sin(phase)));
    }
    const heights = Array.from(phases, phase => 0.12 + 0.55 * (0.5 + 0.5 * Math.sin(phase)));
    renderField(context, (along, distance) => {
      let tone = 0;
      for (let i = 0; i < count; i++) {
        const dx = (along * (count - 1) - i) * 0.8;
        const dy = (distance - heights[i]!) / 0.055;
        tone = Math.max(tone, Math.exp(-(dx * dx + dy * dy) * 0.7));
      }
      return tone * Math.max(0, 1 - distance) ** 0.65;
    });
  },
};
