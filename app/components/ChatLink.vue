<script lang="ts" setup>

const props = defineProps({
  code: {
    type: String,
    default: null
  },
  link: {
    type: String,
    default: null
  }

});

</script>

<template>
  <a style="cursor: pointer;" :href="link" target="_blank" class="text-blue-500 border-none border-bottom-1 border-dotted ml-1">
    {{ code }} <i class="pi pi-external-link" />
  </a>
</template>
