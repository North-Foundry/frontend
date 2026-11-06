import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { NorthArrow } from '@north-foundry/ui';

/**
 * Every colour primitive, by family, in the order of the shared lightness scale.
 */
const families: { name: string; steps: string[] }[] = [
  {
    name: 'graphite',
    steps: ['950', '900', '850', '800', '700', '600', '550', '500', '400', '350', '300', '250', '200', '150', '100', '75', '50', '25'],
  },
  { name: 'navy', steps: ['800', '700', '500'] },
  { name: 'blue', steps: ['800', '750', '700', '600', '500', '400', '350', '300', '200'] },
  { name: 'cyan', steps: ['300'] },
  { name: 'red', steps: ['600', '400'] },
];

/**
 * The scheme-dependent colour tokens, grouped as in the theme file.
 */
const groups: { name: string; tokens: string[] }[] = [
  {
    name: 'Surfaces and text',
    tokens: ['background', 'foreground', 'card', 'muted', 'muted-foreground', 'faint-foreground'],
  },
  {
    name: 'Actions',
    tokens: ['primary', 'primary-foreground', 'secondary', 'accent', 'destructive', 'destructive-foreground'],
  },
  { name: 'Lines and focus', tokens: ['border', 'input', 'ring', 'rule', 'rule-strong'] },
  { name: 'Editorial', tokens: ['signal', 'signal-soft', 'link', 'link-decoration', 'selection', 'annotation'] },
];

const levels = [1, 2, 3, 4, 5];

/**
 * The palette and the semantic contract on one page: primitives on top, then the same tokens in
 * the dark and paper schemes side by side, with the tone ramps and the mark drawn on them.
 */
const meta = {
  title: 'Theme/Tokens',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { NorthArrow },
    setup() {
      const schemes = [
        { name: 'dark', ground: 'dark' as const },
        { name: 'paper', ground: 'light' as const },
      ];
      return { families, groups, levels, schemes };
    },
    template: `
      <div class="flex flex-col gap-12 p-10" style="background: var(--background)">
        <section class="flex flex-col gap-6">
          <p class="label">Primitives</p>
          <div v-for="family in families" :key="family.name" class="flex flex-col gap-2">
            <p class="font-mono text-caption text-muted-foreground">--nf-{{ family.name }}-*</p>
            <div class="flex flex-wrap gap-2">
              <div v-for="step in family.steps" :key="step" class="flex w-16 flex-col gap-1">
                <span
                  class="h-10 rounded-sm"
                  :style="{
                    background: 'var(--nf-' + family.name + '-' + step + ')',
                    boxShadow: 'inset 0 0 0 1px var(--rule)',
                  }"
                ></span>
                <span class="font-mono text-micro text-faint-foreground">{{ step }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-6 md:grid-cols-2">
          <div
            v-for="scheme in schemes"
            :key="scheme.name"
            :class="scheme.name"
            class="flex flex-col gap-6 rounded-sm border border-rule p-6"
          >
            <div class="flex items-center justify-between">
              <p class="label">.{{ scheme.name }}</p>
              <NorthArrow :size="64" :ground="scheme.ground" />
            </div>
            <div v-for="group in groups" :key="group.name" class="flex flex-col gap-2">
              <p class="font-mono text-caption text-muted-foreground">{{ group.name }}</p>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div v-for="token in group.tokens" :key="token" class="flex items-center gap-2">
                  <span
                    class="size-6 shrink-0 rounded-sm"
                    :style="{ background: 'var(--' + token + ')', boxShadow: 'inset 0 0 0 1px var(--rule)' }"
                  ></span>
                  <span class="truncate font-mono text-micro text-foreground">--{{ token }}</span>
                </div>
              </div>
            </div>
            <div v-for="ramp in ['ink', 'signal']" :key="ramp" class="flex flex-col gap-2">
              <p class="font-mono text-caption text-muted-foreground">--tone-{{ ramp }}-1…5</p>
              <div class="grid grid-cols-5 gap-1">
                <span
                  v-for="level in levels"
                  :key="level"
                  class="h-8 rounded-sm"
                  :style="{ background: 'var(--tone-' + ramp + '-' + level + ')' }"
                ></span>
              </div>
            </div>
            <p>
              <a href="#" class="text-link underline decoration-link-decoration underline-offset-4">A link</a>,
              <span class="text-signal">signal text</span> and
              <button class="rounded-md bg-primary px-3 py-1 text-primary-foreground">Primary</button>
            </p>
          </div>
        </section>
      </div>
    `,
  }),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The full palette, then both colour schemes with the same semantic tokens. */
export const Tokens: Story = {};
