<!-- eslint-disable vue/no-multiple-template-root -->
<script setup lang="ts">
const route = useRoute();
const page = ref(route.params.slug[1]);
const collection = ref(route.params.slug[0]);
</script>

<template>
  <PageInfo :collection="collection" :page="page" />
</template>
