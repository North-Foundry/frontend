<script setup lang="ts">
// Vue wrapper around the canvas renderer: it owns the component lifecycle, the renderer owns the
// drawing. Keeping the two apart means the mark can also be mounted from plain TypeScript.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  NORTH_ARROW_DEFAULTS,
  gridSide,
  mountNorthArrow,
  type NorthArrowHandle,
  type NorthArrowOptions,
} from './mount';

/** Renderer options plus the accessible name, which only the component cares about. */
type NorthArrowProps = NorthArrowOptions & {
  /** Accessible name. Omit for a decorative mark, which then renders as hidden. */
  label?: string;
};

// Defaults come from the renderer instead of being repeated here: one place to change them.
const props = withDefaults(defineProps<NorthArrowProps>(), NORTH_ARROW_DEFAULTS);

const canvas = ref<HTMLCanvasElement | null>(null);
/** Handle to the live mount, so prop changes can repaint and unmount can stop the loop. */
let mark: NorthArrowHandle | undefined;

// Reserve the final size in the markup, so the canvas does not sit at its default 300x150 before
// the renderer takes over on mount.
const grid = computed(() => gridSide(props.size, props.cell));
const pixels = computed(() => grid.value * props.cell);

/** Snapshot of the props in the shape the renderer expects. */
const options = (): NorthArrowOptions => ({
  size: props.size,
  cell: props.cell,
  ground: props.ground,
  mono: props.mono,
  animated: props.animated,
});

// The renderer touches canvas APIs, so it is mounted only once the element exists on the client.
onMounted(() => {
  if (canvas.value) mark = mountNorthArrow(canvas.value, options());
});

// Every prop that changes the picture repaints through the handle; an unchanged list is a no-op.
watch(
  () => [props.size, props.cell, props.ground, props.mono, props.animated],
  () => mark?.update(options()),
);

onBeforeUnmount(() => mark?.destroy());
</script>

<template>
  <canvas
    ref="canvas"
    :width="grid"
    :height="grid"
    :style="{ width: `${pixels}px`, height: `${pixels}px` }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  />
</template>
