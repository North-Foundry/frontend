import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { NorthArrow } from '@north-foundry/ui';

interface Swatch {
  name: string;
  hex: string;
  value: string;
}

/**
 * A short composition that puts the North Foundry tokens next to each other: ground, ink, rule,
 * signal and the single error colour, with the mark and the two faces the system is drawn in.
 *
 * It exists to judge the palette as a whole — how much air the blue takes, whether the rules hold
 * the page together — not to show a product screen.
 */
const meta = {
  title: 'Theme/Palette',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { NorthArrow },
    setup() {
      const swatches: Swatch[] = [
        { name: 'Ground', hex: '#0A0D11', value: 'var(--background)' },
        { name: 'Ink', hex: '#EEF1F5', value: 'var(--foreground)' },
        { name: 'Rule', hex: '#3A4A5C', value: 'var(--rule)' },
        { name: 'Signal', hex: '#9FD3FF', value: 'var(--signal)' },
        { name: 'Error', hex: '#E8877D', value: 'var(--nf-red-400)' },
      ];
      return { swatches };
    },
    template: `
      <div class="grid min-h-screen place-items-center p-10" style="background: var(--nf-graphite-950)">
        <section
          class="w-full max-w-190 min-w-0 overflow-hidden rounded-sm border border-rule"
          style="background: var(--background)"
        >
          <header class="flex items-baseline justify-between gap-6 px-10 pt-8">
            <p class="font-mono text-micro uppercase tracking-label text-faint-foreground">
              North Foundry — design system
            </p>
            <p class="font-mono text-micro uppercase tracking-label text-signal">v0.1</p>
          </header>

          <div class="grid items-center gap-8 px-10 pt-10 pb-10 md:grid-cols-[1.35fr_0.65fr]">
            <div class="flex flex-col gap-5">
              <h1
                class="text-display font-medium tracking-tight text-foreground"
                style="line-height: var(--nf-leading-tight)"
              >
                Graphite, and one blue.
              </h1>
              <p class="max-w-[44ch] text-lede text-muted-foreground">
                A dark editorial surface, hairline rules and a single cool accent — the same palette
                the system shares.
              </p>
              <div
                class="mt-2 flex items-center gap-3 font-mono text-micro uppercase tracking-label text-faint-foreground"
              >
                <span class="h-px w-8" style="background: var(--signal)"></span>
                Instrument Sans · IBM Plex Mono
              </div>
            </div>
            <div class="flex justify-center">
              <NorthArrow :size="132" ground="dark" />
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-px border-t border-rule sm:grid-cols-5"
            style="background: var(--rule)"
          >
            <div
              v-for="swatch in swatches"
              :key="swatch.name"
              class="flex flex-col gap-3 px-4 py-4"
              style="background: var(--nf-graphite-950)"
            >
              <span
                class="h-16 rounded-xs"
                :style="{
                  background: swatch.value,
                  boxShadow: 'inset 0 0 0 1px var(--nf-graphite-700)',
                }"
              ></span>
              <span class="font-mono text-micro uppercase tracking-label text-faint-foreground">
                {{ swatch.name }}
              </span>
              <span class="font-mono text-caption text-foreground">{{ swatch.hex }}</span>
            </div>
          </div>

          <footer class="flex items-center justify-between border-t border-rule px-10 py-4">
            <p class="font-mono text-micro text-faint-foreground">shadcn-vue · Tailwind 4</p>
            <p class="font-mono text-micro text-signal">#9FD3FF</p>
          </footer>
        </section>
      </div>
    `,
  }),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The palette on one card: ground, mark, type scale and the five values the system leans on. */
export const Palette: Story = {};
