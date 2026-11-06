<script setup lang="ts">
/**
 * The floating list of options, teleported to `body`. It wraps itself in the trigger's scheme
 * class, so a select inside a `.paper` band opens a paper list.
 */
import { reactiveOmit } from '@vueuse/core';
import type { SelectContentEmits, SelectContentProps } from 'reka-ui';
import {
  SelectContent,
  SelectPortal,
  SelectViewport,
  injectSelectRootContext,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { useScheme } from '../../lib/scheme';
import { cn } from '../../lib/utils';
import {
  selectContentClasses,
  selectContentPopperClasses,
  selectViewportClasses,
  selectViewportPopperClasses,
} from './SelectContent';
import SelectScrollDownButton from './SelectScrollDownButton.vue';
import SelectScrollUpButton from './SelectScrollUpButton.vue';
import { DEFAULT_SELECT_SCROLL_SPEED_FACTOR } from './useSelectScroll';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<SelectContentProps & {
    class?: HTMLAttributes['class'];
    /** Arrow scrolling multiplier: 1 matches Reka's speed; 0 pauses scrolling. */
    scrollSpeedFactor?: number;
  }>(),
  {
    position: 'popper',
    scrollSpeedFactor: DEFAULT_SELECT_SCROLL_SPEED_FACTOR,
  },
);
const emits = defineEmits<SelectContentEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'scrollSpeedFactor');

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const rootContext = injectSelectRootContext();
const scheme = useScheme(rootContext.triggerElement, rootContext.open);
</script>

<template>
  <SelectPortal>
    <div :class="scheme" class="contents">
      <SelectContent
        data-slot="select-content"
        v-bind="{ ...$attrs, ...forwarded }"
        :class="cn(selectContentClasses, position === 'popper' && selectContentPopperClasses, props.class)"
      >
        <SelectScrollUpButton :scroll-speed-factor="scrollSpeedFactor" />
        <SelectViewport
          data-slot="select-viewport"
          :class="cn(selectViewportClasses, position === 'popper' && selectViewportPopperClasses)"
        >
          <slot />
        </SelectViewport>
        <SelectScrollDownButton :scroll-speed-factor="scrollSpeedFactor" />
      </SelectContent>
    </div>
  </SelectPortal>
</template>
