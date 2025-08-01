<script setup lang='ts'>
import { computed, watch, ref } from 'vue';
import type { Ref } from 'vue';

import AppMenu from '~/components/app/AppMenu.vue';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener: Ref<((event: MouseEvent) => void) | null> = ref(null);
const themeStore = useThemeStore();
const pageStore = usePageStore();
const { t } = useI18n();

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    dark: true, //themeStore.isDarkMode,
    'layout-overlay': layoutConfig.menuMode.value === 'overlay',
    'layout-static': layoutConfig.menuMode.value === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive.value,
    'layout-mobile-active': layoutState.staticMenuMobileActive.value,
    'p-input-filled': layoutConfig.inputStyle.value === 'filled',
    'p-ripple-disabled': !layoutConfig.ripple.value
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: MouseEvent) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive.value = false;
        layoutState.staticMenuMobileActive.value = false;
        layoutState.menuHoverActive.value = false;
      }
    };

    document.addEventListener('click', outsideClickListener.value);
  }
};

const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
};

const isOutsideClicked = (event: MouseEvent) => {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.layout-menu-button');

  if (!sidebarEl || !topbarEl) return true;
  const target = event.target as Node | null;
  if (!target) return true;
  return !(
    sidebarEl.isSameNode(target) ||
    sidebarEl.contains(target) ||
    topbarEl.isSameNode(target) ||
    topbarEl.contains(target)
  );
};
</script>

<template>
  <div>
    <Link rel="stylesheet" :href="themeStore.link" />
    <div class="layout-wrapper" :class="containerClass">
      <app-topbar />
      <div class="layout-sidebar noprint">
        <app-menu />
      </div>
      <div class="layout-main-container">
        <div class="layout-main">
          <slot />
        </div>
        <app-footer />
      </div>
      <div class="layout-mask" />
    </div>
    <div class="card flex justify-content-center">
      <Sidebar modal v-model:visible="pageStore.editPage" :header="t('Página')" position="full">
        <template #header>
          <div class="flex align-items-center gap-2">
            <span class="font-bold">{{ pageStore.title }}</span>
          </div>
        </template>
        <PageInfo :collection="pageStore.collection || undefined" :page="pageStore.title || undefined" />
      </Sidebar>
      <Button icon="pi pi-window-maximize" @click="pageStore.setEditPage(false)" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
