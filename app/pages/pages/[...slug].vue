<!-- eslint-disable vue/no-multiple-template-root -->
<script setup lang="ts">
useAuthGuard();

const route = useRoute();
const slugArray = Array.isArray(route.params.slug) ? route.params.slug : [];
const page = ref(slugArray[1] || '');
const collection = ref(slugArray[0] || '');
</script>

<template>
  <PageInfo :collection="collection" :page="page" />
</template>
