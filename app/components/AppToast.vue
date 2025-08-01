<script setup>
const iconClass = computed(() => {
  return 'pi pi-info-circle';
});
</script>

<template>
  <Toast />
  <Toast position="top-right" group="tr" />
  <Toast position="top-center" group="tc">
    <template #message="slotProps">
      <span :class="iconClass" />
      <div class="p-toast-message-text">
        <span class="p-toast-summary">{{ slotProps.message.summary }}</span>
        <div class="p-toast-detail" v-html="slotProps.message.detail" />
      </div>
    </template>
  </Toast>
  <Toast position="top-left" group="tl" />
  <Toast position="bottom-left" group="bl" />
  <Toast position="bottom-center" group="bc" />
  <Toast position="bottom-right" group="br" />
  <ConfirmDialog />
  <DynamicDialog />
</template>
