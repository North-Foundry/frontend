<script setup lang="ts">
/**
 * A native textarea with optional vertical autosizing and controlled or local state.
 */
import { useVModel } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { textareaClasses } from './Textarea';

const props = withDefaults(
  defineProps<{
    /** Grows vertically with the text; disable to use native rows and scrolling. */
    autosize?: boolean;
    defaultValue?: string | number;
    modelValue?: string | number;
    class?: HTMLAttributes['class'];
  }>(),
  { autosize: true },
);

const emits = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :data-autosize="autosize"
    :class="cn(textareaClasses, props.class)"
  />
</template>
