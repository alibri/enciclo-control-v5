<script setup lang="ts">
import Editor from 'primevue/editor';
import ImagenSelect from '~/components/ImagenSelect.vue';
import MetaService from '~/services/metaService';

useAuthGuard();

const metaService = new MetaService();

const { showMessage } = useMessages();
const confirm = useConfirm();
const { t } = useI18n();

const loading = ref(false);
const collections = ref<any[]>([]);
const collection = ref<any>(null);
const grupo = ref<any>(null);
const editData = ref({
  metaTitle: '',
  metaCollections: '',
  metaImage: '',
  metaAbout: ''
});
const dirty = ref(false);

const imagesItems = ref<string[]>([]);

const loadData = async () => {
  const response = await metaService.getCollections();
  if (checkLogged(response)) {
    collections.value = response.data?.value?.collections;
    collection.value = collections.value[0] ?? null;
  }
};

const loadDashboard = async (name: string) => {
  console.log('loadDashboard', name);
  loading.value = true;
  const response = await metaService.getConfiguration(name);
  if (checkLogged(response)) {
    editData.value = response.data?.value?.config;
    imagesItems.value = [response.data?.value?.config.metaImage];
    dirty.value = false;
  }
  loading.value = false;
};

const saveData = async () => {
  console.log('saveData', editData.value);
  loading.value = true;
  const response = await metaService.saveConfiguration(collection.value.name, editData.value);
  if (checkLogged(response)) {
    showMessage('success', t('Guardar'), t('Configuración guardada'), 3000);
    dirty.value = false;
  }

  loading.value = false;
};

const selectImage = (image: string) => {
  console.log('selectImage', image);
  editData.value.metaImage = image;
};

const cancel = ref(false);
watch(collection, async (value, oldValue) => {
  console.log('collection', value, oldValue);
  if (cancel.value) {
    cancel.value = false;
    return;
  }

  if (value === null) {
    cancel.value = true;
    collection.value = oldValue;
  }

  if (value) {
    if (dirty.value) {
      confirm.require({
        message: t('Hay cambios no guardados ¿Desea cambiar de colección?'),
        header: t('Eliminar'),
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        rejectLabel: t('Cancelar'),
        acceptLabel: t('Cambiar'),
        accept: () => {
          loadDashboard(value.name);
          confirm.close();
        },
        reject: () => {
          cancel.value = true;
          collection.value = oldValue;
          confirm.close();
        }
      });
    } else {
      loadDashboard(value.name);
    }
  }
});

onMounted(() => {
  loadData();
});

</script>

<template>
  <ConfirmDialog />
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <h2 class="text-3xl font-bold text-gray-900">
            <i class="pi pi-building mr-2 text-blue-500"></i>
            {{ t('Metas') }}</h2>
          <div v-if="collection" class="flex items-center space-x-2 text-gray-500">
            <i class="pi pi-chevron-right text-sm"></i>
            <span class="text-lg font-medium">{{ collection.name }}</span>
          </div>
          <div v-if="grupo" class="flex items-center space-x-2 text-gray-400">
            <i class="pi pi-chevron-right text-sm"></i>
            <span>{{ grupo.name }}</span>
          </div>
          <Badge v-if="dirty" value="*" severity="danger" class="ml-2" />
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            :label="t('Cancelar')" 
            icon="pi pi-times" 
            text 
            :disabled="!dirty" 
            severity="danger"
            @click="loadDashboard(collection.name)" 
          />
          <Button 
            :label="t('Guardar')" 
            icon="pi pi-save" 
            :loading="loading"
            :disabled="!dirty"
            @click="saveData()" 
          />
        </div>
      </div>
    </div>

    <BlockUI :blocked="loading">
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Collection Selector Card -->
        <div class="xl:col-span-1">
          <Card class="h-fit">
            <template #title>
              <div class="flex items-center space-x-2">
                <i class="pi pi-folder text-blue-500"></i>
                <span>{{ t('Colección') }}</span>
              </div>
            </template>
            <template #content>
              <Listbox 
                v-model="collection" 
                :options="collections" 
                option-label="name"
                class="w-full"
                :placeholder="t('Seleccionar colección')"
              />
            </template>
          </Card>
        </div>

        <!-- Configuration Form Card -->
        <div class="xl:col-span-3">
          <Card>
            <template #title>
              <div class="flex items-center space-x-2">
                <i class="pi pi-cog text-green-500"></i>
                <span>{{ t('Configuración') }}</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-6">
                <!-- Basic Information Section -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    <i class="pi pi-info-circle text-blue-500 mr-2"></i>
                    {{ t('Información Básica') }}
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label for="metaTitle" class="block text-sm font-medium text-gray-700">
                        {{ t('Título') }} <span class="text-red-500">*</span>
                      </label>
                      <InputText 
                        id="metaTitle" 
                        v-model="editData.metaTitle" 
                        class="w-full" 
                        :placeholder="t('Ingrese el título')"
                        @change="dirty = true" 
                      />
                    </div>
                    
                    <div class="space-y-2">
                      <label for="metaCollections" class="block text-sm font-medium text-gray-700">
                        {{ t('Colecciones') }}
                      </label>
                      <InputText 
                        id="metaCollections" 
                        v-model="editData.metaCollections" 
                        class="w-full"
                        :placeholder="t('Lista de colecciones')"
                        @change="dirty = true" 
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label for="metaAbout" class="block text-sm font-medium text-gray-700">
                      {{ t('Acerca de') }}
                    </label>
                    <Textarea 
                      id="metaAbout" 
                      v-model="editData.metaAbout" 
                      class="w-full" 
                      rows="3"
                      :placeholder="t('Descripción breve')"
                      @change="dirty = true" 
                    />
                  </div>
                </div>

                <!-- Logo Section -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    <i class="pi pi-image text-purple-500 mr-2"></i>
                    {{ t('Logo') }}
                  </h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-end space-x-3">
                      <div class="flex-1 space-y-2">
                        <label for="metaImage" class="block text-sm font-medium text-gray-700">
                          {{ t('URL de la imagen') }}
                        </label>
                        <InputText 
                          id="metaImage" 
                          v-model="editData.metaImage" 
                          class="w-full"
                          :placeholder="t('https://ejemplo.com/imagen.jpg')"
                          @change="dirty = true" 
                        />
                      </div>
                      <ImagenSelect :images="imagesItems" @select="selectImage" />
                    </div>
                    
                    <!-- Image Preview -->
                    <div v-if="editData.metaImage" class="border-2 border-dashed rounded-lg p-4" style="border-color: var(--surface-border); background-color: var(--surface-card);">
                      <div class="text-center">
                        <p class="text-sm text-gray-600 mb-3">{{ t('Vista previa') }}</p>
                        <div class="inline-block border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                          <Image 
                            :src="editData.metaImage" 
                            width="200" 
                            height="120"
                            class="rounded"
                            :alt="t('Logo de la colección')"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="border-2 border-dashed rounded-lg p-8 text-center" style="border-color: var(--surface-border); background-color: var(--surface-card);">
                      <i class="pi pi-image text-4xl text-gray-400 mb-2"></i>
                      <p class="text-gray-500">{{ t('No hay imagen seleccionada') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </BlockUI>
  </div>
</template>
