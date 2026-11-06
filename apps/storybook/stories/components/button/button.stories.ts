/**
 * Stories for the shadcn-vue button on the North Foundry theme.
 *
 * Every story can be judged on both colour schemes, because the same component has to read on
 * the dark ground and on paper bands.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ArrowRight, Plus } from '@lucide/vue';

import { Button, type ButtonVariants, Icon } from '@north-foundry/ui';

type Variant = NonNullable<ButtonVariants['variant']>;
type Size = NonNullable<ButtonVariants['size']>;

interface ButtonStoryArgs {
  variant: Variant;
  size: Size;
  label: string;
  disabled: boolean;
}

const variants: Variant[] = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'];
const textSizes: Size[] = ['sm', 'default', 'lg'];
const iconSizes: Size[] = ['icon-sm', 'icon', 'icon-lg'];

/**
 * A single button with every prop as a control, on the scheme picked in the Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Button',
  args: {
    variant: 'default',
    size: 'default',
    label: 'Start a project',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    size: { control: 'select', options: [...textSizes, ...iconSizes] },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  /**
   * Centres the button on the canvas; icon sizes get the plus icon instead of the label.
   */
  render: (args) => ({
    components: { Button, Icon },
    /**
     * Exposes the story args and the plus glyph to the template.
     */
    setup() {
      return { args, Plus };
    },
    template: `
      <div class="grid min-h-48 place-items-center p-12">
        <Button
          :variant="args.variant"
          :size="args.size"
          :disabled="args.disabled"
          :aria-label="args.size.startsWith('icon') ? args.label : undefined"
        >
          <Icon v-if="args.size.startsWith('icon')" :icon="Plus" />
          <template v-else>{{ args.label }}</template>
        </Button>
      </div>
    `,
  }),
} satisfies Meta<ButtonStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default button, with every prop as a control. */
export const Playground: Story = {};

/**
 * Every variant at every size, with icons, disabled and as a link, on the dark scheme and on
 * paper side by side.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the same sheet in both schemes, so the two can be compared row by row.
   */
  render: () => ({
    components: { Button, Icon },
    /**
     * Exposes the variant and size lists and the glyphs to the template.
     */
    setup() {
      return { variants, textSizes, iconSizes, ArrowRight, Plus, schemes: ['dark', 'paper'] };
    },
    template: `
      <div class="grid md:grid-cols-2">
        <section
          v-for="scheme in schemes"
          :key="scheme"
          :class="scheme"
          class="flex flex-col gap-8 p-10"
        >
          <p class="label">.{{ scheme }}</p>

          <div v-for="variant in variants" :key="variant" class="flex flex-col gap-3">
            <p class="font-mono text-caption text-muted-foreground">{{ variant }}</p>
            <div class="flex flex-wrap items-center gap-3">
              <Button v-for="size in textSizes" :key="size" :variant="variant" :size="size">
                {{ size === 'default' ? 'Button' : size }}
              </Button>
              <Button :variant="variant">
                Continue <Icon :icon="ArrowRight" />
              </Button>
              <Button
                v-for="size in iconSizes"
                :key="size"
                :variant="variant"
                :size="size"
                :aria-label="'Add (' + size + ')'"
              >
                <Icon :icon="Plus" />
              </Button>
              <Button :variant="variant" disabled>Disabled</Button>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <p class="font-mono text-caption text-muted-foreground">as-child</p>
            <div class="flex flex-wrap items-center gap-3">
              <Button as-child>
                <a href="#">A link styled as a button</a>
              </Button>
              <Button variant="outline" aria-invalid="true">Invalid</Button>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
