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

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes['class'] }>(),
  {
    position: 'popper',
  },
);
const emits = defineEmits<SelectContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

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
        <SelectScrollUpButton />
        <SelectViewport
          :class="cn(selectViewportClasses, position === 'popper' && selectViewportPopperClasses)"
        >
          <slot />
        </SelectViewport>
        <SelectScrollDownButton />
      </SelectContent>
    </div>
  </SelectPortal>
</template>
