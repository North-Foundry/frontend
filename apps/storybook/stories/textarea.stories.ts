/**
 * Stories for the native textarea on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import { Label, Textarea } from '@north-foundry/ui';

interface TextareaStoryArgs {
  value: string | number;
  placeholder: string;
  rows: number;
  autosize: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  invalid: boolean;
}

/**
 * A single textarea with its native attributes as controls, on the scheme picked in the
 * Backgrounds toolbar.
 */
const meta = {
  title: 'Components/Textarea',
  args: {
    value: '',
    placeholder: 'Share a few details',
    rows: 8,
    autosize: true,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    autosize: {
      control: 'boolean',
      description: 'Grow and shrink vertically with the text. Disable to use rows and scrolling.',
    },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  /**
   * Frames the field and its live model value.
   */
  render: (args) => ({
    components: { Label, Textarea },
    /**
     * Provides a real v-model and exposes its current value beneath the field.
     */
    setup() {
      const value = ref<string | number>(args.value);
      watch(() => args.value, (nextValue) => {
        value.value = nextValue;
      });
      return { args, value };
    },
    template: `
      <div class="mx-auto grid min-h-80 w-full max-w-3xl place-items-center p-6 sm:p-8">
        <div class="w-full min-w-0 space-y-2">
          <Label for="textarea-playground">Notes</Label>
          <Textarea
            id="textarea-playground"
            class="min-h-48"
            v-model="value"
            :placeholder="args.placeholder"
            :rows="args.rows"
            :autosize="args.autosize"
            :disabled="args.disabled"
            :readonly="args.readonly"
            :required="args.required"
            :aria-invalid="args.invalid || undefined"
            aria-describedby="textarea-playground-help"
          />
          <p id="textarea-playground-help" class="wrap-anywhere whitespace-pre-wrap text-sm text-muted-foreground">Current value: {{ value === '' ? '—' : value }}</p>
        </div>
      </div>
    `,
  }),
} satisfies Meta<TextareaStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A roomy textarea with native attributes and its model value available as controls. */
export const Playground: Story = {
  parameters: { layout: 'fullscreen' },
};

/**
 * Separate models demonstrate automatic vertical sizing beside native rows and scrolling.
 */
export const Autosize: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Shares each sizing mode's model across schemes while keeping the two modes independent.
   */
  render: () => ({
    components: { Label, Textarea },
    /**
     * Starts with enough lines to overflow the fixed field and expand the autosized field.
     */
    setup() {
      const initialValue = 'A note from the bench.\nKeep the edges clean.\nMatch the existing finish.\nCheck the spacing.\nReview both schemes.\nReady for the next step.';
      const autosizeValue = ref<string | number>(initialValue);
      const fixedValue = ref<string | number>(initialValue);
      return { autosizeValue, fixedValue, schemes: ['dark', 'paper'] };
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
          <p class="text-sm text-muted-foreground">Each sizing mode shares its text across dark and paper.</p>
          <div class="grid gap-6">
            <div class="space-y-2">
              <Label :for="'textarea-autosize-' + scheme">Autosize enabled</Label>
              <Textarea :id="'textarea-autosize-' + scheme" v-model="autosizeValue" autosize />
            </div>
            <div class="space-y-2">
              <Label :for="'textarea-fixed-' + scheme">Autosize disabled</Label>
              <Textarea :id="'textarea-fixed-' + scheme" v-model="fixedValue" :autosize="false" :rows="3" />
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};

/** Default, filled, disabled, read-only and invalid fields on dark and paper. */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats each field state in both schemes for a direct comparison.
   */
  render: () => ({
    components: { Label, Textarea },
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
            <div class="space-y-2">
              <Label :for="'textarea-default-' + scheme">Default</Label>
              <Textarea
                :id="'textarea-default-' + scheme"
                rows="2"
                placeholder="Add a note"
                :aria-describedby="'textarea-default-help-' + scheme"
              />
              <p :id="'textarea-default-help-' + scheme" class="text-sm text-muted-foreground">A couple of useful details.</p>
            </div>

            <div class="space-y-2">
              <Label :for="'textarea-filled-' + scheme">Filled</Label>
              <Textarea :id="'textarea-filled-' + scheme" rows="2" default-value="Keep the finish matte and even." />
            </div>

            <div class="group space-y-2" data-disabled="true">
              <Label :for="'textarea-disabled-' + scheme">Disabled</Label>
              <Textarea :id="'textarea-disabled-' + scheme" rows="2" default-value="Unavailable for editing." disabled />
            </div>

            <div class="space-y-2">
              <Label :for="'textarea-readonly-' + scheme">Read-only</Label>
              <Textarea :id="'textarea-readonly-' + scheme" rows="2" default-value="Approved by the studio." readonly />
            </div>

            <div class="space-y-2">
              <Label :for="'textarea-invalid-' + scheme">Invalid</Label>
              <Textarea
                :id="'textarea-invalid-' + scheme"
                rows="2"
                model-value=""
                required
                aria-invalid="true"
                :aria-describedby="'textarea-invalid-error-' + scheme"
              />
              <p :id="'textarea-invalid-error-' + scheme" class="text-sm text-destructive">Add the project notes before continuing.</p>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
