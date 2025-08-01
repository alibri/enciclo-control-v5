<script setup lang='ts'>
import { computed, watch, ref } from 'vue';

import AppMenu from '~/components/app/AppMenu.vue';
const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref(null);
const themeStore = useThemeStore();

const containerClass = computed(() => {
  return {
    dark: themeStore.isDarkMode,
    'layout-overlay': layoutConfig.menuMode.value === 'overlay',
    'layout-static': layoutConfig.menuMode.value === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive.value,
    'layout-mobile-active': layoutState.staticMenuMobileActive.value,
    'p-input-filled': layoutConfig.inputStyle.value === 'filled',
    'p-ripple-disabled': !layoutConfig.ripple.value
  };
});

</script>

<template>
  <div>
    <Link rel="stylesheet" :href="themeStore.link" />
    <div class="layout-wrapper" :class="containerClass">
      <app-topbar-simple />
      <slot />
      <div class="layout-mask" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
