<script setup lang='ts'>
useAuthGuard();

const route = useRoute();
const slug = route.params.slug.toString();
</script>

<template>
  <div class="markdown card">
    <ContentDoc :path="slug">
      <template #default="{ doc }">
        <h1>{{ doc.title }}</h1>
        <p>{{ doc.description }}</p>
        <hr>
        <ContentRenderer :value="doc" />
      </template>
      <!-- Slot if document is not found -->
      <template #not-found>
        <h1 class="text-2xl">
          Content Page ({{ slug }}) not found
        </h1>
      </template>
    </contentdoc>
  </div>
</template>

<style scoped></style>
