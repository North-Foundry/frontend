/**
 * Stories for the shadcn-vue select on the North Foundry theme.
 *
 * The list is teleported to `body`, so these stories also check that it keeps the scheme of the
 * band its trigger sits in.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@north-foundry/ui';

interface SelectStoryArgs {
  size: 'default' | 'sm';
  placeholder: string;
  disabled: boolean;
  invalid: boolean;
  scrollSpeedFactor: number;
}

const components = {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

const materials = ['Graphite', 'Steel', 'Cobalt', 'Paper', 'Copper'];

/**
 * Every timezone the long-list example offers, enough to need the scroll arrows.
 */
const zones = Array.from({ length: 24 }, (_, hour) => `UTC${hour - 11 >= 0 ? '+' : '−'}${Math.abs(hour - 11)}`);

/**
 * A single select with its trigger props as controls, on the scheme picked in the Backgrounds
 * toolbar.
 */
const meta = {
  title: 'Components/Select',
  args: {
    size: 'default',
    placeholder: 'Choose a material',
    disabled: false,
    invalid: false,
    scrollSpeedFactor: 0.25,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    scrollSpeedFactor: {
      control: { type: 'number', min: 0, max: 2, step: 0.05 },
      description: 'Arrow scrolling multiplier. Defaults to 0.25; 1 restores the original speed and 0 stops scrolling.',
    },
  },
  /**
   * Places the select near the top of the canvas, leaving room for its list.
   */
  render: (args) => ({
    components,
    /**
     * Exposes the story args, the options and the selected value to the template.
     */
    setup() {
      const value = ref<string>();
      return { args, materials, value };
    },
    template: `
      <div class="grid min-h-72 place-items-start justify-center p-12">
        <Select v-model="value" :disabled="args.disabled">
          <SelectTrigger :size="args.size" :aria-invalid="args.invalid || undefined" class="w-56">
            <SelectValue :placeholder="args.placeholder" />
          </SelectTrigger>
          <SelectContent :scroll-speed-factor="args.scrollSpeedFactor">
            <SelectItem v-for="material in materials" :key="material" :value="material">
              {{ material }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
  }),
} satisfies Meta<SelectStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One select, with its trigger props as controls. */
export const Playground: Story = {};

/** Adjusts the scroll speed of the long list's up and down arrows. */
export const ScrollSpeed: Story = {
  args: { scrollSpeedFactor: 0.25 },
  parameters: { controls: { include: ['scrollSpeedFactor'] } },
  /**
   * Provides a constrained list so the scrolling arrows can be tried at each speed.
   */
  render: (args) => ({
    components,
    /**
     * Keeps the selected option visible while experimenting with arrow scrolling.
     */
    setup() {
      const value = ref('UTC+1');
      return { args, zones, value };
    },
    template: `
      <div class="grid min-h-72 place-items-start justify-center p-12">
        <Select v-model="value">
          <SelectTrigger aria-label="Choose a timezone" class="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent class="max-h-64" :scroll-speed-factor="args.scrollSpeedFactor">
            <SelectItem v-for="zone in zones" :key="zone" :value="zone">{{ zone }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    `,
  }),
};

/**
 * Sizes, groups with labels, a disabled item, a long list and the invalid and disabled states, on
 * the dark scheme and on paper side by side.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the same sheet in both schemes, so the two can be compared row by row.
   */
  render: () => ({
    components,
    /**
     * Exposes the option lists to the template.
     */
    setup() {
      return { materials, zones, schemes: ['dark', 'paper'] };
    },
    template: `
      <div class="grid min-h-screen md:grid-cols-2">
        <section
          v-for="scheme in schemes"
          :key="scheme"
          :class="scheme"
          class="flex flex-col gap-8 p-10"
        >
          <p class="label">.{{ scheme }}</p>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">sizes</p>
            <div class="flex flex-wrap items-center gap-3">
              <Select v-for="size in ['default', 'sm']" :key="size" default-value="Cobalt">
                <SelectTrigger :size="size" class="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="material in materials" :key="material" :value="material">
                    {{ material }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">groups, disabled item</p>
            <Select>
              <SelectTrigger class="w-56">
                <SelectValue placeholder="Choose a finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Metal</SelectLabel>
                  <SelectItem value="brushed">Brushed</SelectItem>
                  <SelectItem value="anodised">Anodised</SelectItem>
                  <SelectItem value="gilded" disabled>Gilded</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Paper</SelectLabel>
                  <SelectItem value="matte">Matte</SelectItem>
                  <SelectItem value="laid">Laid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">long list</p>
            <Select default-value="UTC+1">
              <SelectTrigger class="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="max-h-64">
                <SelectItem v-for="zone in zones" :key="zone" :value="zone">{{ zone }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">invalid, disabled</p>
            <div class="flex flex-wrap items-center gap-3">
              <Select>
                <SelectTrigger aria-invalid="true" class="w-44">
                  <SelectValue placeholder="Required" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="material in materials" :key="material" :value="material">
                    {{ material }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select disabled>
                <SelectTrigger class="w-44">
                  <SelectValue placeholder="Disabled" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
