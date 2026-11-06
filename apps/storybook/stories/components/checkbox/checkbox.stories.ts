/**
 * Stories for the shadcn-vue checkbox on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import { Checkbox, Label } from '@north-foundry/ui';

type CheckboxValue = boolean | 'indeterminate';

interface CheckboxStoryArgs {
  value: CheckboxValue;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
}

/**
 * A single checkbox with its tri-state model and native attributes as controls, on the scheme
 * picked in the Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Checkbox',
  args: {
    value: false,
    disabled: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    value: {
      control: 'inline-radio',
      options: [false, true, 'indeterminate'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  /**
   * Frames the checkbox and its live tri-state model value.
   */
  render: (args) => ({
    components: { Checkbox, Label },
    /**
     * Provides a real v-model and syncs changes made through the Storybook controls.
     */
    setup() {
      const value = ref<CheckboxValue>(args.value);
      watch(() => args.value, (nextValue) => {
        value.value = nextValue;
      });
      return { args, value };
    },
    template: `
      <div class="mx-auto grid min-h-56 w-full max-w-2xl place-items-center p-6 sm:p-8">
        <div class="w-full min-w-0 space-y-3">
          <div class="flex items-start gap-3">
            <Checkbox
              id="checkbox-playground"
              v-model="value"
              name="studio-updates"
              value="yes"
              :disabled="args.disabled"
              :required="args.required"
              :aria-invalid="args.invalid || undefined"
              aria-describedby="checkbox-playground-description"
            />
            <div class="grid gap-1">
              <Label for="checkbox-playground">Studio updates</Label>
              <p id="checkbox-playground-description" class="text-sm text-muted-foreground">Receive occasional notes about new materials and finishes.</p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground">Current value: {{ value }}</p>
        </div>
      </div>
    `,
  }),
} satisfies Meta<CheckboxStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A checkbox with tri-state, disabled, required and invalid controls. */
export const Playground: Story = {
  parameters: { layout: 'fullscreen' },
};

/** Unchecked, checked, indeterminate, disabled and invalid states on dark and paper. */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats each checkbox state in both schemes and includes a short label composition.
   */
  render: () => ({
    components: { Checkbox, Label },
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

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="flex items-start gap-3">
              <Checkbox :id="'checkbox-unchecked-' + scheme" />
              <Label :for="'checkbox-unchecked-' + scheme">Unchecked</Label>
            </div>

            <div class="flex items-start gap-3">
              <Checkbox :id="'checkbox-checked-' + scheme" :default-value="true" />
              <Label :for="'checkbox-checked-' + scheme">Checked</Label>
            </div>

            <div class="flex items-start gap-3">
              <Checkbox :id="'checkbox-indeterminate-' + scheme" default-value="indeterminate" />
              <Label :for="'checkbox-indeterminate-' + scheme">Indeterminate</Label>
            </div>

            <div class="group flex items-start gap-3" data-disabled="true">
              <Checkbox :id="'checkbox-disabled-unchecked-' + scheme" disabled />
              <Label :for="'checkbox-disabled-unchecked-' + scheme">Disabled unchecked</Label>
            </div>

            <div class="group flex items-start gap-3" data-disabled="true">
              <Checkbox :id="'checkbox-disabled-checked-' + scheme" :default-value="true" disabled />
              <Label :for="'checkbox-disabled-checked-' + scheme">Disabled checked</Label>
            </div>

            <div class="flex items-start gap-3">
              <Checkbox :id="'checkbox-invalid-' + scheme" aria-invalid="true" />
              <Label :for="'checkbox-invalid-' + scheme">Invalid</Label>
            </div>
          </div>

          <div class="max-w-md space-y-2">
            <div class="flex items-start gap-3">
              <Checkbox :id="'checkbox-composition-' + scheme" :default-value="true" />
              <div class="grid gap-1">
                <Label :for="'checkbox-composition-' + scheme">Keep me informed</Label>
                <p class="text-sm text-muted-foreground">Get a short monthly note about studio materials.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
