import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { DitherUnderlay } from '@north-foundry/ui';
import DitherUnderlayGallery from './DitherUnderlayGallery.vue';

const meta = {
  title: 'Effects/Dither Underlay',
  component: DitherUnderlay,
  parameters: { layout: 'fullscreen' },
  args: {
    position: 'bottom-right',
    animation: 'none',
    size: 600,
    depth: 200,
    pixelSize: 2,
    color: '#5b8fd6',
    intensity: 0.9,
    duration: 12,
    timescale: 1,
    paused: false,
    waveShape: 'sine',
    waveCount: 3,
    amplitude: 0.22,
    reactionThickness: 1,
    gradient: undefined,
    gradientLevels: 16,
  },
  argTypes: {
    gradient: {
      control: 'select',
      options: ['none', 'graphite', 'slate', 'signal', 'horizon', 'aurora', 'eclipse', 'steel', 'polar', 'paper'],
      mapping: { none: undefined },
    },
    gradientLevels: { control: { type: 'range', min: 2, max: 64, step: 1 } },
    position: {
      control: 'inline-radio',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom', 'right', 'top', 'left'],
    },
    animation: {
      control: 'select',
      options: ['none', 'drift', 'breathe', 'expand', 'contract', 'ripple', 'wave', 'fire', 'fire-down', 'evaporate', 'rays', 'snowing', 'fireworks', 'chladni', 'voronoi', 'reaction-diffusion', 'interference', 'vortex', 'soliton', 'moire', 'phyllotaxis', 'branching', 'kuramoto'],
    },
    size: { control: { type: 'range', min: 240, max: 900, step: 20 } },
    depth: { control: { type: 'range', min: 40, max: 400, step: 10 } },
    pixelSize: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    color: { control: 'color' },
    intensity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    duration: { control: { type: 'range', min: 2, max: 30, step: 1 } },
    timescale: { control: { type: 'range', min: -10, max: 10, step: 0.25 } },
    paused: { control: 'boolean' },
    waveShape: {
      control: 'inline-radio',
      options: ['sine', 'triangle', 'sawtooth', 'square'],
    },
    waveCount: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    amplitude: { control: { type: 'range', min: 0, max: 0.45, step: 0.01 } },
    reactionThickness: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
} satisfies Meta<typeof DitherUnderlay>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A responsive field guide to placement, motion, surfaces, and real component contexts. */
export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DitherUnderlayGallery },
    template: '<DitherUnderlayGallery />',
  }),
};

/** Adjust every renderer option live. The component overlays its positioned parent. */
export const Playground: Story = {
  render: (args) => ({
    components: { DitherUnderlay },
    setup() {
      return { args };
    },
    template: `
      <main class="dc-playground">
        <div class="dc-playground__surface">
          <DitherUnderlay v-bind="args" />
          <div class="dc-playground__copy">
            <span class="dc-kicker">North Foundry / Surface study</span>
            <h1>Light, held at the edge.</h1>
            <p>Keep the host positioned and clipped; the underlay never interrupts its content.</p>
          </div>
        </div>
      </main>
    `,
  }),
};

export const Original: Story = {
  render: Playground.render,
  args: { size: 900, pixelSize: 2 },
};

export const Drift: Story = {
  render: Playground.render,
  args: { animation: 'drift' },
};

export const Breathe: Story = {
  render: Playground.render,
  args: { animation: 'breathe' },
};

export const Expand: Story = {
  render: Playground.render,
  args: { animation: 'expand' },
};

export const Contract: Story = {
  render: Playground.render,
  args: { animation: 'contract' },
};

export const Ripple: Story = {
  render: Playground.render,
  args: { animation: 'ripple' },
};

export const Bottom: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, pixelSize: 2 },
};

export const Right: Story = {
  render: Playground.render,
  args: { position: 'right', depth: 140, pixelSize: 2 },
};

export const Top: Story = {
  render: Playground.render,
  args: { position: 'top', depth: 140, pixelSize: 2 },
};

export const Left: Story = {
  render: Playground.render,
  args: { position: 'left', depth: 140, pixelSize: 2 },
};

export const SineWave: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'wave', waveShape: 'sine', waveCount: 3, amplitude: 0.22, duration: 10, pixelSize: 2 },
};

export const TriangleWave: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'wave', waveShape: 'triangle', waveCount: 3, amplitude: 0.22, duration: 10, pixelSize: 2 },
};

export const SawtoothWave: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'wave', waveShape: 'sawtooth', waveCount: 3, amplitude: 0.22, duration: 10, pixelSize: 2 },
};

export const SquareWave: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'wave', waveShape: 'square', waveCount: 3, amplitude: 0.22, duration: 10, pixelSize: 2 },
};

