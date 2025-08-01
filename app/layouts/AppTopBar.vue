<script setup lang='ts'>
import { useLayout } from './composables/layout'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/stores/auth'; // import the auth store we just created
const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout()
const { t } = useI18n();
//const { layoutConfig, onMenuToggle } = useLayout();
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

</script>

<template>

  <div class="layout-topbar noprint">
    <button
      class="p-link layout-menu-button layout-topbar-button"
      @click="onMenuToggle()"
    >
      <i class="pi pi-bars" />
    </button>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      @click="onTopBarMenuButton()"
    >
      <i class="pi pi-ellipsis-v" />
    </button>
        <div class="layout-topbar-menu" :class="topbarMenuClasses">
      <button
        type="button"
        class="layout-topbar-button"
        @click="toggleDarkMode"
      >
        <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
        <span>Dark Mode</span>
      </button>
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

    </div>
  </div>
</template>
