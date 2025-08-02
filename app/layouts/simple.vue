<script setup lang='ts'>
import { computed } from 'vue';
import { useLayout } from './composables/layout'
const { layoutConfig, layoutState, toggleDarkMode, isDarkTheme } = useLayout();
const topbarMenuActive = ref(true);

const containerClass = computed(() => {
  return {
    'layout-theme-light': !layoutConfig.darkTheme.value,
    'layout-theme-dark': layoutConfig.darkTheme.value,
    'layout-overlay': layoutConfig.menuMode.value === 'overlay',
    'layout-static': layoutConfig.menuMode.value === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive.value,
    'layout-mobile-active': layoutState.staticMenuMobileActive.value,
  }
})

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  };
});

</script>

<template>

  <div>
    <div class="layout-wrapper" :class="containerClass">
      <button @click="toggleDarkMode" class="absolute top-4 right-4 px-4 py-2    transition duration-200">
        <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
      </button>

      <slot />
      <div class="layout-mask" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
