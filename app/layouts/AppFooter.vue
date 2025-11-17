<script setup>

const config = useRuntimeConfig()

</script>

<template>
  <div class="mt-4 layout-footer noprint">
    <span class="font-medium ml-2" style="color: var(--text-color-secondary);">{{ config.public['APP_NAME'] }} - {{ config.public['APP_VERSION'] }}</span>
  </div>
</template>
<style lang="scss" scoped></style>
