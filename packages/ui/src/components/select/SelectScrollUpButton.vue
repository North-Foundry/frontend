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

const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectScrollUpButton
    data-slot="select-scroll-up-button"
    v-bind="forwardedProps"
    :class="cn(selectScrollUpButtonClasses, props.class)"
  >
    <slot>
      <ChevronUp class="size-4" />
    </slot>
  </SelectScrollUpButton>
</template>
