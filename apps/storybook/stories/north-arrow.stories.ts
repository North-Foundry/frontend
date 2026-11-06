/**
 * Stories for the north arrow mark.
 *
 * Each story frames the canvas on the ground the mark is dithered against, because the darkest
 * dither tone is transparent: the mark falls into its background by design.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';

import { NorthArrow } from '@north-foundry/ui';

/**
 * Controls mirror the renderer options. The frame is drawn around the canvas so the ground
 * follows the `ground` control the way the product would.
 */
const meta = {
  title: 'Brand/North arrow',
  component: NorthArrow,
  args: {
    size: 256,
    cell: 2,
    ground: 'dark',
    mono: false,
    animated: false,
  },
  argTypes: {
    size: { control: { type: 'range', min: 48, max: 512, step: 8 } },
    cell: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    ground: { control: 'inline-radio', options: ['dark', 'light'] },
    mono: { control: 'boolean' },
    animated: { control: 'boolean' },
  },
  render: (args) => {
    return {
      components: { NorthArrow },
      setup() {
        const frame = computed(() => ({
          display: 'grid',
          placeItems: 'center',
          padding: '32px',
          background: args.ground === 'light' ? 'var(--nf-graphite-50)' : 'var(--background)',
        }));
        return { args, frame };
      },
      template: '<div :style="frame"><NorthArrow v-bind="args" /></div>',
    };
  },
} satisfies Meta<typeof NorthArrow>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default framing on the site's dark ground. */
export const Default: Story = {
  args: {
    cell: 2,
    animated: true
  }
};

/** The pale palette, for pages on a light ground. */
export const Light: Story = {
  args: { ground: 'light' },
};

/** The single-colour variant: the whole mark in the foundry blue. */
export const Mono: Story = {
  args: { mono: true },
};

/** The grains rising off the tip. Only this story starts the animation loop. */
export const Animated: Story = {
  args: { animated: true },
};

/** Smallest intended size: what the mark looks like in a header. */
export const Small: Story = {
  args: { size: 96 },
};

/** The finest grain the frame allows, closest to the avatar export. */
export const Fine: Story = {
  args: { size: 256, cell: 1 },
};