export const Fire: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'fire', duration: 6, pixelSize: 2 },
};

export const FireDown: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'fire-down', duration: 6, pixelSize: 2 },
};

export const Evaporate: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 140, animation: 'evaporate', duration: 6, pixelSize: 2 },
};

export const RayShooting: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 240, animation: 'rays', duration: 4, pixelSize: 2 },
};

export const Snowing: Story = {
  render: Playground.render,
  args: { position: 'top', depth: 200, animation: 'snowing', duration: 10, pixelSize: 2 },
};

export const Fireworks: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 280, animation: 'fireworks', duration: 8, pixelSize: 2 },
};

export const CornerRays: Story = {
  render: Playground.render,
  args: { position: 'bottom-right', size: 600, animation: 'rays', duration: 4, pixelSize: 2 },
};

export const Interference: Story = {
  name: 'Interference',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'interference' },
};

export const VortexRibbons: Story = {
  name: 'Vortex ribbons',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'vortex' },
};

export const SolitaryPulses: Story = {
  name: 'Solitary pulses',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'soliton' },
};

export const MoireDrift: Story = {
  name: 'Moiré drift',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'moire' },
};

export const Phyllotaxis: Story = {
  name: 'Phyllotaxis',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 10, animation: 'phyllotaxis' },
};

export const BranchingStreams: Story = {
  name: 'Branching streams',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 10, animation: 'branching' },
};

export const Kuramoto: Story = {
  name: 'Kuramoto',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'kuramoto' },
};

export const Chladni: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'chladni' },
};

export const Voronoi: Story = {
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, duration: 12, animation: 'voronoi' },
};


export const ReactionDiffusion: Story = {
  name: 'Reaction diffusion',
  render: Playground.render,
  args: { position: 'bottom', depth: 220, pixelSize: 2, intensity: 0.9, reactionThickness: 0.5, animation: 'reaction-diffusion' },
};

/** A dithered gradient on its own: without a position, the ink texture is left out. */
export const Gradient: Story = {
  args: { gradient: 'aurora', pixelSize: 2 },
  render: (args) => ({
    components: { DitherUnderlay },
    setup() {
      return { args };
    },
    template: `
      <main class="dc-playground">
        <div class="dc-playground__surface">
          <DitherUnderlay :gradient="args.gradient" :gradient-levels="args.gradientLevels" :pixel-size="args.pixelSize" />
          <div class="dc-playground__copy">
            <span class="dc-kicker">North Foundry / Gradient study</span>
            <h1>Light on graphite.</h1>
            <p>A fixed gradient ground, quantised with the same Bayer grid as the texture.</p>
          </div>
        </div>
      </main>
    `,
  }),
};

/** A gradient ground with the ink texture moving over it. */
export const GradientWithWave: Story = {
  name: 'Gradient with wave',
  render: Playground.render,
  args: { gradient: 'horizon', position: 'top', animation: 'wave', depth: 160, pixelSize: 2, color: '#a9c4ea', intensity: 0.6 },
};

/** Every gradient ground side by side. */
export const Gradients: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { DitherUnderlay },
    setup: () => ({
      backgrounds: [
        { gradient: 'graphite', description: 'Soft graphite depth' },
        { gradient: 'slate', description: 'A cool, diffused field' },
        { gradient: 'signal', description: 'Blue light on dark ground' },
        { gradient: 'horizon', description: 'Light at the edge of the frame' },
        { gradient: 'aurora', description: 'Intersecting fields of blue' },
        { gradient: 'eclipse', description: 'A dark core, surrounded by light' },
        { gradient: 'steel', description: 'A reflection across metal' },
        { gradient: 'polar', description: 'Cold light falling into shadow' },
        { gradient: 'paper', description: 'A pale field with a trace of cobalt' },
      ],
    }),
    template: `
      <main class="gradient-collection">
        <header class="gradient-collection__header">
          <p>North Foundry / Background studies</p>
          <h1>Light on<br>graphite.</h1>
          <div>Nine dithered grounds, using the shared theme palette.</div>
        </header>
        <div class="gradient-collection__grid">
          <article v-for="(background, index) in backgrounds" :key="background.gradient" class="gradient-collection__item">
            <div class="gradient-collection__preview">
              <DitherUnderlay :gradient="background.gradient" :pixel-size="2" />
              <span class="gradient-collection__number" :class="{ 'gradient-collection__number--dark': background.gradient === 'paper' }">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div class="gradient-collection__caption">
              <h2>{{ background.gradient }}</h2>
              <p>{{ background.description }}</p>
            </div>
          </article>
        </div>
      </main>
    `,
  }),
};
