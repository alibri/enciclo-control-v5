<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue';
import { onMounted, nextTick, onUnmounted } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import RepositoryService from '@/services/repositoryService';
import { formatSize } from '@/utils/format';
import DocumentUploader from '@/components/DocumentUploader.vue';

useAuthGuard();

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const { showMessage } = useMessages();

const repositoryService = new RepositoryService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
};

const loading = ref(false);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);
const searchTerm = ref('');
const updatedTitleId = ref<number | null>(null);

const loadData = async (showLoading: boolean = true) => {
  if (showLoading) {
    loading.value = true;
  }

  const data = getParamsData(lazyParams.value) as any;

  if (searchTerm.value) {
    data.keyword = searchTerm.value;
  }

  try {
    const response = await repositoryService.getList(data);
    if (response.error?.value?.statusCode === 403) {
      const { logUserOut } = useAuthStore();
      logUserOut();
      navigateTo('/auth/login');
      return;
    }
    if (response.data.value?.success === false) {
      showMessage('error', t('Error'), response.data.value?.message);
      return;
    }
    if (checkLogged(response)) {
      stats.value = response?.data?.value?.list?.map((item: any) => {
        item.metadata = JSON.parse(item.metadata);
        return item;
      });
      totalRecords.value = response?.data?.value?.total;
    }
  } catch (e: any) {
    showMessage('error', t('Error'), e.message);
  } finally {
    if (showLoading) {
      loading.value = false;
    }
  }
};

