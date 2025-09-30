<script setup lang="ts">
import Editor from 'primevue/editor';
import ImagenSelect from '~/components/ImagenSelect.vue';
import PageService from '~/services/pageService';

const pageService = new PageService();

const { showMessage } = useMessages();
const confirm = useConfirm();
const { t } = useI18n();

const loading = ref(true);
const collections = ref<any[]>([]);
const collection = ref<any>(null);
const dashboard = ref<any>(null);
const grupos = ref<any[]>([]);
const grupo = ref<any>(null);
const items = ref<any[]>([]);
const fields = ref<string[]>([]);
const editingRows = ref([]);
const dialogVisible = ref(false);
const editData = ref<any>(null);
const dirty = ref(false);
const filteredEntradas = ref<any[]>([]);
const selectedItem = ref<any>(null);
const imagesItems = ref<any[]>([]);

const fieldsDefault = {
  articulos: ['imagen', 'titulo', 'enlace', 'resumen', 'friendly', 'collection', 'id'],
  videos: ['imagen', 'titulo', 'titular', 'enlace', 'resumen', 'friendly', 'collection', 'id'],
  destacados: ['imagen', 'titulo', 'enlace', 'categoria', 'friendly', 'collection', 'id'],
  destacados2: ['imagen', 'titulo', 'categoria', 'collection', 'id'],
  efemerides: ['imagen', 'titulo', 'enlace', 'titular', 'fecha', 'fecha2', 'resumen', 'friendly', 'collection', 'id'],
  top: ['text', 'collection', 'id'],
  bottom: ['text', 'collection', 'id']
};

const loadData = async () => {
  const response = await pageService.getCollections();
  if (checkLogged(response)) {
    collections.value = response.data?.value?.collections;
    collection.value = collections.value[0] ?? null;
  }
};

const loadDashboard = async (name: string) => {
  loading.value = true;
  const response = await pageService.getDashboard(name);
  if (checkLogged(response)) {
    grupos.value = [];
    items.value = [];
    dashboard.value = response.data?.value;
    if (dashboard.value) {
      console.log('dashboard', dashboard.value);
      grupos.value = Object.keys(dashboard.value?.dashboard).map((key) => {
        return { name: key, code: key };
      });
      grupo.value = grupos?.value[0] ?? null;
      dirty.value = false;
    }
  }
  loading.value = false;
};

const openDialog = async (data: any) => {
  console.log('openDialog', data);
  editData.value = { ...data };
  if (editData.value.friendly) {
    const response = await pageService.getPageImages(editData.value.collection, editData.value.friendly);
    if (checkLogged(response)) {
      imagesItems.value = response.data?.value?.images;
    }
  } else {
    imagesItems.value = [];
  }
  selectedItem.value = null;
  dialogVisible.value = true;
};

const saveData = () => {
  dialogVisible.value = false;
  if (!editData.value.id) {
    const id = Math.floor(Math.random() * 1000) + 10000;
    editData.value.id = id;
    items.value = [{ id, ...editData.value }, ...items.value];
  } else {
    items.value = items.value.map((item) => {
      if (item.id === editData.value.id) {
        item = editData.value;
      }
      return item;
    });
  }
  dashboard.value.dashboard[grupo.value.code] = { ...items.value };
  dirty.value = true;
};

const saveDashboard = async () => {
  loading.value = true;
  const data = JSON.parse(JSON.stringify(dashboard.value.dashboard));

  const response = await pageService.saveDashboard(collection.value.name, data);
  if (checkLogged(response)) {
    dirty.value = false;
    showMessage('success', t('Guardar'), t('Fichero guardado'), 3000);
  }

  loading.value = false;
};

const refreshData = () => {
  if (dirty.value) {
    confirm.require({
      message: t('Hay cambios no guardados ¿Desea continuar?'),
      header: t('Eliminar'),
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      rejectLabel: t('Cancelar'),
      acceptLabel: t('Refrescar'),
      accept: () => {
        loadDashboard(collection.value.name);
        confirm.close();
      },
      reject: () => {
        confirm.close();
      }
    });
  } else {
    loadDashboard(collection.value.name);
  }
};

const publishData = async () => {
  if (dirty.value) {
    confirm.require({
      message: t('Hay cambios no guardados ¿Desea continuar?'),
      header: t('Eliminar'),
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      rejectLabel: t('Cancelar'),
      acceptLabel: t('Publicar'),
      accept: async () => {
        const response = await pageService.publishDashboard(collection.value.name);
        if (checkLogged(response)) {
          dirty.value = false;
          showMessage('success', t('Publicar'), t('Portada publicada'), 3000);
          loadDashboard(collection.value.name);
        }
        confirm.close();
      },
      reject: () => {
        confirm.close();
      }
    });
  } else {
    const response = await pageService.publishDashboard(collection.value.name);
    if (checkLogged(response)) {
      dirty.value = false;
      showMessage('success', t('Publicar'), t('Portada publicada'), 3000);
    }
  }
};

