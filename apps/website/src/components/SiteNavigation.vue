<script setup lang="ts">
import { NorthArrow } from '@north-foundry/ui';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { mountDitherClearing } from '../lib/dither-shadow';
import { site, type NavItem } from '../lib/site';

/**
 * The site navbar, ported from the MagicPath design (Project 7, "North Foundry — Homepage") and
 * adjusted on request: the north arrow carries the brand on the left, every entry sits on the
 * right, and the Sandpost pill is gone.
 *
 * Behaviour from the source is kept: the bar tightens and gains a rule on scroll, links carry a
 * signal dot that follows the section in view, the bar takes the ground of the band passing under
 * it (`data-nav-ground="paper"`), and below `md` the entries collapse into a full-height menu with
 * large serif links.
 */
const props = defineProps<{
  items: readonly NavItem[];
  currentPath?: string;
}>();

/**
 * The halo kept clear of the hero's dither field around the logo and links, half the headline's
 * reach, in the `--nf-graphite-950` ground the hero sits on.
 */
const CLEARING = { colour: '#0a0d11', reach: 32 } as const;

const header = ref<HTMLElement | null>(null);
const clearing = ref<HTMLCanvasElement | null>(null);
/** Set once the bar is live, so the canvas-drawn logo fades in instead of popping. */
const mounted = ref(false);
const scrolled = ref(false);
const menuOpen = ref(false);
const onPaper = ref(false);
const active = ref<string | null>(null);
/**
 * Set once the scroll position of the page is known. Until then the bar is hidden and nothing in
 * it animates, so a reload halfway down the page does not show the top-of-page bar first.
 */
const settled = ref(false);

/** The open menu covers the page, so it keeps the site's own ground whatever lies beneath. */
const paper = computed(() => onPaper.value && !menuOpen.value);

let frame = 0;
let settleTimer: ReturnType<typeof setTimeout> | undefined;
let unclear: (() => void) | null = null;

/**
 * Measures the sections directly on every scroll frame. An IntersectionObserver reported the
 * band one section late inside embeds, so the colour switch now reads positions instead.
 */
function measure(): void {
  frame = 0;
  scrolled.value = window.scrollY > 4;

  // The bar matches the band its lower edge is over, so there is never a hard cut beneath it.
  const edge = header.value?.getBoundingClientRect().bottom ?? 64;
  onPaper.value = Array.from(document.querySelectorAll('[data-nav-ground="paper"]')).some((band) => {
    const box = band.getBoundingClientRect();
    return box.top <= edge && box.bottom > edge;
  });

  // The dot marks the section across the middle of the viewport, and nothing at the very top.
  const middle = window.innerHeight * 0.5;
  const current = scrolled.value
    ? props.items.find((item) => {
        const box = document.getElementById(sectionOf(item.href))?.getBoundingClientRect();
        return !!box && box.top <= middle && box.bottom > middle;
      })
    : undefined;
  active.value = current ? sectionOf(current.href) : null;
}

function schedule(): void {
  if (!frame) {
    frame = requestAnimationFrame(measure);
  }
}

/**
 * Measures the bar in its final state and reveals it on the next frame. Runs once, on the first of:
 * the browser restoring the scroll position of a reload or jumping to a fragment (a scroll event),
 * the page finishing loading, or a short fallback timeout.
 */
function settle(): void {
  if (settled.value) {
    return;
  }
  clearTimeout(settleTimer);
  window.removeEventListener('scroll', settle);
  window.removeEventListener('load', settle);
  measure();
  requestAnimationFrame(() => {
    settled.value = true;
  });
}

/** Escape closes the mobile menu, as in the source. */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    menuOpen.value = false;
  }
}

onMounted(() => {
  if (header.value && clearing.value) {
    unclear = mountDitherClearing(header.value, clearing.value, CLEARING.colour, CLEARING.reach);
  }
  mounted.value = true;
  measure();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('keydown', onKeydown);

  window.addEventListener('scroll', settle, { passive: true });
  if (document.readyState === 'complete') {
    requestAnimationFrame(settle);
  } else {
    window.addEventListener('load', settle);
  }
  settleTimer = setTimeout(settle, 600);
});

onBeforeUnmount(() => {
  clearTimeout(settleTimer);
  window.removeEventListener('scroll', settle);
  window.removeEventListener('load', settle);
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  window.removeEventListener('keydown', onKeydown);
  cancelAnimationFrame(frame);
  unclear?.();
});

/** `/#projects` -> `projects`, so the dot can compare entries with the live section. */
function sectionOf(href: string): string {
  return href.split('#')[1] ?? '';
}

/** On the homepage the logo returns to the top; on any other page it leads home. */
const homeHref = computed(() => (props.currentPath && props.currentPath !== '/' ? '/' : '#top'));
</script>

