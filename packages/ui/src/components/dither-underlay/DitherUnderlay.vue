<script setup lang="ts">
/**
 * Vue owns the elements and props; the mount owns drawing and browser lifecycle.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

import { DITHER_GRADIENT_LEVELS, gradientFilter } from './gradient';
import { DITHER_UNDERLAY_DEFAULTS, underlayLayout } from './layout';
import { mountDitherUnderlay, type DitherUnderlayHandle } from './mount';
import type { DitherUnderlayOptions, DitherUnderlayProps } from './types';

/**
 * Leave position unset here so the deprecated corner prop can still supply it.
 */
const props = withDefaults(defineProps<DitherUnderlayProps & { reactionThickness?: number }>(), {
  ...DITHER_UNDERLAY_DEFAULTS,
  position: undefined,
  gradient: undefined,
  gradientLevels: DITHER_GRADIENT_LEVELS,
});
const canvas = ref<HTMLCanvasElement>();
const host = ref<HTMLDivElement>();
let underlay: DitherUnderlayHandle | undefined;

/**
 * Resolve reactive props into renderer options, preserving the legacy corner fallback.
 */
const options = computed(() => ({
  position: props.position ?? props.corner ?? DITHER_UNDERLAY_DEFAULTS.position,
  animation: props.animation,
  size: props.size,
  depth: props.depth,
  waveShape: props.waveShape,
  waveCount: props.waveCount,
  amplitude: props.amplitude,
  reactionThickness: props.reactionThickness,
  pixelSize: props.pixelSize,
  color: props.color,
  intensity: props.intensity,
  duration: props.duration,
  timescale: props.timescale,
  paused: props.paused,
} satisfies Required<DitherUnderlayOptions>));
/**
 * Keep the canvas placement aligned with the current renderer options.
 */
const placement = computed(() => underlayLayout(options.value).style);
/**
 * A gradient on its own needs no ink texture; any explicit placement brings the texture back.
 */
const ink = computed(() => !props.gradient || props.position !== undefined || props.corner !== undefined);
const filterId = `nf-dither-gradient-${useId()}`;
/**
 * Dither filter parameters for the gradient ground, sharing the texture's grain size.
 */
const filter = computed(() => (props.gradient ? gradientFilter(props.gradientLevels, props.pixelSize) : undefined));

/**
 * Mount the canvas renderer when the texture is shown and release it when it is hidden.
 */
function syncRenderer() {
  if (host.value && canvas.value) {
    underlay ??= mountDitherUnderlay(host.value, canvas.value, options.value);
  } else {
    underlay?.destroy();
    underlay = undefined;
  }
}

onMounted(syncRenderer);
watch(ink, syncRenderer, { flush: 'post' });
/**
 * Forward reactive option changes to the mounted renderer.
 */
watch(options, (next) => underlay?.update(next));
/**
 * Release the renderer when Vue removes this component.
 */
onBeforeUnmount(() => underlay?.destroy());
</script>

<template>
  <div ref="host" class="nf-dither-underlay nf-dither-overlay nf-dither-corner" aria-hidden="true">
    <div
      v-if="filter"
      class="nf-dither-underlay__gradient"
      :class="`nf-dither-underlay__gradient--${gradient}`"
      :style="{ filter: `url(#${filterId})` }"
    >
      <svg class="nf-dither-underlay__defs" width="0" height="0" focusable="false">
        <filter :id="filterId" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feImage
            :href="filter.image"
            x="0"
            y="0"
            :width="filter.tile"
            :height="filter.tile"
            preserveAspectRatio="none"
            result="threshold"
          />
          <feTile in="threshold" result="pattern" />
          <feComposite
            in="SourceGraphic"
            in2="pattern"
            operator="arithmetic"
            k1="0"
            :k2="filter.source"
            :k3="filter.threshold"
            k4="0"
          />
          <feComponentTransfer>
            <feFuncR type="discrete" :tableValues="filter.table" />
            <feFuncG type="discrete" :tableValues="filter.table" />
            <feFuncB type="discrete" :tableValues="filter.table" />
          </feComponentTransfer>
        </filter>
      </svg>
    </div>
    <canvas v-if="ink" ref="canvas" :style="placement" />
  </div>
