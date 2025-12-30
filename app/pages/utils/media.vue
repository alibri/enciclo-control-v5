<script setup lang='ts'>
useAuthGuard();

const openEditor = ref(false);
const url = ref('https://picsum.photos/400/600');

const config = ref({
  tools: ['adjust', 'effects', 'filters', 'rotate', 'crop', 'resize', 'watermark', 'shapes', 'image', 'text'],
  finishButtonLabel: 'Save'
});
const src = ref('https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg');
const colorScheme = ref('light'); //  'dark'|'light'

const handleOpenEditor = () => {
  openEditor.value = true;
};

const handleCloseEditor = () => {
  openEditor.value = false;
};

const handleClose = (status) => {
  console.error('Close' + status);
  handleCloseEditor();
};

const onBeforeComplete = (element) => {
  url.value = element.canvas.toDataURL();
  // console.error(element.canvas.toDataURL())
};

const handleComplete = (element, file) => {
  // console.log(url )
  url.value = element.canvas.toDataURL();

  handleCloseEditor();
};

const handleError = (error) => {
  console.error(error);
  handleCloseEditor();
};

</script>

<template>
  <div class="card">
    <h2>Gallery</h2>
    <p>Use this page to start from scratch and place your custom content !</p>
    <div>
      <img
        v-if="!openEditor"
        width="300"
        :src="src"
        alt="example image"
        @click="handleOpenEditor()"
      >
      <button @click="handleOpenEditor()">
        edit
      </button>
      <FilerobotImageEditor
        v-if="openEditor"
        :config="config"
        :src="src"
        @close="handleClose"
        @complete="handleComplete"
        @error="handleError"
        @before-complete="onBeforeComplete"
      />
    </div>
  </div>
</template>

<style scoped></style>
