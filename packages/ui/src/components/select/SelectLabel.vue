<script setup lang="ts">
/**
 * A non-selectable heading for a `SelectGroup`.
 */
import type { SelectLabelProps } from 'reka-ui';
import { SelectLabel } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { selectLabelClasses } from './SelectLabel';

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>();
</script>

<template>
  <SelectLabel data-slot="select-label" :class="cn(selectLabelClasses, props.class)">
    <slot />
  </SelectLabel>
</template>
