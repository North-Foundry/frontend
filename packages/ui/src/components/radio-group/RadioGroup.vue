<script setup lang="ts">
/**
 * A single-choice group with controlled or local state and Reka's roving keyboard focus.
 */
import { reactiveOmit } from '@vueuse/core';
import type { RadioGroupRootEmits, RadioGroupRootProps } from 'reka-ui';
import { RadioGroupRoot, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { radioGroupClasses } from './RadioGroup';

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<RadioGroupRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <RadioGroupRoot
    v-slot="slotProps"
    data-slot="radio-group"
    v-bind="forwarded"
    :class="cn(radioGroupClasses, props.class)"
  >
    <slot v-bind="slotProps" />
  </RadioGroupRoot>
</template>
