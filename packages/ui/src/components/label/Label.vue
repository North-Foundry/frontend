<script setup lang="ts">
/**
 * An accessible label that associates its content with a native or Reka form control.
 */
import { reactiveOmit } from '@vueuse/core';
import { Label, type LabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { labelClasses } from './Label';

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <Label data-slot="label" v-bind="delegatedProps" :class="cn(labelClasses, props.class)">
    <slot />
  </Label>
</template>
