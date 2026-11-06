<script setup lang="ts">
/**
 * A native input with controlled or local state and the theme's shared field styling.
 */
import { useVModel } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { inputClasses } from './Input';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input v-model="modelValue" data-slot="input" :class="cn(inputClasses, props.class)" />
</template>
