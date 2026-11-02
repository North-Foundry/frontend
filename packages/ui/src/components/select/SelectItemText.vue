<script setup lang="ts">
/**
 * The part of an item's content that the trigger shows once the item is selected.
 */
import type { SelectItemTextProps } from 'reka-ui';
import { SelectItemText } from 'reka-ui';

const props = defineProps<SelectItemTextProps>();
</script>

<template>
  <SelectItemText data-slot="select-item-text" v-bind="props">
    <slot />
  </SelectItemText>
</template>
