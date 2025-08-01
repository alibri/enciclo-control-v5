<script setup lang='ts'>
import { ref, computed } from 'vue';

const { t } = useI18n();

const { layoutConfig } = useLayout();
const topbarMenuActive = ref(false);

const logoUrl = computed(() => {
  return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  };
});

const themeStore = useThemeStore();
const op = ref<any>(null);

function toggle (event: any) {
  op.value.toggle(event);
}

const runtimeConfig = useRuntimeConfig();
</script>

<template>
  <div class="layout-topbar">
    <NuxtLink to="/" class="layout-topbar-logo">
      <span style="color: var(--primary-color)">{{ runtimeConfig.public.APP_TITLE }}</span>
    </NuxtLink>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button class="p-link layout-topbar-button" @click="toggle">
        <i class="pi pi-cog" />
        <span>{{ t('Settings') }}</span>
      </button>
    </div>
    <client-only>
      <OverlayPanel id="overlay_panel" ref="op" append-to="body" style="width: 200px">
        <div class="field-radiobutton">
          <RadioButton
            id="lara-dark"
            v-model="themeStore.themeName"
            name="layoutColorMode"
            value="lara-dark"
            @change="themeStore.setTheme('lara-dark')"
          />
          <label>{{ t('Lara Dark') }}</label>
        </div>
        <div class="field-radiobutton">
          <RadioButton
            id="lara-light"
            v-model="themeStore.themeName"
            name="layoutColorMode"
            value="lara-light"
            @change="themeStore.setTheme('lara-light')"
          />
          <label>{{ t('Lara Light') }}</label>
        </div>

        <h6>{{ t('Primary Color') }}</h6>
        <div class="flex">
          <div
            style="width:2rem;height:2rem;border-radius:6px;background-color:#10b981; "
            class="bg-purple-500  mr-3  cursor-pointer"
            @click="themeStore.setColor('teal')"
          />
          <div
            style="width:2rem;height:2rem;border-radius:6px;background-color:#3B82F6; "
            class="bg-blue-500 mr-3 cursor-pointer"
            @click="themeStore.setColor('blue')"
          />
          <div
            style="width:2rem;height:2rem;border-radius:6px;background-color:#6366F1; "
            class="bg-green-500 mr-3 cursor-pointer"
            @click="themeStore.setColor('indigo')"
          />
          <div
            style="width:2rem;height:2rem;border-radius:6px;background-color:#8B5CF6; "
            class="bg-yellow-300 mr-3 cursor-pointer"
            @click="themeStore.setColor('purple')"
          />
        </div>
      </OverlayPanel>
    </client-only>
  </div>
</template>
