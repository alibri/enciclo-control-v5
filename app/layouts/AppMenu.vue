<script setup lang='ts'>
import AppMenuItem from './AppMenuItem.vue';
import { useNavigationMenu } from '~/composables/navigation';

const { navigationMenu } = useNavigationMenu();
const model = navigationMenu();
const runtimeConfig = useRuntimeConfig();
</script>

<template>

      <NuxtLink to="/" class="layout-topbar-logo max-h-12" style="height: 12px;">
      <span style="color: var(--primary-color)">{{ runtimeConfig.public.APP_TITLE }} {{ runtimeConfig.public.APP_VERSION }}</span>
    </NuxtLink>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item v-if="!('separator' in item)" :item="item" :index="i" />
      <li v-if="'separator' in item" class="menu-separator" />
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
