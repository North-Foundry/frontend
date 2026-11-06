<script setup lang="ts">
/**
 * An accessible tri-state checkbox with controlled or local state and a replaceable indicator.
 */
import { Check, Minus } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { checkboxClasses, checkboxIndicatorClasses } from './Checkbox';

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-slot="{ state }"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="cn(checkboxClasses, props.class)"
  >
    <CheckboxIndicator data-slot="checkbox-indicator" :class="checkboxIndicatorClasses">
      <slot :state="state">
        <Minus v-if="state === 'indeterminate'" class="size-3.5" />
        <Check v-else class="size-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
