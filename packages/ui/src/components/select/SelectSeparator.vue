<script setup lang="ts">
/**
 * A hairline between groups in the select list.
 */
import { reactiveOmit } from '@vueuse/core';
import type { SelectSeparatorProps } from 'reka-ui';
import { SelectSeparator } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { selectSeparatorClasses } from './SelectSeparator';

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <SelectSeparator
    data-slot="select-separator"
    v-bind="delegatedProps"
    :class="cn(selectSeparatorClasses, props.class)"
  />
</template>
