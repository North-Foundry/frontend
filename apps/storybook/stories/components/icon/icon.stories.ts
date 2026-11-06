/**
 * Stories for the icon: Lucide glyphs at the theme's size steps.
 *
 * The glyphs come from Lucide's own `icons` map, so updating the package adds its new icons to
 * the controls and the catalogue without editing this file.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ArrowRight, icons } from '@lucide/vue';
import { computed, ref } from 'vue';

import { ICON_STROKE_WIDTH, Icon, type IconVariants, Input } from '@north-foundry/ui';

type Size = NonNullable<IconVariants['size']>;

interface IconStoryArgs {
  icon: keyof typeof icons;
  size: Size;
  strokeWidth: number;
  label: string;
}

const sizes: Size[] = ['xs', 'sm', 'md', 'lg'];

/**
 * Every Lucide icon name, in the PascalCase form it is imported by.
 */
const names = Object.keys(icons).sort() as (keyof typeof icons)[];

/**
 * Reduces a name or a query to lowercase letters and digits, so `arrow right`, `arrow-right`
 * and `ArrowRight` all match the same icon.
 */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * A single icon with every prop as a control, on the scheme picked in the Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Icon',
  args: {
    icon: 'ArrowRight',
    size: 'lg',
    strokeWidth: ICON_STROKE_WIDTH,
    label: '',
  },
  argTypes: {
    icon: { control: 'select', options: names },
    size: { control: 'inline-radio', options: sizes },
    strokeWidth: { control: { type: 'range', min: 1, max: 3, step: 0.25 } },
    label: { control: 'text' },
  },
  /**
   * Centres the icon on the canvas.
   */
  render: (args) => ({
    components: { Icon },
    /**
     * Exposes the story args and the icon map to the template.
     */
    setup() {
      return { args, icons };
    },
    template: `
      <div class="grid min-h-48 place-items-center p-12">
        <Icon
          :icon="icons[args.icon]"
          :size="args.size"
          :stroke-width="args.strokeWidth"
          :label="args.label || undefined"
        />
      </div>
    `,
  }),
} satisfies Meta<IconStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default icon, with every prop as a control. */
export const Playground: Story = {};

/**
 * The four size steps and the text colours an icon inherits, on dark and paper.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the same sheet in both schemes, so the two can be compared row by row.
   */
  render: () => ({
    components: { Icon },
    /**
     * Exposes the size steps, the colour classes, the sample glyph and the schemes to the
     * template.
     */
    setup() {
      return {
        sizes,
        colours: ['text-foreground', 'text-muted-foreground', 'text-primary', 'text-destructive'],
        ArrowRight,
        schemes: ['dark', 'paper'],
      };
    },
    template: `
      <div class="grid min-h-dvh md:grid-cols-2">
        <section
          v-for="scheme in schemes"
          :key="scheme"
          :class="scheme"
          class="flex flex-col gap-8 p-6 md:p-10"
        >
          <p class="label">.{{ scheme }}</p>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">size</p>
            <div class="flex items-end gap-8">
              <div v-for="size in sizes" :key="size" class="flex flex-col items-center gap-2">
                <Icon :icon="ArrowRight" :size="size" />
                <p class="mono text-caption text-muted-foreground">{{ size }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <p class="mono text-caption text-muted-foreground">colour</p>
            <div class="flex flex-col gap-2">
              <p v-for="colour in colours" :key="colour" :class="colour" class="flex items-center gap-2 text-sm">
                <Icon :icon="ArrowRight" />
                {{ colour }}
              </p>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};

/**
 * Every Lucide icon, searchable by name, with the name to import it by under each glyph.
 */
export const Catalog: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Filters the full icon map by the search field as the user types.
   */
  render: () => ({
    components: { Icon, Input },
    /**
     * Holds the query and derives the matching names from it.
     */
    setup() {
      const query = ref('');
      const matches = computed(() => {
        const needle = normalise(query.value);
        return needle ? names.filter((name) => normalise(name).includes(needle)) : names;
      });
      return { query, matches, total: names.length, icons };
    },
    template: `
      <div class="flex flex-col gap-6 p-10">
        <div class="flex flex-wrap items-center gap-4">
          <Input v-model="query" type="search" placeholder="Search icons" class="max-w-80" />
          <p class="mono text-caption text-muted-foreground">
            {{ matches.length }} / {{ total }}
          </p>
        </div>

        <ul class="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
          <li
            v-for="name in matches"
            :key="name"
            class="flex flex-col items-center gap-2 rounded-md border border-border p-3"
          >
            <Icon :icon="icons[name]" size="lg" />
            <p
              class="w-full truncate text-center mono text-caption text-muted-foreground"
              :title="name"
            >
              {{ name }}
            </p>
          </li>
        </ul>
      </div>
    `,
  }),
};
