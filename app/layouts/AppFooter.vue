<script setup>

const config = useRuntimeConfig()

</script>

<template>
  <div class="mt-4 layout-footer noprint">
    <span class="font-medium ml-2 text-gray-700 dark:text-gray-300">{{ config.public['APP_NAME'] }} - {{ config.public['APP_VERSION'] }}</span>
  </div>
</template>
<style lang="scss" scoped></style>