<template>
  <!--
    At the top of the page the bar has no ground of its own: the hero's dither field shows through
    a very soft blur that fades out toward the bar's lower edge, so there is no seam. Once the page
    moves, a frosted layer on the page's own ground fades in with a rule beneath it. Over a paper
    band it takes the `paper` ground, which remaps every token it reads. The open mobile menu stays
    solid, because it covers the page and needs a readable ground.

    Each blur lives on its own layer, so the header itself never becomes a backdrop root that would
    hide the page from the other. Between them, a canvas clears a dithered halo in the hero's ground
    around the logo and links; it lives in the bar so it follows the bar's height as it animates, and
    runs 64px below it so the halo, which reaches about 54px past the links, dithers out on its own
    instead of being cut at the bar's lower edge.
  -->
  <header
    ref="header"
    data-site-nav
    class="fixed inset-x-0 top-0 z-40 w-full border-b text-foreground transition-[background-color,border-color,color,opacity] duration-300"
    :class="[
      { paper },
      settled ? 'opacity-100' : 'opacity-0 transition-none! **:transition-none!',
      scrolled || menuOpen ? 'border-rule' : 'border-transparent',
      menuOpen ? 'bg-background' : 'bg-transparent',
    ]"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[3px] transition-opacity duration-300 mask-[linear-gradient(to_bottom,#000_35%,transparent)]"
      :class="scrolled || menuOpen ? 'opacity-0' : 'opacity-100'"
    ></div>
    <canvas
      ref="clearing"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+64px)] w-full transition-opacity duration-300 [image-rendering:pixelated]"
      :class="scrolled || menuOpen ? 'opacity-0' : 'opacity-100'"
    ></canvas>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-background/70 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-300"
      :class="scrolled && !menuOpen ? 'opacity-100' : 'opacity-0'"
    ></div>

    <div
      class="mx-auto flex w-full max-w-360 items-center justify-between gap-6 px-5 transition-[height] duration-300 md:px-10 xl:px-16"
      :class="scrolled ? 'h-16' : 'h-16 md:h-22'"
    >
      <!-- `data-shadow-clear` keeps the hero's dither field clear around the logo and the links. -->
      <a
        :href="homeHref"
        aria-label="North Foundry — home"
        data-shadow-clear
        class="flex items-center transition-opacity duration-700"
        :class="mounted ? 'opacity-100' : 'opacity-0'"
        @click="menuOpen = false"
      >
        <NorthArrow :size="64" :cell="1" :ground="paper ? 'light' : 'dark'" animated />
      </a>

      <div data-shadow-clear class="flex items-center gap-2">
        <nav aria-label="Primary" class="hidden items-center gap-1 md:flex">
          <a
            v-for="item in items"
            :key="item.href"
            :href="item.href"
            :aria-current="active === sectionOf(item.href) ? 'location' : undefined"
            class="group relative flex h-9 items-center gap-2 px-3.5 text-[14.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span
              aria-hidden="true"
              class="h-1.25 w-1.25 bg-signal transition-all duration-300"
              :class="active === sectionOf(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'"
            ></span>
            {{ item.label }}
          </a>
        </nav>

        <a
          :href="site.github"
          rel="noreferrer"
          aria-label="North Foundry on GitHub"
          class="hidden h-9 w-9 items-center justify-center rounded-[3px] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground md:flex"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4.5 w-4.5" fill="currentColor">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
          </svg>
        </a>

        <button
          type="button"
          class="flex h-9 items-center gap-2.5 text-[14.5px] font-medium md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="nf-mobile-nav"
          @click="menuOpen = !menuOpen"
        >
          <span aria-hidden="true" class="relative block h-2.25 w-4.5">
            <span
              class="absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300"
              :class="menuOpen ? 'top-1 rotate-45' : 'top-0'"
            ></span>
            <span
              class="absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-300"
              :class="menuOpen ? 'top-1 -rotate-45' : 'top-[7.5px]'"
            ></span>
          </span>
          {{ menuOpen ? 'Close' : 'Menu' }}
        </button>
      </div>
    </div>

    <nav
      v-if="menuOpen"
      id="nf-mobile-nav"
      aria-label="Primary"
      class="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-rule bg-background px-5 pt-4 pb-10 text-foreground md:hidden"
    >
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        class="serif flex items-baseline justify-between border-b border-rule py-4 text-[34px] leading-none tracking-[-0.02em]"
        @click="menuOpen = false"
      >
        {{ item.label }}
        <span class="text-[18px] text-signal">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            class="inline-block h-[0.8em] w-[0.8em] -translate-y-px"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
          >
            <path d="M5 11 11 5M6 5h5v5" />
          </svg>
        </span>
      </a>

      <a
        :href="site.github"
        rel="noreferrer"
        class="serif flex items-baseline justify-between border-b border-rule py-4 text-[34px] leading-none tracking-[-0.02em]"
        @click="menuOpen = false"
      >
        GitHub
        <span class="text-[18px] text-signal">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            class="inline-block h-[0.8em] w-[0.8em] -translate-y-px"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
          >
            <path d="M5 11 11 5M6 5h5v5" />
          </svg>
        </span>
      </a>
    </nav>
  </header>

  <!--
    The header is fixed so its height transition cannot reflow the page; this spacer holds the
    tallest height and keeps the content from jumping under the pointer while scrolling.
  -->
  <div aria-hidden="true" class="h-16 md:h-22"></div>
</template>