const previewData = () => {
  const url = getPageLink(collection.value.name, 'dashboardpreview');
  openPage(url);
};

const addNew = () => {
  openDialog({});
};

const deleteItem = (data: any) => {
  confirm.require({
    message: t('¿Desea eliminar el registro?') + ' ' + data.friendly,
    header: t('Eliminar'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: t('Cancelar'),
    acceptLabel: t('Eliminar'),
    accept: () => {
      console.log('eliminando', data.id);
      const id = parseInt(data.id);
      items.value = items.value.filter(item => item.id !== id);
      console.log('grupo', grupo.value.code);
      console.log('items', items.value);
      dashboard.value.dashboard[grupo.value.code] = { ...items.value };
      console.log('dashboard', dashboard.value?.dashboard[grupo.value.code]);

      dirty.value = true;
      confirm.close();
    },
    reject: () => {
      console.log('cancelado');
      confirm.close();
    }
  });
};

const searchEntrada = async (e: any) => {
  const query = e.query;
  const filtered: any[] = [];
  const response = await pageService.searchByTitle(collection.value.name, query);
  if (checkLogged(response)) {
    if (response.data?.value.search) {
      console.log('search', response.data?.value.search);
      response.data?.value.search.forEach((item: any) => {
        filtered.push(item);
      });
    }
  }
  filteredEntradas.value = filtered;
};

const selectImage = (image: any) => {
  console.log('selectImage', image);
  editData.value.imagen = image;
};

const cancel = ref(false);
watch(collection, async (value, oldValue) => {
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

watch(grupo, (value, oldValue) => {
  if (cancel.value) {
    cancel.value = false;
    return;
  }
  if (value === null) {
    cancel.value = true;
    grupo.value = oldValue;
  }
  if (value) {
    items.value = dashboard.value?.dashboard[value.code] ?? [];
    fields.value = [];
    let id = 1;
    if (items.value && items.value.length > 0) {
      items.value.forEach((item, index) => {
        items.value[index].id = id++;
        fields.value.push(...Object.keys(item ?? []));
      });
      fields.value = Object.keys(items.value[0] ?? []);
    }
    if (fields.value?.length === 0) {
      fields.value = fieldsDefault[value.code as keyof typeof fieldsDefault] ?? [];
    }
  }
});

watch(selectedItem, async (value) => {
  if (value?.friendly) {
    editData.value.friendly = value.friendly;
    editData.value.collection = value.collection;
    editData.value.imagen = value.image;
    editData.value.titulo = value.title;
    editData.value.resumen = value.description;

    const response = await pageService.getPageImages(value.collection, value.friendly);
    if (checkLogged(response)) {
      imagesItems.value = response.data?.value?.images;
    }
  }
});

onMounted(() => {
  loadData();
});

</script>

<template>
  <ConfirmDialog />
  <div class="min-h-screen bg-gray-50 p-4">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <h2 class="text-3xl font-bold text-gray-900">
            <i class="pi pi-desktop mr-2 text-blue-500"></i>
            {{ t('Portada') }}</h2>
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
            :label="t('Refrescar')" 
            icon="pi pi-refresh" 
            outlined 
            severity="warning"
            @click="refreshData()" 
          />
          <Button 
            :label="t('Vista previa')" 
            icon="pi pi-eye" 
            outlined 
            severity="success"
            @click="previewData()" 
          />
          <Button 
            :label="t('Guardar')" 
            icon="pi pi-save" 
            outlined 
            severity="primary"
            :disabled="!dirty"
            @click="saveDashboard()" 
          />
          <Button 
            :label="t('Publicar')" 
            icon="pi pi-upload" 
            severity="success"
            :disabled="!dirty"
            @click="publishData()" 
          />
        </div>
      </div>
    </div>

    <BlockUI :blocked="loading">
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Collection and Groups Selector Cards -->
        <div class="xl:col-span-3 space-y-4">
          <!-- Collection Selector -->
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

          <!-- Groups Selector -->
          <Card class="h-fit">
            <template #title>
              <div class="flex items-center space-x-2">
                <i class="pi pi-th-large text-green-500"></i>
                <span>{{ t('Grupos') }}</span>
              </div>
            </template>
            <template #content>
              <Listbox 
                v-model="grupo" 
                :options="grupos" 
                option-label="name" 
                class="w-full"
                :placeholder="t('Seleccionar grupo')"
              />
            </template>
          </Card>
        </div>

        <!-- Data Table Card -->
        <div class="xl:col-span-9">
          <Card>
            <template #title>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <i class="pi pi-list text-purple-500"></i>
                  <span>{{ t('Elementos') }}</span>
                  <Badge v-if="grupo" :value="grupo.name" severity="info" />
                </div>
                <Button 
                  :label="t('Agregar')" 
                  icon="pi pi-plus" 
                  severity="secondary" 
                  @click="addNew()" 
                />
              </div>
            </template>
            <template #content>
              <DataTable 
                v-model:editingRows="editingRows" 
                :value="items" 
                edit-mode="row" 
                data-key="id" 
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: function (state: any) {
                      return {
                        style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
                      };
                    }
                  }
                }"
                class="p-datatable-sm"
              >
                <Column v-if="fields.includes('imagen')" field="imagen" :header="t('Imagen')">
                  <template #body="slotProps">
                    <div class="flex justify-center">
                      <img 
                        :src="slotProps.data.imagen" 
                        class="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        :alt="slotProps.data.titulo || 'Imagen'"
                      />
                    </div>
                  </template>
                </Column>
                
                <Column v-if="fields.includes('collection')" field="collection" :header="t('Colección')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('friendly')" field="friendly" :header="t('Entrada')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                  <template #body="slotProps">
                    <PageLink :page="{ title: slotProps.data.friendly, collection: slotProps.data.collection }" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('categoria')" field="categoria" :header="t('Categoría')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('titulo')" field="titulo" :header="t('Título')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('titular')" field="titular" :header="t('Titular')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('fecha')" field="fecha" :header="t('Fecha')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('fecha2')" field="fecha2" :header="t('Fecha 2')">
                  <template #editor="{ data, field }">
                    <InputText v-model="data[field]" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('resumen')" field="resumen" :header="t('Resumen')">
                  <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" rows="2" class="w-full" />
                  </template>
                </Column>
                
                <Column v-if="fields.includes('text')" field="text" :header="t('Texto')">
                  <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" rows="2" class="w-full" />
                  </template>
                </Column>
                
                <Column style="width: 120px" body-style="text-align:center">
                  <template #body="slotProps">
                    <div class="flex justify-center space-x-1">
                      <Button 
                        icon="pi pi-pencil" 
                        size="small"
                        rounded 
                        text 
                        severity="info"
                        @click="openDialog(slotProps.data)" 
                      />
                      <Button 
                        icon="pi pi-trash" 
                        size="small"
                        rounded 
                        text 
                        severity="danger"
                        @click="deleteItem(slotProps.data)" 
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>
        </div>
      </div>
    </BlockUI>
  </div>
  <Dialog v-model:visible="dialogVisible" modal :style="{ width: '60rem' }" class="p-dialog-maximized-responsive">
    <template #header>
      <div class="flex items-center space-x-3">
        <Avatar v-if="editData.imagen" :image="editData.imagen" shape="circle" size="large" />
        <div class="flex items-center space-x-2">
          <i class="pi pi-edit text-blue-500"></i>
          <span v-if="!editData.id" class="text-red-600 font-bold text-sm">[{{ t('NUEVO') }}]</span>
          <span class="font-bold">
            <span class="text-blue-600">{{ grupo?.name }}</span>
            <i class="pi pi-chevron-right mx-2 text-gray-400"></i>
            <span class="text-gray-700">{{ editData.titulo || t('Elemento') }}</span>
          </span>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Search Section -->
      <div v-if="!fields.includes('text')" class="space-y-2">
        <label for="search" class="block text-sm font-medium text-gray-700">
          <i class="pi pi-search text-green-500 mr-2"></i>
          {{ t('Búsqueda') }}
        </label>
        <AutoComplete 
          id="search" 
          v-model="selectedItem" 
          option-label="title" 
          :suggestions="filteredEntradas"
          class="w-full" 
          :placeholder="t('Buscar entrada...')"
          @complete="searchEntrada"
        >
          <template #option="slotProps">
            <div class="flex items-center space-x-3">
              <img :src="slotProps.option.image" class="w-8 h-8 object-cover rounded" :alt="slotProps.option.title">
              <div v-html="slotProps.option.title2" class="text-sm" />
            </div>
          </template>
        </AutoComplete>
      </div>

      <!-- Image Section -->
      <div v-if="fields.includes('imagen')" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          <i class="pi pi-image text-purple-500 mr-2"></i>
          {{ t('Imagen') }}
        </h3>
        
        <div class="space-y-3">
          <div class="flex items-end space-x-3">
            <div class="flex-1 space-y-2">
              <label for="imagen" class="block text-sm font-medium text-gray-700">
                {{ t('URL de la imagen') }}
              </label>
              <InputText 
                id="imagen" 
                v-model="editData.imagen" 
                class="w-full"
                :placeholder="t('https://ejemplo.com/imagen.jpg')"
              />
            </div>
            <ImagenSelect @select="selectImage" :images="imagesItems" />
          </div>
          
          <!-- Image Preview -->
          <div v-if="editData.imagen" class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-3">{{ t('Vista previa') }}</p>
              <div class="inline-block border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                <Image :src="editData.imagen" height="80" class="rounded" :alt="editData.titulo || 'Imagen'" />
              </div>
            </div>
          </div>
          
          <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
            <i class="pi pi-image text-3xl text-gray-400 mb-2"></i>
            <p class="text-gray-500 text-sm">{{ t('No hay imagen seleccionada') }}</p>
          </div>
        </div>
      </div>

      <!-- Basic Information Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          <i class="pi pi-info-circle text-blue-500 mr-2"></i>
          {{ t('Información Básica') }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="fields.includes('collection')" class="space-y-2">
            <label for="collection" class="block text-sm font-medium text-gray-700">
              {{ t('Colección') }}
            </label>
            <InputText id="collection" v-model="editData.collection" class="w-full" />
          </div>
          
          <div v-if="fields.includes('friendly')" class="space-y-2">
            <label for="friendly" class="block text-sm font-medium text-gray-700">
              {{ t('Entrada') }}
            </label>
            <InputText id="friendly" v-model="editData.friendly" class="w-full" />
          </div>
          
          <div v-if="fields.includes('categoria')" class="space-y-2">
            <label for="categoria" class="block text-sm font-medium text-gray-700">
              {{ t('Categoría') }}
            </label>
            <InputText id="categoria" v-model="editData.categoria" class="w-full" />
          </div>
          
          <div v-if="fields.includes('titulo')" class="space-y-2">
            <label for="titulo" class="block text-sm font-medium text-gray-700">
              {{ t('Título') }} <span class="text-red-500">*</span>
            </label>
            <InputText id="titulo" v-model="editData.titulo" class="w-full" />
          </div>
          
          <div v-if="fields.includes('titular')" class="space-y-2">
            <label for="titular" class="block text-sm font-medium text-gray-700">
              {{ t('Titular') }}
            </label>
            <InputText id="titular" v-model="editData.titular" class="w-full" />
          </div>
          
          <div v-if="fields.includes('fecha')" class="space-y-2">
            <label for="fecha" class="block text-sm font-medium text-gray-700">
              {{ t('Fecha') }}
            </label>
            <InputText id="fecha" v-model="editData.fecha" class="w-full" />
          </div>
          
          <div v-if="fields.includes('fecha2')" class="space-y-2">
            <label for="fecha2" class="block text-sm font-medium text-gray-700">
              {{ t('Fecha 2') }}
            </label>
            <InputText id="fecha2" v-model="editData.fecha2" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div v-if="fields.includes('resumen') || fields.includes('text')" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          <i class="pi pi-file-edit text-green-500 mr-2"></i>
          {{ t('Contenido') }}
        </h3>
        
        <div v-if="fields.includes('resumen')" class="space-y-2">
          <label for="resumen" class="block text-sm font-medium text-gray-700">
            {{ t('Resumen') }}
          </label>
          <Textarea 
            id="resumen" 
            v-model="editData.resumen" 
            rows="4" 
            class="w-full"
            :placeholder="t('Escriba un resumen...')"
          />
        </div>
        
        <div v-if="fields.includes('text')" class="space-y-2">
          <label for="text" class="block text-sm font-medium text-gray-700">
            {{ t('Texto') }}
          </label>
          <Textarea 
            id="text" 
            v-model="editData.text" 
            rows="6" 
            class="w-full"
            :placeholder="t('Escriba el contenido...')"
          />
        </div>
        
        <div v-if="fields.includes('text')" class="space-y-2">
          <label for="html" class="block text-sm font-medium text-gray-700">
            {{ t('Editor HTML') }}
          </label>
          <Editor 
            v-model="editData.text" 
            editor-style="height: 200px" 
            class="w-full"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <Button 
          :label="t('Cancelar')" 
          icon="pi pi-times" 
          text 
          severity="danger" 
          @click="dialogVisible = false" 
        />
        <Button 
          :label="t('Guardar')" 
          icon="pi pi-save" 
          @click="saveData()" 
        />
      </div>
    </template>
  </Dialog>

</template>
