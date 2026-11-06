/**
 * Stories for the shadcn-vue badge on the North Foundry theme.
 *
 * Badges use a 2px radius to stay quieter than 4px controls such as buttons.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Badge, type BadgeVariants, Button } from '@north-foundry/ui';

type Variant = NonNullable<BadgeVariants['variant']>;

interface BadgeStoryArgs {
  variant: Variant;
  label: string;
}

const variants: Variant[] = ['default', 'secondary', 'destructive', 'outline'];

/**
 * A single badge with every story control, on the scheme picked in the Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Badge',
  args: {
    variant: 'default',
    label: 'New',
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    label: { control: 'text' },
  },
  /**
   * Centres the badge on the canvas.
   */
  render: (args) => ({
    components: { Badge },
    /**
     * Exposes the story args to the template.
     */
    setup() {
      return { args };
    },
    template: `
      <div class="grid min-h-48 place-items-center p-12">
        <Badge :variant="args.variant">{{ args.label }}</Badge>
      </div>
    `,
  }),
} satisfies Meta<BadgeStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default badge, with variant and label controls. */
export const Playground: Story = {};

/**
 * All badge variants, including icon, numeric, invalid and link examples, on both schemes.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the badge examples in both schemes so they can be compared side by side.
   */
  render: () => ({
    components: { Badge },
    /**
     * Exposes the variant list and schemes to the template.
     */
    setup() {
      return { variants, schemes: ['dark', 'paper'] };
    },
    template: `
      <div>
        <header class="space-y-2 p-6 md:p-10">
          <h1 class="text-title">Badge variants</h1>
          <p class="text-sm text-muted-foreground">Labels, icons, counts and links on both colour schemes.</p>
        </header>
        <div class="grid md:grid-cols-2">
          <section
            v-for="scheme in schemes"
            :key="scheme"
            :class="scheme"
            class="flex flex-col gap-8 p-6 md:p-10"
          >
            <h2 class="text-title capitalize">{{ scheme }}</h2>

            <div v-for="variant in variants" :key="variant" class="flex flex-col gap-3">
              <h3 class="text-sm text-muted-foreground capitalize">{{ variant }}</h3>
              <div class="flex flex-wrap items-center gap-3">
                <Badge :variant="variant">{{ variant }}</Badge>
                <Badge :variant="variant">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  Verified
                </Badge>
                <Badge :variant="variant">8</Badge>
                <Badge :variant="variant">99+</Badge>
                <Badge :variant="variant" aria-invalid="true">Invalid</Badge>
                <Badge :variant="variant" as-child>
                  <a href="https://example.com">Linked badge</a>
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    `,
  }),
};

/**
 * Shows the 2px badge radius beside common class overrides, including the 4px control radius.
 */
export const Rounding: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Compares the default badge shape and radius utility overrides on both schemes.
   */
  render: () => ({
    components: { Badge, Button },
    /**
     * Exposes the radius examples and schemes to the template.
     */
    setup() {
      return {
        schemes: ['dark', 'paper'],
        examples: [
          { label: 'rounded-none', className: 'rounded-none' },
          { label: 'default · 2px', className: '' },
          { label: 'rounded-md · 4px', className: 'rounded-md' },
          { label: 'rounded-full', className: 'rounded-full' },
        ],
      };
    },
    template: `
      <div>
        <header class="space-y-2 p-6 md:p-10">
          <h1 class="text-title">Badge rounding</h1>
          <p class="text-sm text-muted-foreground">Use 2px for compact labels, 4px for controls, and pill shapes for counters.</p>
        </header>
        <div class="grid md:grid-cols-2">
          <section
            v-for="scheme in schemes"
            :key="scheme"
            :class="scheme"
            class="flex flex-col gap-8 p-6 md:p-10"
          >
            <h2 class="text-title capitalize">{{ scheme }}</h2>
            <div class="flex flex-wrap items-center gap-6">
              <div v-for="example in examples" :key="example.label" class="flex flex-col gap-3">
                <Badge :class="example.className">Badge</Badge>
                <span class="text-sm text-muted-foreground">{{ example.label }}</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <Badge>Label · 2px</Badge>
              <Button variant="outline" size="sm">Control · 4px</Button>
              <Badge class="h-5 min-w-5 rounded-full px-1 tabular-nums" aria-label="8 notifications">8</Badge>
            </div>
          </section>
        </div>
      </div>
    `,
  }),
};
