<script setup lang="ts">
/**
 * Scrolls a list that is taller than the screen up while the pointer rests on it.
 */
import { ChevronUp } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import type { SelectScrollUpButtonProps } from 'reka-ui';
import { SelectScrollUpButton, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { selectScrollUpButtonClasses } from './SelectScrollUpButton';
import { useSelectScroll } from './useSelectScroll';

const props = defineProps<SelectScrollUpButtonProps & {
  class?: HTMLAttributes['class'];
  scrollSpeedFactor?: number;
}>();

const delegatedProps = reactiveOmit(props, 'class', 'scrollSpeedFactor');

const forwardedProps = useForwardProps(delegatedProps);
const { start, stop } = useSelectScroll(-1, () => props.scrollSpeedFactor);
</script>

<template>
  <SelectScrollUpButton
    data-slot="select-scroll-up-button"
    v-bind="forwardedProps"
    :class="cn(selectScrollUpButtonClasses, props.class)"
    @pointerdown.capture.stop="start"
    @pointermove.capture.stop="start"
    @pointerleave="stop"
    @pointercancel="stop"
  >
    <slot>
      <ChevronUp class="size-4" />
    </slot>
  </SelectScrollUpButton>
</template>
