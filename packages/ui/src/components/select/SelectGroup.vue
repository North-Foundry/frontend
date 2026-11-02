<script setup lang="ts">
/**
 * Groups related items in the list, usually under a `SelectLabel`.
 */
import type { SelectGroupProps } from 'reka-ui';
import { SelectGroup } from 'reka-ui';

const props = defineProps<SelectGroupProps>();
</script>

<template>
  <SelectGroup data-slot="select-group" v-bind="props">
    <slot />
  </SelectGroup>
</template>
