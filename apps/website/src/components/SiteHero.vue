<script setup lang="ts">
import { DitherUnderlay } from '@north-foundry/ui/dither-underlay';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { mountDitherShadow } from '../lib/dither-shadow';
import { useTypewriter } from '../lib/typewriter';

/**
 * The homepage hero, ported from the MagicPath design (Project 7, "North Foundry — Homepage") and
 * set on the site's dark ground instead of the source's paper: the headline is live serif text,
 * and its extruded shadow is dithered onto a canvas behind it in a cool blue ramp.
 */
/**
 * What should exist, one word at a time. The first word is the one rendered on the server, shown
 * when motion is reduced and read out by screen readers.
 */
const TYPED_WORDS = ['tools', 'apps', 'services'] as const;

/** `null` marks the slot where the typewriter cycles through `TYPED_WORDS`. */
const lines = [
  { words: ['Some', null], indent: '' },
  { words: ['should', 'exist.'], indent: 'md:pl-[2.1em]' },
  { words: ['So', 'we', 'build', 'them.'], indent: 'italic font-normal md:pl-[0.9em]' },
] as const;

/**
 * Darkest first: the shadow fades out into the night ground and brightens toward the letters.
 * The values are the `--nf-navy-800`, `--nf-navy-700`, `--nf-navy-500` and `--nf-blue-600`
 * primitives; the hero is always dark, so it does not follow the colour scheme.
 */
const SHADOW_PALETTE = ['#18222d', '#25384c', '#3b5d84', '#5b8fd6'] as const;

/**
 * The halo kept clear of the background field around the words, in the `--nf-graphite-950`
 * ground, so the dots never crowd the letters or their extruded shadow.
 */
const KNOCKOUT = { colour: '#0a0d11', radius: 64 } as const;

const { text: typed, caret } = useTypewriter(TYPED_WORDS);

const section = ref<HTMLElement | null>(null);
/** The canvases fade in once the display fonts are drawn, instead of popping in at hydration. */
const revealed = ref(false);
const canvas = ref<HTMLCanvasElement | null>(null);

let unmount: (() => void) | null = null;

onMounted(() => {
  if (section.value && canvas.value) {
    document.fonts.ready.then(() => requestAnimationFrame(() => (revealed.value = true)));
    unmount = mountDitherShadow(section.value, canvas.value, SHADOW_PALETTE, { black: 0.04, gamma: 1.15 }, KNOCKOUT);
  }
});

onBeforeUnmount(() => unmount?.());
</script>

<template>
  <!-- The section runs up under the fixed navbar, so the dither field shows through its glass. -->
  <section
    id="top"
    ref="section"
    aria-labelledby="nf-hero"
    class="relative -mt-16 overflow-hidden md:-mt-22"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 transition-opacity duration-700"
      :class="revealed ? 'opacity-100' : 'opacity-0'"
    >
      <!-- A quiet field of dots behind the headline, kept faint so the extruded shadow still leads. -->
      <DitherUnderlay
        position="top"
        animation="interference"
        :depth="1100"
        :pixel-size="2"
        :intensity="0.8"
        :duration="24"
        color="var(--nf-blue-600)"
        class="opacity-15 mask-[radial-gradient(ellipse_85%_90%_at_50%_20%,#000_35%,transparent_85%)]"
      />

      <canvas ref="canvas" class="absolute inset-0 h-full w-full [image-rendering:pixelated]"></canvas>
    </div>

    <div class="relative mx-auto w-full max-w-360 px-5 pt-32 pb-24 md:px-10 md:pt-46 md:pb-32 xl:px-16 xl:pt-50">
      <h1
        id="nf-hero"
        class="serif text-[clamp(36px,calc(15vw-6px),78px)] leading-[0.94] md:text-[clamp(52px,10.2vw,150px)] font-[480] tracking-[-0.035em] text-foreground"
      >
        <span v-for="(line, index) in lines" :key="index" class="block" :class="line.indent">
          <!-- One line, so the only space between words is the one rendered here. -->
          <template v-for="(word, position) in line.words" :key="position"
            ><span v-if="word !== null" data-shadow-word class="inline-block">{{ word }}</span
            ><template v-else
              ><span class="sr-only">{{ TYPED_WORDS[0] }}</span
              ><span aria-hidden="true" class="inline-block whitespace-nowrap"
                ><span data-shadow-word class="inline-block">{{ typed }}</span
                ><!-- Painted by the shadow canvas; this box only holds its place. --><span
                  :data-shadow-caret="caret ? 'on' : 'off'"
                  class="ml-[0.06em] inline-block h-[0.7em] w-[0.3em]"
                ></span></span></template
            >{{ position < line.words.length - 1 ? ' ' : '' }}</template
          >
        </span>
      </h1>

      <div class="mt-20 grid grid-cols-1 gap-10 md:mt-28 md:grid-cols-12">
        <a href="/#projects" class="group self-end md:col-span-4 md:col-start-1">
          <span class="block text-[13px] tracking-[0.08em] text-faint-foreground uppercase">On the bench</span>
          <span class="mt-2 block text-[17px] leading-snug text-foreground">
            <span class="serif text-[22px] italic">Sandpost</span>{{ ' ' }}<span class="mono text-[14px]">0.2.0-alpha.1</span>
            <span class="block text-muted-foreground">
              The first public alphas are out.
              <span class="inline-block text-signal transition-transform group-hover:translate-x-1">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  class="inline-block h-[0.8em] w-[0.8em] translate-y-px"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.4"
                >
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </span>
            </span>
          </span>
        </a>

        <div class="md:col-span-5 md:col-start-8">
          <p class="text-[clamp(18px,1.45vw,21px)] leading-normal text-foreground">
            North Foundry is an independent software laboratory in Europe. We design, build and share
            software shaped by curiosity, engineering and real problems, and we keep looking after what
            we release.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
