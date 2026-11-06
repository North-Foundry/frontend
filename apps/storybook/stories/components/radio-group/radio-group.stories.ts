/**
 * Stories for the shadcn-vue radio group on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import { Label, RadioGroup, RadioGroupItem } from '@north-foundry/ui';

type RadioValue = 'standard' | 'express' | 'pickup';

interface RadioGroupStoryArgs {
  value: RadioValue;
  disabled: boolean;
  expressDisabled: boolean;
  required: boolean;
  invalid: boolean;
  orientation: 'vertical' | 'horizontal';
  loop: boolean;
  dir: 'ltr' | 'rtl';
}

/**
 * A radio group with native attributes and its current selection available as controls.
 */
const meta = {
  title: 'Components/Radio Group',
  args: {
    value: 'standard',
    disabled: false,
    expressDisabled: false,
    required: false,
    invalid: false,
    orientation: 'vertical',
    loop: true,
    dir: 'ltr',
  },
  argTypes: {
    value: {
      control: 'inline-radio',
      options: ['standard', 'express', 'pickup'],
    },
    disabled: { control: 'boolean' },
    expressDisabled: { control: 'boolean', name: 'express disabled' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    loop: { control: 'boolean' },
    dir: {
      control: 'inline-radio',
      options: ['ltr', 'rtl'],
    },
  },
  /**
   * Frames the selectable delivery options and their live model value.
   */
  render: (args) => ({
    components: { Label, RadioGroup, RadioGroupItem },
    /**
     * Provides a real v-model and syncs value changes made through Storybook controls.
     */
    setup() {
      const value = ref<RadioValue>(args.value);
      watch(() => args.value, (nextValue) => {
        value.value = nextValue;
      });
      return { args, value };
    },
    template: `
      <div class="mx-auto grid min-h-56 w-full max-w-2xl place-items-center p-6 sm:p-8">
        <div class="w-full min-w-0 space-y-4">
          <RadioGroup
            id="radio-group-playground"
            v-model="value"
            name="delivery-playground"
            aria-label="Delivery method"
            :disabled="args.disabled"
            :required="args.required"
            :orientation="args.orientation"
            :loop="args.loop"
            :dir="args.dir"
            :aria-invalid="args.invalid || undefined"
            aria-describedby="radio-group-playground-description"
            :class="args.orientation === 'horizontal' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'grid gap-3'"
          >
            <div class="flex items-center gap-3">
              <RadioGroupItem id="radio-group-playground-standard" value="standard" :aria-invalid="args.invalid || undefined" />
              <Label for="radio-group-playground-standard">Standard</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem id="radio-group-playground-express" value="express" :disabled="args.expressDisabled" :aria-invalid="args.invalid || undefined" />
              <Label for="radio-group-playground-express">Express</Label>
            </div>
            <div class="flex items-center gap-3">
              <RadioGroupItem id="radio-group-playground-pickup" value="pickup" :aria-invalid="args.invalid || undefined" />
              <Label for="radio-group-playground-pickup">Pickup</Label>
            </div>
          </RadioGroup>
          <p id="radio-group-playground-description" class="text-sm text-muted-foreground">Current value: {{ value }}</p>
        </div>
      </div>
    `,
  }),
} satisfies Meta<RadioGroupStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A controlled radio group with selection, availability and direction controls. */
export const Playground: Story = {
  parameters: { layout: 'fullscreen' },
};

/** Default, disabled, individually disabled and invalid groups on dark and paper. */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats radio group states in both schemes with distinct IDs and native names.
   */
  render: () => ({
    components: { Label, RadioGroup, RadioGroupItem },
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

          <div class="grid gap-8 sm:grid-cols-2">
            <div class="space-y-3">
              <p class="text-sm font-medium text-foreground">Default</p>
              <RadioGroup :id="'radio-default-' + scheme" :name="'delivery-default-' + scheme" default-value="standard" :aria-label="'Default delivery method ' + scheme">
                <div class="grid gap-3">
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-default-standard-' + scheme" value="standard" />
                    <Label :for="'radio-default-standard-' + scheme">Standard</Label>
                  </div>
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-default-express-' + scheme" value="express" />
                    <Label :for="'radio-default-express-' + scheme">Express</Label>
                  </div>
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-default-pickup-' + scheme" value="pickup" />
                    <Label :for="'radio-default-pickup-' + scheme">Pickup</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-foreground">Disabled group</p>
              <RadioGroup :id="'radio-disabled-' + scheme" :name="'delivery-disabled-' + scheme" default-value="standard" disabled :aria-label="'Disabled delivery method ' + scheme">
                <div class="grid gap-3">
                  <div class="group flex items-center gap-3" data-disabled="true">
                    <RadioGroupItem :id="'radio-disabled-standard-' + scheme" value="standard" />
                    <Label :for="'radio-disabled-standard-' + scheme">Standard</Label>
                  </div>
                  <div class="group flex items-center gap-3" data-disabled="true">
                    <RadioGroupItem :id="'radio-disabled-express-' + scheme" value="express" />
                    <Label :for="'radio-disabled-express-' + scheme">Express</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-foreground">Individually disabled option</p>
              <RadioGroup :id="'radio-option-disabled-' + scheme" :name="'delivery-option-disabled-' + scheme" default-value="standard" :aria-label="'Delivery with unavailable express option ' + scheme">
                <div class="grid gap-3">
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-option-standard-' + scheme" value="standard" />
                    <Label :for="'radio-option-standard-' + scheme">Standard</Label>
                  </div>
                  <div class="group flex items-center gap-3" data-disabled="true">
                    <RadioGroupItem :id="'radio-option-express-' + scheme" value="express" disabled />
                    <Label :for="'radio-option-express-' + scheme">Express</Label>
                  </div>
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-option-pickup-' + scheme" value="pickup" />
                    <Label :for="'radio-option-pickup-' + scheme">Pickup</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-3">
              <p class="text-sm font-medium text-foreground">Invalid</p>
              <RadioGroup
                :id="'radio-invalid-' + scheme"
                :name="'delivery-invalid-' + scheme"
                default-value="standard"
                :aria-label="'Delivery method ' + scheme"
                aria-invalid="true"
                :aria-describedby="'radio-invalid-error-' + scheme"
              >
                <div class="grid gap-3">
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-invalid-standard-' + scheme" value="standard" aria-invalid="true" />
                    <Label :for="'radio-invalid-standard-' + scheme">Standard</Label>
                  </div>
                  <div class="flex items-center gap-3">
                    <RadioGroupItem :id="'radio-invalid-express-' + scheme" value="express" aria-invalid="true" />
                    <Label :for="'radio-invalid-express-' + scheme">Express</Label>
                  </div>
                </div>
              </RadioGroup>
              <p :id="'radio-invalid-error-' + scheme" class="text-sm text-destructive">Choose an available delivery method.</p>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
