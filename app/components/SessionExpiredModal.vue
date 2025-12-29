<script setup lang="ts">
const { t } = useI18n();

const visible = ref(false);

/**
 * Maneja el evento de sesión expirada
 */
const handleSessionExpired = () => {
  visible.value = true;
};

/**
 * Redirige al login
 */
const goToLogin = () => {
  visible.value = false;
  navigateTo('/auth/login');
};

// Escuchar el evento de sesión expirada
onMounted(() => {
  if (process.client) {
    window.addEventListener('session-expired', handleSessionExpired);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('session-expired', handleSessionExpired);
  }
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :closable="false"
    :draggable="false"
    :style="{ width: '30rem' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    class="session-expired-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-orange-500"></i>
        <span class="text-xl font-semibold" style="color: var(--text-color);">
          {{ t('Sesión Expirada') }}
        </span>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <i class="pi pi-info-circle text-2xl text-blue-500 mt-1"></i>
        <div class="flex-1">
          <p class="text-base mb-2" style="color: var(--text-color);">
            {{ t('Su sesión ha caducado por inactividad.') }}
          </p>
          <p class="text-sm" style="color: var(--text-color-secondary);">
            {{ t('Por favor, inicie sesión nuevamente para continuar.') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('Ir al Login')"
          icon="pi pi-sign-in"
          @click="goToLogin"
          class="p-button-primary"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.session-expired-dialog :deep(.p-dialog-header) {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.session-expired-dialog :deep(.p-dialog-content) {
  background-color: var(--surface-card);
  padding: 1.5rem;
}

.session-expired-dialog :deep(.p-dialog-footer) {
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  padding: 1rem 1.5rem;
}
</style>

