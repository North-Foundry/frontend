/**
 * Stories for the accessible label on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { Input, Label } from '@north-foundry/ui';

interface LabelStoryArgs {
  text: string;
  as: 'label' | 'span';
  asChild: boolean;
}

/**
 * A label with its text and rendered element exposed as controls, on the scheme picked in the
 * Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Label',
  args: {
    text: 'Project title',
    as: 'label',
    asChild: false,
  },
  argTypes: {
    text: { control: 'text' },
    as: { control: 'inline-radio', options: ['label', 'span'] },
    asChild: { control: 'boolean' },
  },
  /**
   * Frames the label beside an enabled input to demonstrate its native association.
   */
  render: (args) => ({
    components: { Input, Label },
    /**
     * Exposes the story controls to the template.
     */
    setup() {
      return { args };
    },
    template: `
      <div class="grid min-h-48 place-items-center p-8">
        <div class="w-full max-w-sm space-y-2">
          <Label
            v-if="!args.asChild"
            :for="args.as === 'label' ? 'label-playground' : undefined"
            :id="args.as === 'span' ? 'label-playground-label' : undefined"
            :as="args.as"
          >{{ args.text }}</Label>
          <Label v-else for="label-playground" as-child>
            <label for="label-playground">{{ args.text }}</label>
          </Label>
          <Input
            id="label-playground"
            placeholder="Add a title"
            :aria-labelledby="args.as === 'span' && !args.asChild ? 'label-playground-label' : undefined"
          />
        </div>
      </div>
    `,
  }),
} satisfies Meta<LabelStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default label with element and as-child controls. */
export const Playground: Story = {};

/** Native label association, alternate rendering and as-child composition on both schemes. */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the label patterns in each scheme and keeps every label tied to a real field.
   */
  render: () => ({
    components: { Input, Label },
    /**
     * Exposes the two scheme names to the comparison template.
     */
    setup() {
      return { schemes: ['dark', 'paper'] };
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
          <div class="max-w-sm space-y-5">
            <div class="space-y-2">
              <Label :for="'label-default-' + scheme">Default label</Label>
              <Input :id="'label-default-' + scheme" placeholder="Click the label to focus" />
            </div>

            <div class="space-y-2">
              <Label :id="'label-span-caption-' + scheme" as="span">Span caption with aria-labelledby</Label>
              <Input
                :id="'label-span-' + scheme"
                placeholder="Named by the caption"
                :aria-labelledby="'label-span-caption-' + scheme"
              />
            </div>

            <div class="space-y-2">
              <Label :for="'label-child-' + scheme" as-child>
                <label :for="'label-child-' + scheme">As child label</label>
              </Label>
              <Input :id="'label-child-' + scheme" placeholder="Click the label to focus" />
            </div>

            <div class="group space-y-2" data-disabled="true">
              <Label :for="'label-disabled-' + scheme">Disabled field label</Label>
              <Input :id="'label-disabled-' + scheme" disabled placeholder="Unavailable" />
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
