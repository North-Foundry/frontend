<script setup lang="ts">
/**
 * One radio option with the theme's field styling and a replaceable selected indicator.
 */
import { Circle } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import type { RadioGroupItemEmits, RadioGroupItemProps } from 'reka-ui';
import { RadioGroupIndicator, RadioGroupItem, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { radioGroupIndicatorClasses, radioGroupItemClasses } from './RadioGroupItem';

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<RadioGroupItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <RadioGroupItem
    v-slot="slotProps"
    data-slot="radio-group-item"
    v-bind="forwarded"
    :class="cn(radioGroupItemClasses, props.class)"
  >
    <RadioGroupIndicator data-slot="radio-group-indicator" :class="radioGroupIndicatorClasses">
      <slot v-bind="slotProps">
        <Circle class="size-2 fill-current" />
      </slot>
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