</template>

<style scoped>
.nf-dither-underlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

/*
 * Each gradient is fixed artwork that looks the same on either colour scheme, so it reads palette
 * primitives directly instead of the semantic tokens that `.paper` remaps.
 */
.nf-dither-underlay__gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-color: var(--nf-graphite-900);
}

.nf-dither-underlay__defs {
  position: absolute;
  width: 0;
  height: 0;
}

.nf-dither-underlay__gradient--graphite {
  background-image:
    radial-gradient(ellipse at 25% 25%, var(--nf-graphite-500), transparent 70%),
    linear-gradient(135deg, var(--nf-graphite-850), var(--nf-graphite-950));
}

.nf-dither-underlay__gradient--slate {
  background-image:
    radial-gradient(ellipse at 25% 30%, var(--nf-graphite-400), transparent 72%),
    linear-gradient(135deg, var(--nf-graphite-500), var(--nf-graphite-900));
}

.nf-dither-underlay__gradient--signal {
  background-image:
    radial-gradient(ellipse at 20% 20%, color-mix(in oklab, var(--nf-blue-400) 65%, var(--nf-graphite-500)), transparent 70%),
    linear-gradient(135deg, var(--nf-navy-700), var(--nf-graphite-950));
}
.nf-dither-underlay__gradient--horizon {
  background-image:
    radial-gradient(ellipse 90% 40% at 50% 104%, var(--nf-blue-400), transparent 70%),
    radial-gradient(ellipse 110% 55% at 50% 115%, var(--nf-navy-700), transparent 80%),
    linear-gradient(180deg, var(--nf-graphite-950) 15%, var(--nf-graphite-900) 65%, var(--nf-graphite-600));
}

.nf-dither-underlay__gradient--aurora {
  background-image:
    radial-gradient(ellipse 65% 90% at 18% 10%, color-mix(in oklab, var(--nf-blue-400) 55%, transparent), transparent 70%),
    radial-gradient(ellipse 55% 80% at 75% 85%, color-mix(in oklab, var(--nf-blue-400) 35%, transparent), transparent 72%),
    linear-gradient(130deg, var(--nf-graphite-950), var(--nf-navy-700) 52%, var(--nf-graphite-950));
}

.nf-dither-underlay__gradient--eclipse {
  background-image:
    radial-gradient(circle at 50% 55%, var(--nf-graphite-950) 0 19%, transparent 42%),
    radial-gradient(ellipse at 50% 55%, var(--nf-blue-400) 0, var(--nf-navy-700) 38%, transparent 67%),
    linear-gradient(145deg, var(--nf-graphite-900), var(--nf-graphite-950));
}

.nf-dither-underlay__gradient--steel {
  background-image:
    linear-gradient(120deg, transparent 25%, color-mix(in oklab, var(--nf-graphite-100) 16%, transparent) 46%, transparent 60%),
    linear-gradient(130deg, var(--nf-graphite-950), var(--nf-graphite-500) 44%, var(--nf-graphite-600) 65%, var(--nf-graphite-950));
}

.nf-dither-underlay__gradient--polar {
  background-image:
    radial-gradient(ellipse 90% 85% at 85% 10%, color-mix(in oklab, var(--nf-blue-400) 70%, var(--nf-graphite-100)), transparent 65%),
    radial-gradient(ellipse 85% 80% at 10% 100%, var(--nf-graphite-500), transparent 75%),
    linear-gradient(150deg, var(--nf-graphite-400), var(--nf-navy-700) 65%, var(--nf-graphite-900));
}
.nf-dither-underlay__gradient--paper {
  background-image:
    radial-gradient(ellipse at 18% 20%, var(--nf-graphite-100), transparent 65%),
    radial-gradient(ellipse at 85% 90%, color-mix(in oklab, var(--nf-blue-500) 18%, transparent), transparent 65%),
    linear-gradient(135deg, var(--nf-graphite-50), var(--nf-graphite-100) 55%, var(--nf-graphite-200));
}

canvas {
  position: absolute;
  display: block;
  image-rendering: pixelated;
}
</style>
