<script setup lang="ts">
/**
 * Scrolls a list that is taller than the screen down while the pointer rests on it.
 */
import { ChevronDown } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import type { SelectScrollDownButtonProps } from 'reka-ui';
import { SelectScrollDownButton, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { selectScrollDownButtonClasses } from './SelectScrollDownButton';
import { useSelectScroll } from './useSelectScroll';

const props = defineProps<SelectScrollDownButtonProps & {
  class?: HTMLAttributes['class'];
  scrollSpeedFactor?: number;
}>();

const delegatedProps = reactiveOmit(props, 'class', 'scrollSpeedFactor');

const forwardedProps = useForwardProps(delegatedProps);
const { start, stop } = useSelectScroll(1, () => props.scrollSpeedFactor);
</script>

<template>
  <SelectScrollDownButton
    data-slot="select-scroll-down-button"
    v-bind="forwardedProps"
    :class="cn(selectScrollDownButtonClasses, props.class)"
    @pointerdown.capture.stop="start"
    @pointermove.capture.stop="start"
    @pointerleave="stop"
    @pointercancel="stop"
  >
    <slot>
      <ChevronDown class="size-4" />
    </slot>
  </SelectScrollDownButton>
</template>