const exportFunction = async (data: any) => {
  return await repositoryService.exportChats(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos chat'), exportFunction);
};

const onPage = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onSort = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onFilter = (event: any) => {
  lazyParams.value.filters = filters.value;
  loadData();
};

let timer: any = null;
const isTimerPaused = ref(false);

const pauseTimer = () => {
  if (timer && !isTimerPaused.value) {
    clearInterval(timer);
    isTimerPaused.value = true;
  }
};

const resumeTimer = () => {
  if (isTimerPaused.value) {
    timer = setInterval(() => {
      loadData(false);
    }, 1000);
    isTimerPaused.value = false;
  }
};

onMounted(() => {
  resetLazyParams(dt?.value?.rows, filters.value);
  loadData();
  timer = setInterval(() => {
    loadData(false);
  }, 1000);
});


onUnmounted(() => {
  clearInterval(timer);
});

const deleteFile = async (data: any) => {
  const response = await repositoryService.deleteFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Eliminado'), t('El fichero ha sido eliminado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const regenerateFile = async (data: any) => {
  const response = await repositoryService.regenerateFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Actualizado'), t('El fichero ha sido actualizado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const viewOriginal = async (data: any) => {
  const response = await repositoryService.getFileUrl(data);
  if (response.data.value.success) {
    // Abrir el archivo en una nueva pestaña
    window.open(response.data.value.url, '_blank');
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
};

const updateTitle = async (data: any, newTitle: string) => {
  const response = await repositoryService.updateTitle({ id: data.id, title: newTitle });
  if (response.data.value.success) {
    updatedTitleId.value = data.id;
    showMessage('success', t('Actualizado'), t('El título ha sido actualizado correctamente'));
    // Resetear el tooltip después de 2 segundos
    setTimeout(() => {
      updatedTitleId.value = null;
    }, 2000);
    loadData();
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
};

const copyFilenameToTitle = (data: any, event: Event) => {
  data.title = data.original_filename.replace(/\.[^/.]+$/, '').replaceAll('_', ' ');
  // updateTitle(data, data.title);
  // Hacer focus en el InputText después de copiar
  nextTick(() => {
    const inputElement = (event.currentTarget as HTMLElement)?.parentElement?.querySelector('input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  });
};

const menu = ref();
const menuData = ref();
const items = ref<any[]>([]);

// Función para generar los items del menú basándose en el estado del item
const generateMenuItems = (data: any) => {
  const menuItems = [
    {
      label: t('Ver original'),
      icon: 'pi pi-eye',
      command: () => {
        viewOriginal(data);
      },
      class: 'text-green-500'
    },
    {
      label: t('Eliminar'),
      icon: 'pi pi-trash',
      command: () => {
        deleteFile(data);
      },
      class: 'text-red-500'
    }
  ];

  // Solo agregar "Volver a generar" si el estado es 'imported'
  if (data?.status === 'imported') {
    menuItems.push({
      label: t('Volver a generar'),
      icon: 'pi pi-refresh',
      command: () => {
        regenerateFile(data);
      },
      class: 'text-blue-500'
    });
  }

  return menuItems;
};

const toggle = (event: Event, data: any) => {
    menuData.value = data;
    // Generar los items del menú basándose en el estado del item
    items.value = generateMenuItems(data);
    menu.value.toggle(event);
};


// Funciones para manejar eventos del componente DocumentUploader
const onUploadSuccess = () => {
  loadData();
};

const onUploadError = (error: string) => {
  console.error('Error en la subida:', error);
};
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div class="mb-4 lg:mb-0">
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
          <i class="pi pi-file-o mr-2 text-blue-500"></i>
          {{ t('Repositorio de Documentos') }}
        </h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Gestión y seguimiento de documentos') }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          :label="t('Refrescar')"
          class="p-button-outlined p-button-secondary"
          @click="loadData()"
        />
        <Button 
          icon="pi pi-file-excel" 
          :label="t('Exportar')"
          class="p-button-success" 
          @click="exportData()" 
        />
      </div>
    </div>

    <div class="grid grid-cols-12 gap-8 mt-1">
      <div class="col-span-12">
        <DocumentUploader 
          :maxFileSize="100000000"
          accept=".pdf,.doc,.docx,.txt"
          :multiple="true"
          @upload-success="onUploadSuccess"
          @upload-error="onUploadError"
        />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-8 mt-1">
      <div class="col-span-12">
        <DataTable
          ref="dt"
          v-model:filters="filters"
          :value="stats"
          :paginator="true"
          :rows="25"
          :lazy="true"
          :total-records="totalRecords"
          filter-display="menu"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both"
          :rows-per-page-options="[25, 50, 100]"
          responsive-layout="scroll"
          data-key="id"
          striped-rows
          sort-mode="multiple"
          show-gridlines
          :loading="loading"
          :global-filter-fields="['user']"
          :current-page-report-template="t('show-per-page')"
          @page="onPage($event)"
          @sort="onSort($event)"
          @filter="onFilter($event)"
        >
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b" style="background-color: var(--surface-card); border-color: var(--surface-border);">
              <div class="flex items-center gap-2">
                <i class="pi pi-table text-blue-500"></i>
                <span class="font-semibold" style="color: var(--text-color);">{{ t('Lista de Documentos') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  class="p-button-outlined"
                  @click="searchTerm = ''; loadData()"
                />
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search"> </InputIcon>
                  <InputText v-model="searchTerm" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                </IconField>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center py-8" style="color: var(--text-color-secondary);">{{ t('No se han encontrado datos.') }}</div>
          </template>
          <template #loading>
            <div class="text-center py-8" style="color: var(--text-color-secondary);">{{ t('Cargando datos..') }} <i class="pi pi-spin pi-spinner" style="font-size: 2rem" /></div>
          </template>
          <Column header="#">
            <template #body="slotProps">              
              <Button type="button" icon="pi pi-ellipsis-v" @click="(e: Event) => toggle(e, slotProps.data)"
                  aria-haspopup="true" aria-controls="overlay_menu" class="p-button-sm p-button-text" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
                  <template #item="{ item, props }">
                    <a v-ripple class="flex items-center" v-bind="props.action">
                      <span :class="item.icon + ' ' + item.class" />
                      <span>{{ item.label }}</span>
                    </a>
                  </template>
                </Menu>
            </template>
          </Column>
          <Column field="id" :header="t('ID')" :sortable="true">
            <template #body="slotProps">
              <span class="text-center text-xs text-gray-800 font-bold">{{ slotProps.data.id }}</span>
            </template>
          </Column>
          <Column field="created_at" :header="t('Creado')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-gray-700">{{ formatDateTime(slotProps.data.created_at) }}</span>
            </template>
          </Column>
          <Column field="filename" :header="t('Nombre')" :sortable="true" class="text-blue-800">
            <template #body="slotProps">
              <span v-tooltip="slotProps.data.filename" class="text-blue-800">{{ slotProps.data.filename.substring(0,10) }}...</span>
            </template>
          </Column>
          <Column field="original_filename" :header="t('Fichero')" :sortable="true" class="text-blue-400" />
          <Column field="title" :header="t('Título')" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-1">
                <IconField iconPosition="left" class="flex-1">
                  <InputIcon class="pi pi-copy cursor-pointer" @click="(e: Event) => copyFilenameToTitle(slotProps.data, e)" v-tooltip="t('Copiar nombre del archivo')" />
                  <InputText
                    v-model="slotProps.data.title"
                    :placeholder="t('Sin título')"
                    class="w-full"
                    @focus="pauseTimer"
                    @blur="resumeTimer"
                    @keydown.enter="updateTitle(slotProps.data, slotProps.data.title || '')"
                  />
                </IconField>
                <Button
                  icon="pi pi-check"
                  class="p-button-sm p-button-text"
                  @click="updateTitle(slotProps.data, slotProps.data.title || '')"
                  v-tooltip="updatedTitleId === slotProps.data.id ? t('Título actualizado correctamente') : t('Actualizar título')"
                />
              </div>
            </template>
          </Column>
          <Column field="status" :header="t('Estado')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <Tag v-tooltip="slotProps.data.message" :severity="formatStatusRepository(slotProps.data.status)" class="text-sm" :value="slotProps.data.status" :icon="formatStatusRepositoryIcon(slotProps.data.status)" />
            </template>
          </Column>
          <Column field="mime_type" :header="t('Tipo')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span class="text-gray-500">{{ slotProps.data.mime_type }}</span>
            </template>
          </Column>

          <Column field="file_size" :header="t('Tamaño')" :sortable="true" class="text-right">
            <template #body="slotProps">
              <span class="text-yellow-600">{{ formatSize(slotProps.data.file_size) }}</span>
            </template>
          </Column>
          <Column field="path" :header="t('Ruta')" :sortable="true">
            <template #body="slotProps">
              <span v-tooltip="slotProps.data.path" class="text-gray-700">{{ slotProps.data.path.substring(0,10) }}...</span>
            </template>
          </Column>
          <Column field="updated_at" :header="t('Actualizado')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span class="text-sm text-gray-700">{{ formatDateTime(slotProps.data.updated_at) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
