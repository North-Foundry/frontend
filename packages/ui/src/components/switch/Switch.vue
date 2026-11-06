<script setup lang="ts">
/**
 * An accessible on/off control with controlled or local state and the theme's field styling.
 */
import { reactiveOmit } from '@vueuse/core';
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui';
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { switchClasses, switchThumbClasses } from './Switch';

const props = defineProps<SwitchRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<SwitchRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SwitchRoot data-slot="switch" v-bind="forwarded" :class="cn(switchClasses, props.class)">
    <SwitchThumb data-slot="switch-thumb" :class="switchThumbClasses" />
  </SwitchRoot>
</template>
