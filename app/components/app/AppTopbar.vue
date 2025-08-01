<script setup lang='ts'>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/stores/auth'; // import the auth store we just created

const { t } = useI18n();
const { layoutConfig, onMenuToggle } = useLayout();
const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null);
const topbarMenuActive = ref(false);
const router = useRouter();

onMounted(() => {
  bindOutsideClickListener();
});
onBeforeUnmount(() => {
  unbindOutsideClickListener();
});
const logoUrl = computed(() => {
  return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
  topbarMenuActive.value = !topbarMenuActive.value;
};

const topbarMenuClasses = computed(() => {
  return {
    'layout-topbar-menu-mobile-active': topbarMenuActive.value
  };
});

const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: MouseEvent) => {
      if (isOutsideClicked(event)) {
        topbarMenuActive.value = false;
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
  if (!topbarMenuActive.value) { return false; }
  const sidebarEl = document.querySelector('.layout-topbar-menu');
  const topbarEl = document.querySelector('.layout-topbar-menu-button');

  return !(sidebarEl?.isSameNode(event.target as Node) || sidebarEl?.contains(event.target as Node) || topbarEl?.isSameNode(event.target as Node) || topbarEl?.contains(event.target as Node));
};

const emit = defineEmits(['menuToggle']);

const themeStore = useThemeStore();
const op = ref<any>(null);

function toggle (event: any) {
  op.value.toggle(event);
}

const { logUserOut } = useAuthStore(); // use authenticateUser action from  auth store
const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

const logout = () => {
  logUserOut();
  router.push('/auth/login');
};

const runtimeConfig = useRuntimeConfig();
</script>

<template>
  <div class="layout-topbar noprint">
    <NuxtLink to="/" class="layout-topbar-logo">
      <span style="color: var(--primary-color)">{{ runtimeConfig.public.APP_TITLE }} {{ runtimeConfig.public.APP_VERSION }}</span>
    </NuxtLink>

    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
      <i class="pi pi-bars" />
    </button>

    <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
      <i class="pi pi-ellipsis-v" />
    </button>

    <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button v-if="!authenticated" class="p-link">
        <i class="pi pi-sign-in" />
        <nuxt-link to="/auth/login">
          {{ t('Login') }}
        </nuxt-link>
      </button>

      <button v-if="authenticated" class="p-link">
        <i class="pi pi-sign-out" />&nbsp;
        <nuxt-link @click="logout">
          {{ t('Logout') }}
        </nuxt-link>
      </button>

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
