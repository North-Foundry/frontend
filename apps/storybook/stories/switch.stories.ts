/**
 * Stories for the shadcn-vue switch on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import { Label, Switch } from '@north-foundry/ui';

interface SwitchStoryArgs {
  value: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}

/**
 * A switch with its boolean model and native attributes available as controls.
 */
const meta = {
  title: 'Components/Switch',
  args: {
    value: false,
    disabled: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    value: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  /**
   * Frames the switch and its live boolean model value.
   */
  render: (args) => ({
    components: { Label, Switch },
    /**
     * Provides a real v-model and syncs changes made through the Storybook controls.
     */
    setup() {
      const value = ref(args.value);
      watch(() => args.value, (nextValue) => {
        value.value = nextValue;
      });
      return { args, value };
    },
    template: `
      <div class="mx-auto grid min-h-56 w-full max-w-2xl place-items-center p-6 sm:p-8">
        <div class="grid w-full min-w-0 gap-4">
          <div class="flex items-start gap-3">
            <Switch
              id="switch-playground"
              v-model="value"
              name="studio-updates"
              value="yes"
              :disabled="args.disabled"
              :required="args.required"
              :aria-invalid="args.invalid || undefined"
              aria-describedby="switch-playground-description"
            />
            <div class="grid gap-1">
              <Label for="switch-playground" class="min-h-5">Studio updates</Label>
              <p id="switch-playground-description" class="text-sm text-muted-foreground">Receive occasional notes about new materials and finishes.</p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground">Current value: {{ value }}</p>
        </div>
      </div>
    `,
  }),
} satisfies Meta<SwitchStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A switch with boolean, disabled, required and invalid controls. */
export const Playground: Story = {
  parameters: { layout: 'fullscreen' },
};

/** Unchecked, checked, disabled and invalid states on dark and paper. */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats each switch state in both schemes and includes a label composition.
   */
  render: () => ({
    components: { Label, Switch },
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

          <div class="grid gap-5 lg:grid-cols-2">
            <div class="flex items-center gap-3">
              <Switch :id="'switch-unchecked-' + scheme" :name="'switch-unchecked-' + scheme" />
              <Label :for="'switch-unchecked-' + scheme">Unchecked</Label>
            </div>

            <div class="flex items-center gap-3">
              <Switch :id="'switch-checked-' + scheme" :name="'switch-checked-' + scheme" :default-value="true" />
              <Label :for="'switch-checked-' + scheme">Checked</Label>
            </div>

            <div class="group flex items-center gap-3" data-disabled="true">
              <Switch :id="'switch-disabled-unchecked-' + scheme" :name="'switch-disabled-unchecked-' + scheme" disabled />
              <Label :for="'switch-disabled-unchecked-' + scheme">Disabled unchecked</Label>
            </div>

            <div class="group flex items-center gap-3" data-disabled="true">
              <Switch :id="'switch-disabled-checked-' + scheme" :name="'switch-disabled-checked-' + scheme" :default-value="true" disabled />
              <Label :for="'switch-disabled-checked-' + scheme">Disabled checked</Label>
            </div>

            <div class="flex items-center gap-3">
              <Switch :id="'switch-invalid-unchecked-' + scheme" :name="'switch-invalid-unchecked-' + scheme" aria-invalid="true" />
              <Label :for="'switch-invalid-unchecked-' + scheme">Invalid unchecked</Label>
            </div>

            <div class="flex items-center gap-3">
              <Switch :id="'switch-invalid-checked-' + scheme" :name="'switch-invalid-checked-' + scheme" :default-value="true" aria-invalid="true" />
              <Label :for="'switch-invalid-checked-' + scheme">Invalid checked</Label>
            </div>
          </div>

          <div class="max-w-md">
            <div class="flex items-start gap-3">
              <Switch
                :id="'switch-composition-' + scheme"
                :name="'switch-composition-' + scheme"
                :aria-describedby="'switch-composition-description-' + scheme"
              />
              <div class="grid gap-1">
                <Label :for="'switch-composition-' + scheme" class="min-h-5">Studio updates</Label>
                <p :id="'switch-composition-description-' + scheme" class="text-sm text-muted-foreground">Receive occasional notes about new materials and finishes.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
