<script setup lang="ts">
/**
 * Vue owns the elements and props; the mount owns drawing and browser lifecycle.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { DITHER_UNDERLAY_DEFAULTS, underlayLayout } from './layout';
import { mountDitherUnderlay, type DitherUnderlayHandle } from './mount';
import type { DitherUnderlayOptions, DitherUnderlayProps } from './types';

/**
 * Leave position unset here so the deprecated corner prop can still supply it.
 */
const props = withDefaults(defineProps<DitherUnderlayProps & { reactionThickness?: number }>(), {
  ...DITHER_UNDERLAY_DEFAULTS,
  position: undefined,
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
  paused: props.paused,
} satisfies Required<DitherUnderlayOptions>));
/**
 * Keep the canvas placement aligned with the current renderer options.
 */
const placement = computed(() => underlayLayout(options.value).style);

/**
 * Mount the canvas renderer once both Vue elements are available.
 */
onMounted(() => {
  if (host.value && canvas.value) {
    underlay = mountDitherUnderlay(host.value, canvas.value, options.value);
  }
});
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
    <canvas ref="canvas" :style="placement" />
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

canvas {
  position: absolute;
  display: block;
  image-rendering: pixelated;
}
</style>
