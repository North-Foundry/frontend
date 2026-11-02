<script setup lang="ts">
/**
 * Shows the selected item's text inside the trigger, or the placeholder.
 */
import type { SelectValueProps } from 'reka-ui';
import { SelectValue } from 'reka-ui';

const props = defineProps<SelectValueProps>();
</script>

<template>
  <SelectValue data-slot="select-value" v-bind="props">
    <slot />
  </SelectValue>
</template>
