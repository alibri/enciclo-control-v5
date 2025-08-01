<script lang="ts" setup>
import MediaService from '~/services/mediaService';

const mediaService = new MediaService();
const { t } = useI18n();
const { showMessage, removeGroup } = useMessages();

const blocked = ref(false);
const props = defineProps({
  images: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select']);

const dialogVisible = ref(false);

const selectImage = (image: string) => {
  emit('select', image);
  dialogVisible.value = false;
};

const openEditor = ref(false);
const url = ref('');
const src = ref('');

const editImage = (image: string) => {
  console.log('edit', image);
  src.value = image;
  openEditor.value = true;
};

const onCloseEditor = () => {
  openEditor.value = false;
};

const onClose = (status: any) => {
  console.error('onClose', status);
  onCloseEditor();
};

const onBeforeComplete = async (element: any) => {
  console.info('onBeforeComplete', element);
  if (element && element.canvas) {
    url.value = element.canvas.toDataURL();
    //console.info('onBeforeComplete', url.value.toString());
    const response = await mediaService.uploadMedia(url.value.toString());
    if (checkLogged(response)) {
      selectImage(response?.data?.value.url);
      loadData();
    }
  }
};

const onComplete = (element: any, file: any) => {
  console.info('onComplete', element, file);
  // console.log(url )
  url.value = element.canvas.toDataURL();

  onCloseEditor();
};

const onError = (error: any) => {
  console.error('onError', error);
  onCloseEditor();
};

const media = ref();

const loadData = async () => {
  const response = await mediaService.getImages();
  //console.log('images', response.data);
  if (checkLogged(response)) {
    media.value = response?.data?.value?.list;
  }
};

const repositorio = ref();
const loadRepositorioData = async () => {
  const response = await mediaService.getRepository();
  //console.log('repositorio', response.data);
  if (checkLogged(response)) {
    repositorio.value = response?.data?.value?.list;
  }
};

onMounted(() => {
  loadData();
  loadRepositorioData();
});

const onAdvancedUpload = async (event: any) => {
  blocked.value = true;

  const file = event.files[0];
  //console.log('onAdvancedUpload', event.files);
  showMessage('info', t('Media'), `${t('Subiendo archivo')}<br/><strong>${file.name}</strong><i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>`, -1, 'tc');
  const reader = new FileReader();
  const blob = await fetch(file.objectURL).then(r => r.blob()); // blob:url

  reader.readAsDataURL(blob);

  reader.onloadend = async () => {
    const base64data = reader.result;
    //console.info('onAdvancedUpload', base64data);
    const response = await mediaService.uploadMedia(base64data);
    if (checkLogged(response)) {
      loadData();
    }
    blocked.value = false;
    removeGroup('tc');
    showMessage('success', t('Media'), `${t('Fichero subido correctamente')}`);
  };
};

// Configuración del editor de imágenes
const config = {
  source: src,
  onSave: (editedImageObject: any, designState: any) => console.log('saved', editedImageObject, designState),
  annotationsCommon: {
    fill: '#ff0000'
  },
  Text: { text: 'Filerobot...' },
  tabsIds: [0, 1, 2, 3, 4],
  defaultTabId: 1,
  defaultToolId: 1
};
</script>

<template>
  <span>
    <Dialog v-model:visible="dialogVisible" modal maximizable :header="t('Seleccionar Imagen')" :style="{ width: '75rem' }">
      <BlockUI :blocked="blocked">
        <TabView>
          <TabPanel :header="t('Contenido')">
            <div class="grid">
              <div v-for="image in images" :key="image" class="col-3">
                <div class="p-1 border-1 border-600">
                  <Button class="text-sm ml-1" rounded severity="warning" icon="pi pi-pencil" @click="editImage(image)" />
                  <Button class="text-sm" rounded severity="primary" icon="pi pi-check" @click="selectImage(image)" />
                  <Image :src="image" class="border-top-1 mt-1" width="200px" @dblclick="selectImage(image)" />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel :header="t('Media')">
            <div class="card">
              <FileUpload
                name="demo[]"
                accept="image/*"
                :max-file-size="100000000"
                :auto="true"
                custom-upload
                mode="basic"
                :choose-label="t('Subir')"
                @uploader="onAdvancedUpload($event)"
              >
                <template #empty>
                  <p>{{ t('Arrastra y suelta archivos aquí para subirlos') }}</p>
                </template>
              </FileUpload>
            </div>
            <div class="grid">
              <div v-for="image in media" :key="image" class="col-3">
                <div class="p-1 border-1 border-200">
                  <Button class="text-sm" rounded severity="warning" icon="pi pi-pencil" @click="editImage(image)" />
                  <Button class="text-sm" rounded severity="primary" icon="pi pi-check" @click="selectImage(image)" />
                  <Image :src="image" class="border-top-1 mt-1" width="200px" @dblclick="selectImage(image)" />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel :header="t('Repositorio')">
            <div class="grid">
              <div v-for="image in repositorio" :key="image" class="col-3">
                <div class="p-1 border-1 border-200">
                  <Button class="text-sm" rounded severity="warning" icon="pi pi-pencil" @click="editImage(image)" />
                  <Button class="text-sm" rounded severity="primary" icon="pi pi-check" @click="selectImage(image)" />
                  <Image :src="image" class="border-top-1 mt-1" width="200px" @dblclick="selectImage(image)" />
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </BlockUI>
    </Dialog>
    <Button icon="pi pi-image" @click="dialogVisible = true" />
    <FilerobotImageEditor
      v-if="openEditor"
      :config="config"
      :src="src"
      @close="onClose"
      @complete="onComplete"
      @error="onError"
      @before-complete="onBeforeComplete"
    />

  </span>
</template>
