/**
 * Stories for the shadcn-vue alert dialog on the North Foundry theme.
 *
 * The backdrop and panel are teleported to `body`, so these stories also check that the dialog
 * keeps the scheme of the band its trigger sits in.
 */
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@north-foundry/ui';

interface AlertDialogStoryArgs {
  title: string;
  description: string;
  action: string;
  cancel: string;
  destructive: boolean;
}

const components = {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
};

/**
 * A single alert dialog with its copy as controls, on the scheme picked in the Backgrounds
 * toolbar. The last choice is shown under the trigger.
 */
const meta = {
  title: 'Components/Alert Dialog',
  args: {
    title: 'Are you absolutely sure?',
    description:
      'This action cannot be undone. This will permanently delete the project and remove its plates from our servers.',
    action: 'Continue',
    cancel: 'Cancel',
    destructive: false,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    action: { control: 'text' },
    cancel: { control: 'text' },
    destructive: { control: 'boolean', description: 'Gives the action the destructive variant.' },
  },
  /**
   * Centres the trigger and the last choice on the canvas.
   */
  render: (args) => ({
    components,
    /**
     * Exposes the story args and the last choice to the template.
     */
    setup() {
      const choice = ref('none yet');
      return { args, choice };
    },
    template: `
      <div class="grid min-h-72 place-items-center content-center gap-4 p-12">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="outline">Show dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ args.title }}</AlertDialogTitle>
              <AlertDialogDescription>{{ args.description }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel @click="choice = 'cancelled'">{{ args.cancel }}</AlertDialogCancel>
              <AlertDialogAction
                :variant="args.destructive ? 'destructive' : 'default'"
                @click="choice = 'confirmed'"
              >
                {{ args.action }}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p class="mono text-caption text-muted-foreground">last choice: {{ choice }}</p>
      </div>
    `,
  }),
} satisfies Meta<AlertDialogStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One alert dialog, with its copy and variant as controls. */
export const Playground: Story = {};

/** A destructive confirmation: the action takes the destructive button variant. */
export const Destructive: Story = {
  args: {
    title: 'Delete this project?',
    description: 'Its plates, notes and share links will be removed. This cannot be undone.',
    action: 'Delete project',
    destructive: true,
  },
};

/**
 * The dialog driven by `v-model:open` instead of a trigger, as when a confirmation follows another
 * action. Without a trigger there is no band to read the scheme from, so the dialog takes the
 * scheme of the page; wrap the opening control in `AlertDialogTrigger` to follow a nested band.
 */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  /**
   * Opens the dialog from a plain button, outside any trigger.
   */
  render: () => ({
    components,
    /**
     * Exposes the open state to the template.
     */
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div class="grid min-h-72 place-items-center content-center gap-4 p-12">
        <Button @click="open = true">Publish plate</Button>
        <p class="mono text-caption text-muted-foreground">open: {{ open }}</p>
        <AlertDialog v-model:open="open">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish to the archive?</AlertDialogTitle>
              <AlertDialogDescription>
                The plate becomes visible to everyone with the archive link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction>Publish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    `,
  }),
};

/**
 * The same dialog opened from a dark band and from a paper band, to compare backdrop and panel on
 * both schemes.
 */
export const Overview: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  /**
   * Repeats the trigger in both schemes.
   */
  render: () => ({
    components,
    /**
     * Exposes the schemes to the template.
     */
    setup() {
      return { schemes: ['dark', 'paper'] };
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

          <div class="flex flex-wrap items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="outline">Confirm</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send the proofs to print?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The press run starts as soon as the proofs arrive. You can still cancel it today.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Send proofs</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Its plates, notes and share links will be removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    `,
  }),
};
