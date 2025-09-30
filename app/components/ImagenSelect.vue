<script lang="ts" setup>
import MediaService from '~/services/mediaService';
import ImageInfo from './ImageInfo.vue';

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

// Función para obtener las dimensiones de una imagen
const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = src;
  });
};

// Función para formatear el tamaño de archivo (si está disponible)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};



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
    <Dialog 
      v-model:visible="dialogVisible" 
      modal 
      maximizable 
      :header="t('Seleccionar Imagen')" 
      :style="{ width: '90vw', height: '90vh', maxWidth: '1200px' }"
      :pt="{
        root: 'flex flex-col',
        content: 'flex-1 overflow-scroll',
        header: 'border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50',
        title: 'text-xl font-semibold text-gray-800'
      }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-image text-2xl text-blue-600"></i>
          <span class="text-xl font-semibold text-gray-800">{{ t('Seleccionar Imagen') }}</span>
        </div>
      </template>
      
      <BlockUI :blocked="blocked">
        <div class="h-full flex flex-col">
          <Tabs value="0" class="flex-1 flex flex-col">
            <TabList class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Tab value="0" class="px-6 py-3">
                <i class="pi pi-folder mr-2"></i>
                {{ t('Contenido') }}
              </Tab>
              <Tab value="1" class="px-6 py-3">
                <i class="pi pi-upload mr-2"></i>
                {{ t('Media') }}
              </Tab>
              <Tab value="2" class="px-6 py-3">
                <i class="pi pi-database mr-2"></i>
                {{ t('Repositorio') }}
              </Tab>
            </TabList>
            
            <TabPanels class="flex-1 overflow-hidden">
              <TabPanel value="0" class="h-full overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div v-if="!images || images.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
                  <i class="pi pi-image text-6xl mb-4"></i>
                  <p class="text-lg">{{ t('No hay imágenes disponibles') }}</p>
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div v-for="image in images" :key="image" class="group relative">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-64 flex flex-col relative">
                      <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div class="flex gap-1">
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="warning" 
                            icon="pi pi-pencil" 
                            size="small"
                            @click="editImage(image)"
                            :pt="{ root: 'bg-orange-500 hover:bg-orange-600' }"
                          />
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="success" 
                            icon="pi pi-check" 
                            size="small"
                            @click="selectImage(image)"
                            :pt="{ root: 'bg-green-500 hover:bg-green-600' }"
                          />
                        </div>
                      </div>
                      <div class="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-2 relative">
                        <Image 
                          :src="image" 
                          class="max-w-full max-h-full object-contain cursor-pointer rounded-lg" 
                          @dblclick="selectImage(image)"
                          @click="selectImage(image)"
                        />
                        <ImageInfo :src="image" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              
              <TabPanel value="1" class="h-full overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div class="mb-6">
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                      <i class="pi pi-cloud-upload text-2xl text-blue-600"></i>
                      <h3 class="text-lg font-semibold text-gray-800">{{ t('Subir Nueva Imagen') }}</h3>
                    </div>
                    <FileUpload
                      name="demo[]"
                      accept="image/*"
                      :max-file-size="100000000"
                      :auto="true"
                      custom-upload
                      mode="basic"
                      :choose-label="t('Seleccionar Archivo')"
                      @uploader="onAdvancedUpload($event)"
                      class="w-full"
                      :pt="{
                        root: 'w-full',
                        chooseButton: 'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200'
                      }"
                    >
                      <template #empty>
                        <div class="text-center py-8">
                          <i class="pi pi-cloud-upload text-4xl text-blue-400 mb-3"></i>
                          <p class="text-gray-600 text-lg">{{ t('Arrastra y suelta archivos aquí para subirlos') }}</p>
                          <p class="text-gray-500 text-sm mt-2">{{ t('o haz clic para seleccionar') }}</p>
                        </div>
                      </template>
                    </FileUpload>
                  </div>
                </div>
                
                <div v-if="!media || media.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
                  <i class="pi pi-images text-6xl mb-4"></i>
                  <p class="text-lg">{{ t('No hay imágenes en Media') }}</p>
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div v-for="image in media" :key="image" class="group relative">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-64 flex flex-col relative">
                      <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div class="flex gap-1">
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="warning" 
                            icon="pi pi-pencil" 
                            size="small"
                            @click="editImage(image)"
                            :pt="{ root: 'bg-orange-500 hover:bg-orange-600' }"
                          />
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="success" 
                            icon="pi pi-check" 
                            size="small"
                            @click="selectImage(image)"
                            :pt="{ root: 'bg-green-500 hover:bg-green-600' }"
                          />
                        </div>
                      </div>
                      <div class="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-2 relative">
                        <Image 
                          :src="image" 
                          class="max-w-full max-h-full object-contain cursor-pointer rounded-lg" 
                          @dblclick="selectImage(image)"
                          @click="selectImage(image)"
                        />
                        <ImageInfo :src="image" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              
              <TabPanel value="2" class="h-full overflow-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div v-if="!repositorio || repositorio.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
                  <i class="pi pi-database text-6xl mb-4"></i>
                  <p class="text-lg">{{ t('No hay imágenes en el Repositorio') }}</p>
                </div>
                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div v-for="image in repositorio" :key="image" class="group relative">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-64 flex flex-col relative">
                      <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div class="flex gap-1">
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="warning" 
                            icon="pi pi-pencil" 
                            size="small"
                            @click="editImage(image)"
                            :pt="{ root: 'bg-orange-500 hover:bg-orange-600' }"
                          />
                          <Button 
                            class="text-xs" 
                            rounded 
                            severity="success" 
                            icon="pi pi-check" 
                            size="small"
                            @click="selectImage(image)"
                            :pt="{ root: 'bg-green-500 hover:bg-green-600' }"
                          />
                        </div>
                      </div>
                      <div class="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-2 relative">
                        <Image 
                          :src="image" 
                          class="max-w-full max-h-full object-contain cursor-pointer rounded-lg" 
                          @dblclick="selectImage(image)"
                          @click="selectImage(image)"
                        />
                        <ImageInfo :src="image" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
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


<style scoped>
/* Scrollbar personalizado para Webkit (Chrome, Safari, Edge) */
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Scrollbar para Firefox */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin:hover {
  scrollbar-color: #94a3b8 #f1f5f9;
}

/* Asegurar que el scroll funcione correctamente */
.overflow-auto {
  scroll-behavior: smooth;
}
</style>
