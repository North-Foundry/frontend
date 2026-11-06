/**
 * Stories for the native input on the North Foundry theme.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref, watch } from 'vue';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@north-foundry/ui';

interface InputStoryArgs {
  type: string;
  value: string | number;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  invalid: boolean;
}

const components = { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea };

/**
 * A single input with its native attributes as controls, on the scheme picked in the Backgrounds
 * toolbar.
 */
const meta = {
  title: 'Components/Input',
  args: {
    type: 'text',
    value: '',
    placeholder: 'Add a short title',
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    type: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  /**
   * Frames the field and its live model value.
   */
  render: (args) => ({
    components: { Input, Label },
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
      <div class="mx-auto grid min-h-56 w-full max-w-2xl place-items-center p-6 sm:p-8">
        <div class="w-full min-w-0 space-y-2">
          <Label for="input-playground">Title</Label>
          <Input
            id="input-playground"
            v-model="value"
            :type="args.type"
            :placeholder="args.placeholder"
            :disabled="args.disabled"
            :readonly="args.readonly"
            :required="args.required"
            :aria-invalid="args.invalid || undefined"
            aria-describedby="input-playground-help"
          />
          <p id="input-playground-help" class="wrap-anywhere whitespace-pre-wrap text-sm text-muted-foreground">Current value: {{ value === '' ? '—' : value }}</p>
        </div>
      </div>
    `,
  }),
} satisfies Meta<InputStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A wider input with native attributes and its model value available as controls. */
export const Playground: Story = {
  parameters: { layout: 'fullscreen' },
};

/**
 * Default, filled, disabled, read-only and invalid fields on dark and paper, plus a compact
 * composition that uses the shared field, select, label and button components.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats each field state in both schemes and shows the components together in a small form.
   */
  render: () => ({
    components,
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
              <Label :for="'input-default-' + scheme">Default</Label>
              <Input :id="'input-default-' + scheme" placeholder="Add a title" :aria-describedby="'input-default-help-' + scheme" />
              <p :id="'input-default-help-' + scheme" class="text-sm text-muted-foreground">A short, descriptive title.</p>
            </div>

            <div class="space-y-2">
              <Label :for="'input-filled-' + scheme">Filled</Label>
              <Input :id="'input-filled-' + scheme" default-value="North Foundry" />
            </div>

            <div class="group space-y-2" data-disabled="true">
              <Label :for="'input-disabled-' + scheme">Disabled</Label>
              <Input :id="'input-disabled-' + scheme" default-value="Unavailable" disabled />
            </div>

            <div class="space-y-2">
              <Label :for="'input-readonly-' + scheme">Read-only</Label>
              <Input :id="'input-readonly-' + scheme" default-value="Reference 2048" readonly />
            </div>

            <div class="space-y-2">
              <Label :for="'input-invalid-' + scheme">Invalid</Label>
              <Input
                :id="'input-invalid-' + scheme"
                model-value="not-an-email"
                type="email"
                aria-invalid="true"
                :aria-describedby="'input-invalid-error-' + scheme"
              />
              <p :id="'input-invalid-error-' + scheme" class="text-sm text-destructive">Enter a valid email address.</p>
            </div>
          </div>

          <div class="max-w-xl space-y-5">
            <div>
              <h2 class="text-base font-semibold text-foreground">Field composition</h2>
              <p class="mt-1 text-sm text-muted-foreground">Labels and controls share one quiet type scale.</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label :for="'composition-title-' + scheme">Project title</Label>
                <Input :id="'composition-title-' + scheme" placeholder="A name for this project" />
              </div>
              <div class="space-y-2">
                <Label :for="'composition-material-' + scheme">Material</Label>
                <Select default-value="paper">
                  <SelectTrigger :id="'composition-material-' + scheme" class="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">Paper</SelectItem>
                    <SelectItem value="linen">Linen</SelectItem>
                    <SelectItem value="board">Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <Label :for="'composition-notes-' + scheme">Notes</Label>
                <Textarea :id="'composition-notes-' + scheme" rows="2" placeholder="Add a little context" />
              </div>
            </div>
            <Button type="button" variant="secondary">Continue editing</Button>
          </div>
        </section>
      </div>
    `,
  }),
};
